import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useProviders } from './providerContext'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import VMDetail from './pages/VMDetail'
import Network from './pages/Network'
import Datastore from './pages/Datastore'
import Deployments from './pages/Deployments'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import IndependentProjects from './pages/IndependentProjects'
import ProjectDetail from './pages/ProjectDetail'
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
  const { activeProviderId } = useProviders()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* key sur activeProviderId : force un remount (et donc un refetch) quand on
              change de compte cloud via la topbar alors qu'on est déjà sur l'overview */}
          <Route path="/" element={<Dashboard key={activeProviderId} />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<VMDetail />} />
          <Route path="/network" element={<Network />} />
          <Route path="/datastore" element={<Datastore />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:clientId" element={<ClientDetail />} />
          <Route path="/projects/independent" element={<IndependentProjects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
