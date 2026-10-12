import { Route, Routes } from 'react-router'
import CardsDemoPage from './dev/CardsDemoPage.tsx'
import AppLayout from './layout/AppLayout.tsx'
import GamePage from './pages/GamePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import RoomPage from './pages/RoomPage.tsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="room/:code" element={<RoomPage />} />
        <Route path="game/:code" element={<GamePage />} />
        {/* Страницы для разработки: в собранном приложении их нет */}
        {import.meta.env.DEV && <Route path="dev/cards" element={<CardsDemoPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
