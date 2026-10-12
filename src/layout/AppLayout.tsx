import { Layout, Menu } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'

const { Header, Content } = Layout

function AppLayout() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  // Временное меню для переходов между заглушками; уберём, когда появятся настоящие сценарии.
  // Пункты собираются внутри компонента: t() должна вызываться при отрисовке, чтобы при смене
  // языка надписи обновились.
  const menuItems = [
    { key: '/', label: <Link to="/">{t('nav.login')}</Link> },
    { key: '/room/DEMO', label: <Link to="/room/DEMO">{t('nav.room')}</Link> },
    { key: '/game/DEMO', label: <Link to="/game/DEMO">{t('nav.game')}</Link> },
  ]

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
      </Header>
      <Content style={{ padding: 24 }}>
        {/* Сюда подставляется страница текущего маршрута */}
        <Outlet />
      </Content>
    </Layout>
  )
}

export default AppLayout
