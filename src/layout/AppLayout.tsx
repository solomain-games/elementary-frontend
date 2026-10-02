import { Layout, Menu } from 'antd'
import { Link, Outlet, useLocation } from 'react-router'

const { Header, Content } = Layout

// Временное меню для переходов между заглушками; уберём, когда появятся настоящие сценарии
const menuItems = [
  { key: '/', label: <Link to="/">Вход</Link> },
  { key: '/room/DEMO', label: <Link to="/room/DEMO">Комната</Link> },
  { key: '/game/DEMO', label: <Link to="/game/DEMO">Игра</Link> },
]

function AppLayout() {
  const { pathname } = useLocation()

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Elementary</span>
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
