import { useState, useCallback } from 'react'
import { useI18n } from '../i18n'
import './DataUpload.css'

interface Props {
  onDataUploaded: () => void
  onCancel?: () => void
}

interface FileStatus {
  fileName?: string
  isValid: boolean
  error?: string
}

interface UploadedFiles {
  lhDKT: FileStatus
  rhDKT: FileStatus
  lhAparc: FileStatus
  rhAparc: FileStatus
  aseg: FileStatus
}

// 文件类型配置
const fileTypesConfig = [
  { key: 'lhDKT', pattern: /lh\.aparc\.DKTatlas\.stats$/i, hint: 'lh.aparc.DKTatlas.stats', required: true },
  { key: 'rhDKT', pattern: /rh\.aparc\.DKTatlas\.stats$/i, hint: 'rh.aparc.DKTatlas.stats', required: true },
  { key: 'lhAparc', pattern: /lh\.aparc\.stats$/i, hint: 'lh.aparc.stats', required: true },
  { key: 'rhAparc', pattern: /rh\.aparc\.stats$/i, hint: 'rh.aparc.stats', required: true },
  { key: 'aseg', pattern: /aseg\.stats$/i, hint: 'aseg.stats', required: true },
] as const

// 根据文件名自动识别文件类型
function detectFileType(fileName: string): keyof UploadedFiles | null {
  for (const ft of fileTypesConfig) {
    if (ft.pattern.test(fileName)) {
      return ft.key as keyof UploadedFiles
    }
  }
  return null
}

// 从文件内容中提取 subjectname
function extractSubjectName(content: string): string | null {
  const match = content.match(/^#\s*subjectname\s+(.+)$/m)
  return match ? match[1].trim() : null
}

// 解析 GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string; path: string } | null {
  // 支持格式:
  // https://github.com/owner/repo/blob/branch/path/to/folder
  // https://github.com/owner/repo/tree/branch/path/to/folder
  // https://github.com/owner/repo/blob/branch/path/to/file.stats (自动提取上级目录)
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/(blob|tree)\/([^/]+)\/(.+)/)
  if (match) {
    let path = match[5].replace(/\/$/, '') // 移除末尾斜杠
    
    // 如果路径以 .stats 结尾，说明用户提供的是文件 URL，自动提取上级目录
    if (path.endsWith('.stats')) {
      const lastSlash = path.lastIndexOf('/')
      if (lastSlash > 0) {
        path = path.substring(0, lastSlash)
      }
    }
    
    return {
      owner: match[1],
      repo: match[2],
      branch: match[4],
      path
    }
  }
  return null
}

// GitHub API 响应类型
interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

export default function DataUpload({ onDataUploaded, onCancel }: Props) {
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    lhDKT: { isValid: false },
    rhDKT: { isValid: false },
    lhAparc: { isValid: false },
    rhAparc: { isValid: false },
    aseg: { isValid: false },
  })
  const [isDraggingFolder, setIsDraggingFolder] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [subjectNames, setSubjectNames] = useState<Record<string, string>>({})
  const [subjectNameWarning, setSubjectNameWarning] = useState<string | null>(null)
  
  // 文件类型配置（使用 t 函数）
  const fileTypes = [
    { key: 'lhDKT', label: t.upload.fileLabels.lhDKT, pattern: /lh\.aparc\.DKTatlas\.stats$/i, hint: 'lh.aparc.DKTatlas.stats', required: true },
    { key: 'rhDKT', label: t.upload.fileLabels.rhDKT, pattern: /rh\.aparc\.DKTatlas\.stats$/i, hint: 'rh.aparc.DKTatlas.stats', required: true },
    { key: 'lhAparc', label: t.upload.fileLabels.lhAparc, pattern: /lh\.aparc\.stats$/i, hint: 'lh.aparc.stats', required: true },
    { key: 'rhAparc', label: t.upload.fileLabels.rhAparc, pattern: /rh\.aparc\.stats$/i, hint: 'rh.aparc.stats', required: true },
    { key: 'aseg', label: t.upload.fileLabels.aseg, pattern: /aseg\.stats$/i, hint: 'aseg.stats', required: true },
  ] as const
  
  // 验证文件名是否匹配期望的类型
  const validateFileName = useCallback((fileName: string, expectedType: keyof UploadedFiles): { isValid: boolean; error?: string } => {
    const expectedConfig = fileTypes.find(f => f.key === expectedType)
    if (!expectedConfig) return { isValid: false, error: t.upload.errors.unknownFileType }
    
    // 检查是否匹配期望的模式
    if (expectedConfig.pattern.test(fileName)) {
      return { isValid: true }
    }
    
    // 检查是否是其他类型的文件（用户可能拖错了）
    const detectedType = detectFileType(fileName)
    if (detectedType) {
      const detectedConfig = fileTypes.find(f => f.key === detectedType)
      return { 
        isValid: false, 
        error: t.upload.errors.wrongFileType.replace('{detected}', detectedConfig?.label || '').replace('{expected}', expectedConfig.label)
      }
    }
    
    // 检查常见错误：lh/rh 混淆
    if (expectedType.startsWith('lh') && fileName.includes('rh.')) {
      return { isValid: false, error: t.upload.errors.needsLeftHemisphere }
    }
    if (expectedType.startsWith('rh') && fileName.includes('lh.')) {
      return { isValid: false, error: t.upload.errors.needsRightHemisphere }
    }
    
    return { isValid: false, error: t.upload.errors.fileNameMismatch.replace('{expected}', expectedConfig.hint) }
  }, [t, fileTypes])

  const handleFileUpload = useCallback(async (file: File, type: keyof UploadedFiles) => {
    try {
      setError(null)
      
      // 验证文件名
      const validation = validateFileName(file.name, type)
      if (!validation.isValid) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: { fileName: file.name, isValid: false, error: validation.error }
        }))
        return
      }
      
      const text = await file.text()
      
      // 验证文件内容格式
      if (!text.includes('# Measure')) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: { fileName: file.name, isValid: false, error: t.upload.errors.invalidFormat }
        }))
        return
      }

      // 提取 subjectname
      const subjectName = extractSubjectName(text)
      if (subjectName) {
        setSubjectNames(prev => {
          const newNames = { ...prev, [type]: subjectName }
          // 检查所有已上传文件的 subjectname 是否一致
          const uniqueNames = [...new Set(Object.values(newNames))]
          if (uniqueNames.length > 1) {
            setSubjectNameWarning(`${t.upload.warningDifferentSubjects}: ${uniqueNames.join(', ')}`)
          } else {
            setSubjectNameWarning(null)
          }
          // 保存主 subjectname 到 localStorage
          localStorage.setItem('freesurfer_subjectName', subjectName)
          return newNames
        })
      }

      // 保存到 localStorage
      localStorage.setItem(`freesurfer_${type}`, text)
      setUploadedFiles(prev => ({
        ...prev,
        [type]: { fileName: file.name, isValid: true }
      }))
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : t.upload.errors.uploadFailed)
    }
  }, [t, validateFileName])

  // 处理文件夹拖拽 - 递归读取所有文件
  const processEntry = useCallback(async (entry: FileSystemEntry): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        (entry as FileSystemFileEntry).file((file) => {
          resolve([file])
        }, () => resolve([]))
      })
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader()
      return new Promise((resolve) => {
        const allFiles: File[] = []
        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve(allFiles)
            } else {
              for (const e of entries) {
                const files = await processEntry(e)
                allFiles.push(...files)
              }
              readEntries()
            }
          }, () => resolve(allFiles))
        }
        readEntries()
      })
    }
    return []
  }, [])

  // 自动匹配并上传文件
  const autoMatchAndUpload = useCallback(async (files: File[]) => {
    let matchedCount = 0
    
    for (const file of files) {
      const detectedType = detectFileType(file.name)
      if (detectedType) {
        await handleFileUpload(file, detectedType)
        matchedCount++
      }
    }
    
    if (matchedCount === 0 && files.length > 0) {
      setError(t.upload.errors.noMatchingFiles)
    } else if (matchedCount > 0) {
      setError(null)
    }
  }, [t, handleFileUpload])

  // 从 GitHub 导入文件
  const handleGitHubImport = useCallback(async () => {
    if (!githubUrl.trim()) {
      setError(t.upload.errors.enterGitHubUrl)
      return
    }

    const parsed = parseGitHubUrl(githubUrl.trim())
    if (!parsed) {
      setError(t.upload.errors.invalidGitHubUrl)
      return
    }

    setIsLoadingGithub(true)
    setError(null)

    try {
      // 获取文件夹内容
      const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}?ref=${parsed.branch}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t.upload.errors.pathNotFound)
        } else if (response.status === 403) {
          throw new Error(t.upload.errors.apiRateLimit)
        }
        throw new Error(`${t.upload.errors.apiError}: ${response.status}`)
      }

      const files: GitHubFile[] = await response.json()
      
      if (!Array.isArray(files)) {
        throw new Error(t.upload.errors.notAFolder)
      }

      // 筛选出 stats 文件
      const statsFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.stats'))
      
      if (statsFiles.length === 0) {
        throw new Error(t.upload.errors.noStatsFiles)
      }

      let matchedCount = 0

      // 下载并处理每个匹配的文件
      for (const file of statsFiles) {
        const detectedType = detectFileType(file.name)
        if (detectedType && file.download_url) {
          try {
            const fileResponse = await fetch(file.download_url)
            const text = await fileResponse.text()
            
            // 验证文件内容格式
            if (!text.includes('# Measure')) {
              setUploadedFiles(prev => ({
                ...prev,
                [detectedType]: { fileName: file.name, isValid: false, error: t.upload.errors.invalidFormat }
              }))
              continue
            }

            // 提取 subjectname
            const subjectName = extractSubjectName(text)
            if (subjectName) {
              setSubjectNames(prev => {
                const newNames = { ...prev, [detectedType]: subjectName }
                const uniqueNames = [...new Set(Object.values(newNames))]
                if (uniqueNames.length > 1) {
                  setSubjectNameWarning(`${t.upload.warningDifferentSubjects}: ${uniqueNames.join(', ')}`)
                } else {
                  setSubjectNameWarning(null)
                }
                localStorage.setItem('freesurfer_subjectName', subjectName)
                return newNames
              })
            }

            // 保存到 localStorage
            localStorage.setItem(`freesurfer_${detectedType}`, text)
            setUploadedFiles(prev => ({
              ...prev,
              [detectedType]: { fileName: file.name, isValid: true }
            }))
            matchedCount++
          } catch {
            setUploadedFiles(prev => ({
              ...prev,
              [detectedType]: { fileName: file.name, isValid: false, error: t.upload.errors.downloadFailed }
            }))
          }
        }
      }

      if (matchedCount === 0) {
        setError(t.upload.errors.noMatchingFiles)
      } else {
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.upload.errors.githubImportFailed)
    } finally {
      setIsLoadingGithub(false)
    }
  }, [t, githubUrl])

  // 处理文件夹拖拽区域的拖放
  const handleFolderDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFolder(false)
    
    const items = e.dataTransfer.items
    const allFiles: File[] = []
    
    // 使用 webkitGetAsEntry 来支持文件夹
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        const files = await processEntry(entry)
        allFiles.push(...files)
      } else if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) allFiles.push(file)
      }
    }
    
    await autoMatchAndUpload(allFiles)
  }, [processEntry, autoMatchAndUpload])

  const handleDrop = (e: React.DragEvent, type: keyof UploadedFiles) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: keyof UploadedFiles) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  const canProceed = uploadedFiles.lhDKT.isValid && uploadedFiles.rhDKT.isValid && 
                     uploadedFiles.lhAparc.isValid && uploadedFiles.rhAparc.isValid && 
                     uploadedFiles.aseg.isValid

  const handleProceed = () => {
    if (canProceed) {
      onDataUploaded()
    }
  }

  const clearData = () => {
    fileTypesConfig.forEach(f => localStorage.removeItem(`freesurfer_${f.key}`))
    localStorage.removeItem('freesurfer_subjectName')
    setUploadedFiles({
      lhDKT: { isValid: false },
      rhDKT: { isValid: false },
      lhAparc: { isValid: false },
      rhAparc: { isValid: false },
      aseg: { isValid: false },
    })
    setSubjectNames({})
    setSubjectNameWarning(null)
    setError(null)
  }

  const uploadedCount = Object.values(uploadedFiles).filter(f => f.isValid).length

  return (
    <div className="data-upload">
      <div className="upload-header">
        <h1>{t.upload.title}</h1>
        <p>{t.upload.subtitle}</p>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {subjectNameWarning && <div className="warning-message">⚠️ {subjectNameWarning}</div>}
      
      {/* 显示检测到的被试名称 */}
      {Object.keys(subjectNames).length > 0 && !subjectNameWarning && (
        <div className="subject-info">
          <span className="subject-icon">👤</span>
          <span>{t.upload.subject}: <strong>{Object.values(subjectNames)[0]}</strong></span>
        </div>
      )}

      {/* GitHub 导入区域 */}
      <div className="github-import-section">
        <div className="github-header">
          <span className="github-icon">🔗</span>
          <h3>{t.upload.githubImport}</h3>
        </div>
        <div className="github-input-row">
          <input
            type="text"
            className="github-url-input"
            placeholder={t.upload.githubPlaceholder}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGitHubImport()}
          />
          <button 
            className={`github-import-button ${isLoadingGithub ? 'loading' : ''}`}
            onClick={handleGitHubImport}
            disabled={isLoadingGithub}
          >
            {isLoadingGithub ? t.upload.importing : t.upload.importButton}
          </button>
        </div>
      </div>

      <div className="divider">
        <span>{t.upload.orDragLocalFolder}</span>
      </div>

      {/* 文件夹拖拽区域 */}
      <div 
        className={`folder-drop-zone ${isDraggingFolder ? 'dragging' : ''}`}
        onDrop={handleFolderDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingFolder(true) }}
        onDragLeave={() => setIsDraggingFolder(false)}
      >
        <div className="folder-drop-content">
          <span className="folder-icon">📂</span>
          <h3>{t.upload.dragFolder}</h3>
          <p>{t.upload.dragFolderHint}</p>
          <p className="folder-hint">{t.upload.recognizedFiles} {uploadedCount}/5 {t.upload.fileDescription}</p>
        </div>
      </div>

      <div className="divider">
        <span>{t.upload.orUploadIndividually}</span>
      </div>

      <div className="upload-grid">
        {fileTypes.map(({ key, label, hint }) => {
          const fileStatus = uploadedFiles[key as keyof UploadedFiles]
          const hasFile = fileStatus.fileName
          const isValid = fileStatus.isValid
          const hasError = fileStatus.error
          
          return (
            <div key={key} className="upload-card">
              <h3>{label}</h3>
              <div 
                className={`drop-zone ${isValid ? 'uploaded' : ''} ${hasError ? 'error' : ''}`}
                onDrop={(e) => handleDrop(e, key as keyof UploadedFiles)}
                onDragOver={(e) => e.preventDefault()}
              >
                {hasFile ? (
                  <div className="uploaded-info">
                    <span className={`status-icon ${isValid ? 'valid' : 'invalid'}`}>
                      {isValid ? '✅' : '❌'}
                    </span>
                    <span className="file-name">{fileStatus.fileName}</span>
                    {hasError && <span className="error-hint">{fileStatus.error}</span>}
                  </div>
                ) : (
                  <>
                    <div className="drop-icon">📁</div>
                    <p>{t.upload.dragOrClick}</p>
                    <p className="file-hint">{hint}</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".stats,.txt"
                  onChange={(e) => handleFileSelect(e, key as keyof UploadedFiles)}
                  className="file-input"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="upload-actions">
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            {t.common.back}
          </button>
        )}
        <button className="clear-button" onClick={clearData} disabled={uploadedCount === 0}>
          {t.upload.clearData}
        </button>
        <button className={`proceed-button ${canProceed ? 'ready' : ''}`} onClick={handleProceed} disabled={!canProceed}>
          {canProceed ? t.upload.startAnalysis : `${t.upload.uploadAllFiles} (${uploadedCount}/5)`}
        </button>
      </div>

      <div className="upload-help">
        <h4>{t.upload.helpSection.title}</h4>
        <ul>
          <li><strong>{t.upload.helpSection.lhrhDKT}</strong></li>
          <li><strong>{t.upload.helpSection.lhrhAparc}</strong></li>
          <li><strong>{t.upload.helpSection.aseg}</strong></li>
        </ul>
        <p>{t.upload.helpSection.locationHint}</p>
        <p>{t.upload.helpSection.folderDragHint}</p>
      </div>
    </div>
  )
}
