import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import OverviewReport from './components/OverviewReport'
import SpecialReport from './components/SpecialReport'
import DataUpload from './components/DataUpload'
import LanguageSwitcher from './components/LanguageSwitcher'
import { I18nContext, translations, Language } from './i18n'
import './App.css'

type PageType = 'overview' | 'special'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('overview')
  const [hasData, setHasData] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('brainstats_language')
    return (saved as Language) || 'zh'
  })

  useEffect(() => {
    localStorage.setItem('brainstats_language', language)
  }, [language])

  useEffect(() => {
    // 检查是否已有上传的数据
    const requiredKeys = ['lhDKT', 'rhDKT', 'lhAparc', 'rhAparc', 'aseg']
    const allPresent = requiredKeys.every(key => localStorage.getItem(`freesurfer_${key}`))
    setHasData(allPresent)
  }, [])

  const handleDataUploaded = () => {
    setHasData(true)
    setShowUpload(false)
  }

  const handleReupload = () => {
    setShowUpload(true)
  }

  const i18nValue = {
    language,
    setLanguage,
    t: translations[language],
  }

  // 首次没有数据或用户点击重新上传
  if (!hasData || showUpload) {
    return (
      <I18nContext.Provider value={i18nValue}>
        <div className="upload-page">
          <div className="upload-language-switcher">
            <LanguageSwitcher />
          </div>
          <DataUpload 
            onDataUploaded={handleDataUploaded} 
            onCancel={hasData ? () => setShowUpload(false) : undefined}
          />
        </div>
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-container">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="main-content">
          <div className="top-bar">
            <button className="reupload-btn" onClick={handleReupload} title={i18nValue.t.sidebar.upload}>
              📤 {i18nValue.t.sidebar.upload}
            </button>
            <LanguageSwitcher />
          </div>
          {currentPage === 'overview' && <OverviewReport />}
          {currentPage === 'special' && <SpecialReport />}
        </main>
      </div>
    </I18nContext.Provider>
  )
}

export default App
