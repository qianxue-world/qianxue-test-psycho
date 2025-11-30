import { useI18n } from '../i18n'
import './Sidebar.css'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: 'overview' | 'special') => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { t } = useI18n()
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo"></span>
        <h1>{t.sidebar.title}</h1>
      </div>
      
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'overview' ? 'active' : ''}`}
          onClick={() => onPageChange('overview')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">{t.sidebar.overview}</span>
        </button>
        
        <button
          className={`nav-item ${currentPage === 'special' ? 'active' : ''}`}
          onClick={() => onPageChange('special')}
        >
          <span className="nav-icon">🔬</span>
          <span className="nav-text">{t.sidebar.special}</span>
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <p>FreeSurfer 8.0</p>
        <p>DKT Atlas</p>
      </div>
    </aside>
  )
}
