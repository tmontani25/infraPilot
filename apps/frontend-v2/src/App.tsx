import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <Sidebar />
        <main>contenu</main>
      </div>
    </div>
  )
}
export default App
