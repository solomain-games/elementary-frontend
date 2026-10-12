import { Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider.tsx'
import RequireAuth from './auth/RequireAuth.tsx'
import CardsDemoPage from './dev/CardsDemoPage.tsx'
import AppLayout from './layout/AppLayout.tsx'
import GamePage from './pages/GamePage.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import RoomPage from './pages/RoomPage.tsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="login" element={<LoginPage />} />
          {/* Всё внутри — только после входа */}
          <Route element={<RequireAuth />}>
            <Route index element={<HomePage />} />
            <Route path="room/:code" element={<RoomPage />} />
            <Route path="game/:code" element={<GamePage />} />
          </Route>
          {/* Страницы для разработки: в собранном приложении их нет */}
          {import.meta.env.DEV && <Route path="dev/cards" element={<CardsDemoPage />} />}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
