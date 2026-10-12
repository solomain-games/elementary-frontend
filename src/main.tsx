import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './i18n/index.ts'
import LocalizedConfigProvider from './i18n/LocalizedConfigProvider.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Язык встроенных текстов Ant Design следует за языком интерфейса; позже здесь же будет тема */}
    <LocalizedConfigProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LocalizedConfigProvider>
  </StrictMode>,
)
