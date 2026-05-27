import { useState } from 'react'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import Network from './pages/Network'
import Datastore from './pages/Datastore'

type Tab = 'overview' | 'resources' | 'network' | 'datastore'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="main">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="content">
            {activeTab === 'overview'   && <Dashboard />}
            {activeTab === 'resources'  && <Resources />}
            {activeTab === 'network'    && <Network />}
            {activeTab === 'datastore'  && <Datastore />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
