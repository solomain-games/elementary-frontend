import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ConfigProvider задаёт язык встроенных текстов Ant Design и, позже, тему оформления */}
    <ConfigProvider locale={ruRU}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
