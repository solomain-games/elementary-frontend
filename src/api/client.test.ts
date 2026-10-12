import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse } from '../test/session.ts'
import { ApiError, apiRequest, configureApiAuth } from './client.ts'

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function requestInit(fetchMock: ReturnType<typeof stubFetch>): RequestInit {
  return (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
}

describe('apiRequest', () => {
  afterEach(() => {
    configureApiAuth({ getToken: () => null, onUnauthorized: () => {} })
  })

  it('добавляет токен и отправляет JSON', async () => {
    configureApiAuth({ getToken: () => 'abc', onUnauthorized: () => {} })
    const fetchMock = stubFetch(jsonResponse({ ok: true }))

    const result = await apiRequest('/api/game/rooms', { method: 'POST', body: { a: 1 } })

    expect(result).toEqual({ ok: true })
    const init = requestInit(fetchMock)
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer abc',
      'Content-Type': 'application/json',
    })
  })

  it('с auth: false токен не добавляет', async () => {
    configureApiAuth({ getToken: () => 'abc', onUnauthorized: () => {} })
    const fetchMock = stubFetch(jsonResponse({}))

    await apiRequest('/api/auth/guest', { method: 'POST', body: {}, auth: false })

    expect(requestInit(fetchMock).headers).not.toHaveProperty('Authorization')
  })

  it('Problem Details превращается в ApiError с кодом', async () => {
    stubFetch(
      jsonResponse(
        {
          status: 400,
          detail: 'Request validation failed',
          code: 'VALIDATION_FAILED',
          errors: [{ field: 'name', message: 'must not be blank' }],
        },
        400,
      ),
    )

    const error = await apiRequest('/api/auth/guest').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'name', message: 'must not be blank' }],
      isServerUnavailable: false,
    })
  })

  it('ответ без JSON — код по HTTP-статусу', async () => {
    stubFetch(new Response('Bad Gateway', { status: 502 }))

    await expect(apiRequest('/api/x')).rejects.toMatchObject({
      code: 'HTTP_502',
      isServerUnavailable: true,
    })
  })

  it('нет ответа вовсе — NETWORK_ERROR', async () => {
    stubFetch(new TypeError('Failed to fetch'))

    await expect(apiRequest('/api/x')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      isServerUnavailable: true,
    })
  })

  it('401 на запрос с токеном — сообщает, что сессия больше не действует', async () => {
    const onUnauthorized = vi.fn()
    configureApiAuth({ getToken: () => 'expired', onUnauthorized })
    stubFetch(jsonResponse({ code: 'UNAUTHORIZED' }, 401))

    await expect(apiRequest('/api/game/cases')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
