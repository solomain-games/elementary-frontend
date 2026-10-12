import { Button, Layout, Menu } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth.ts'

const { Header, Content } = Layout

function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { session, logout } = useAuth()

  // Временное меню для переходов между заглушками; уберём, когда появятся настоящие сценарии.
  // Пункты собираются внутри компонента: t() должна вызываться при отрисовке, чтобы при смене
  // языка надписи обновились.
  const menuItems = [
    { key: '/', label: <Link to="/">{t('nav.home')}</Link> },
    { key: '/room/DEMO', label: <Link to="/room/DEMO">{t('nav.room')}</Link> },
    { key: '/game/DEMO', label: <Link to="/game/DEMO">{t('nav.game')}</Link> },
    // Страница для разработки, только в dev-режиме
    ...(import.meta.env.DEV
      ? [{ key: '/dev/cards', label: <Link to="/dev/cards">{t('nav.cards')}</Link> }]
      : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>{t('app.name')}</span>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        {session && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
            {session.user.name}
            <Button ghost size="small" onClick={handleLogout}>
              {t('auth.logout')}
            </Button>
          </span>
        )}
      </Header>
      <Content style={{ padding: 24 }}>
        {/* Сюда подставляется страница текущего маршрута */}
        <Outlet />
      </Content>
    </Layout>
  )
}

export default AppLayout
