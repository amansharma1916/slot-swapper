import './App.css'
import LoginPage from './components/LoginPage'
import Register from './components/RegisterPage'
import Dashboard from './Pages/Dashboard'
import CreateEvent from './Pages/CreateEvent'
import EditEvent from './Pages/EditEvent'
import { Route, Routes } from 'react-router-dom'
import Marketplace from './Pages/Marketplace'
import Notifications from './Pages/Notifications'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </>
  )
}

export default App
