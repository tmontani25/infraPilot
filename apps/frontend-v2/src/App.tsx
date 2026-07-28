import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import VMDetail from './pages/VMDetail'
import Network from './pages/Network'
import Datastore from './pages/Datastore'
import Deployments from './pages/Deployments'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function MainLayout() {
  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <Sidebar />
        <div className="main">
          <TabBar />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<VMDetail />} />
          <Route path="/network" element={<Network />} />
          <Route path="/datastore" element={<Datastore />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
