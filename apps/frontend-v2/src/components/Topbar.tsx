import './Topbar.css'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="tb-logo">
        <div className="mark">IP</div>
        <div>
          <div className="tb-brand">Infrapilot</div>
          <div className="tb-sub">Infrastructure Management</div>
        </div>
      </div>
      <div className="tb-search">
        <i className="ti ti-search" />
        <input placeholder="Search..." />
      </div>
      <div className="spacer" />
      <div className="tb-live">
        <span className="dot" />
        Live
      </div>
      <div className="tb-user">
        <div className="tb-avatar">AL</div>
        Admin
      </div>
    </header>
  )
}
