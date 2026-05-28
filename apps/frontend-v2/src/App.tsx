import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import VMDetail from './pages/VMDetail'
import Network from './pages/Network'
import Datastore from './pages/Datastore'

function App() {
  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <Sidebar />
        <div className="main">
          <TabBar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/:id" element={<VMDetail />} />
              <Route path="/network" element={<Network />} />
              <Route path="/datastore" element={<Datastore />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
