import { Route, Routes } from 'react-router'
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
