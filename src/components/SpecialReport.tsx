import { useState, useEffect } from 'react'
import { runDKTAnalysis, parseDKTStats, DKTAnalysisResult, IndexResult } from '../utils/dkt'
import IndexDetail from './IndexDetail'
import { useI18n } from '../i18n'
import './SpecialReport.css'
import handIcon from '../assets/hand.png'

export default function SpecialReport() {
  const { t } = useI18n()
  const [analysis, setAnalysis] = useState<DKTAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<IndexResult | null>(null)
  const [subjectName, setSubjectName] = useState<string | null>(null)

  useEffect(() => {
    loadAndAnalyze()
  }, [])

  const loadAndAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      // 从 localStorage 读取数据
      const lhContent = localStorage.getItem('freesurfer_lhDKT')
      const rhContent = localStorage.getItem('freesurfer_rhDKT')
      const storedSubjectName = localStorage.getItem('freesurfer_subjectName')

      if (storedSubjectName) {
        setSubjectName(storedSubjectName)
      }

      if (!lhContent || !rhContent) {
        throw new Error(t.common.error)
      }

      const lhData = parseDKTStats(lhContent)
      const rhData = parseDKTStats(rhContent)
      const result = runDKTAnalysis(lhData, rhData, t)
      setAnalysis(result)
    } catch (err) {
      setError(t.common.error)
    }
    setLoading(false)
  }

  const getPercentileColor = (p: number) => {
    if (p >= 93) return '#4caf50'
    if (p >= 84) return '#8bc34a'
    if (p >= 70) return '#cddc39'
    if (p >= 30) return '#ffeb3b'
    if (p >= 16) return '#ff9800'
    return '#f44336'
  }

  const getPercentileLabel = (p: number) => {
    if (p >= 98) return t.scores.excellent
    if (p >= 93) return t.scores.good
    if (p >= 84) return t.scores.aboveAverage
    if (p >= 70) return t.scores.aboveAverage
    if (p >= 30) return t.scores.average
    if (p >= 16) return t.scores.belowAverage
    return t.scores.needsAttention
  }

  // 侧化指标：将 z-score 转换为左右偏向百分比 (50% = 平衡)
  // 根据不同指标类型使用不同的阈值范围
  const getLateralizationPercent = (value: number, type?: string): number => {
    // 根据指标类型定义左右极值范围
    let leftExtreme: number, rightExtreme: number
    
    switch (type) {
      case 'hand':
        leftExtreme = -1.28; rightExtreme = 1.28
        break
      case 'eye':
        leftExtreme = -1.5; rightExtreme = 1.5
        break
      case 'nostril':
        leftExtreme = -1.2; rightExtreme = 1.2
        break
      case 'lang':
        // 语言偏侧化：正值=左脑优势，负值=右脑优势
        // 进度条标签是：左脑 | 双侧 | 右脑，需要反转（正值在左边，负值在右边）
        leftExtreme = 0.20; rightExtreme = -0.15
        break
      case 'spatial':
        leftExtreme = -0.40; rightExtreme = 0.80
        break
      case 'emotion':
        leftExtreme = -0.50; rightExtreme = 0.90
        break
      case 'face':
        leftExtreme = -0.60; rightExtreme = 1.00
        break
      case 'music':
        leftExtreme = -0.70; rightExtreme = 1.20
        break
      case 'tom':
        leftExtreme = -0.40; rightExtreme = 0.80
        break
      case 'logic':
        // 逻辑推理：负值=左脑优势（好），正值=右脑优势
        leftExtreme = -0.80; rightExtreme = 0.50
        break
      case 'math':
        // 数学能力：负值=左脑优势（好），正值=右脑优势
        leftExtreme = -0.90; rightExtreme = 0.40
        break
      default:
        leftExtreme = -2; rightExtreme = 2
    }
    
    // 将值映射到 0-100，50 为中心
    const range = rightExtreme - leftExtreme
    const percent = ((value - leftExtreme) / range) * 100
    return Math.max(0, Math.min(100, percent))
  }

  // 侧化指标的标签
  const getLateralizationLabel = (value: number, type: 'hand' | 'eye' | 'lang' | 'nostril'): string => {
    if (type === 'hand') {
      if (value >= 1.28) return t.lateralization.extreme + ' ' + t.lateralization.rightHand
      if (value >= 0.84) return t.lateralization.strong + ' ' + t.lateralization.rightHand
      if (value >= 0.52) return t.lateralization.rightHand
      if (value >= -0.52) return t.lateralization.ambidextrous
      if (value >= -0.84) return t.lateralization.leftHand
      return t.lateralization.strong + ' ' + t.lateralization.leftHand
    } else if (type === 'eye') {
      if (value >= 1.5) return t.lateralization.extreme + ' ' + t.lateralization.rightEye
      if (value >= 0.8) return t.lateralization.strong + ' ' + t.lateralization.rightEye
      if (value >= 0.3) return t.lateralization.rightEye
      if (value >= -0.3) return t.lateralization.balanced
      if (value >= -0.8) return t.lateralization.leftEye
      return t.lateralization.strong + ' ' + t.lateralization.leftEye
    } else if (type === 'nostril') {
      if (value >= 1.2) return t.lateralization.extreme + ' ' + t.lateralization.rightNostril
      if (value >= 0.7) return t.lateralization.strong + ' ' + t.lateralization.rightNostril
      if (value >= 0.3) return t.lateralization.rightNostril
      if (value >= -0.3) return t.lateralization.balanced
      if (value >= -0.7) return t.lateralization.leftNostril
      if (value >= -1.2) return t.lateralization.strong + ' ' + t.lateralization.leftNostril
      return t.lateralization.extreme + ' ' + t.lateralization.leftNostril
    } else {
      // 语言偏侧化 - 使用描述性标签而非评价性标签
      if (value >= 0.20) return t.lateralization.typical + ' ' + t.lateralization.leftBrain  // 典型左侧化（85%人群）
      if (value >= 0.05) return t.lateralization.weak + ' ' + t.lateralization.leftBrain     // 弱左侧化
      if (value >= -0.05) return t.lateralization.bilateral                                   // 双侧化（3%人群）
      if (value >= -0.15) return t.lateralization.weak + ' ' + t.lateralization.rightBrain   // 弱右侧化
      return t.lateralization.atypical + ' ' + t.lateralization.rightBrain                   // 非典型右侧化（<0.5%）
    }
  }

  // 高级功能偏侧化指标的标签
  const getAdvancedLateralizationLabel = (value: number, type: 'spatial' | 'emotion' | 'face' | 'music' | 'tom' | 'logic' | 'math'): string => {
    if (type === 'spatial') {
      if (value >= 0.80) return t.lateralization.extreme + ' ' + t.lateralization.rightBrain
      if (value >= 0.40) return t.lateralization.strong + ' ' + t.lateralization.rightBrain
      if (value >= -0.20) return t.lateralization.balanced
      if (value >= -0.40) return t.lateralization.leftBrain
      return t.lateralization.strong + ' ' + t.lateralization.leftBrain
    } else if (type === 'emotion') {
      if (value >= 0.90) return t.lateralization.extreme + ' ' + t.lateralization.rightBrain
      if (value >= 0.50) return t.lateralization.strong + ' ' + t.lateralization.rightBrain
      if (value >= -0.30) return t.lateralization.balanced
      if (value >= -0.50) return t.lateralization.leftBrain
      return t.lateralization.strong + ' ' + t.lateralization.leftBrain
    } else if (type === 'face') {
      if (value >= 1.00) return t.lateralization.extreme + ' ' + t.lateralization.rightBrain
      if (value >= 0.60) return t.lateralization.strong + ' ' + t.lateralization.rightBrain
      if (value >= -0.20) return t.lateralization.balanced
      if (value >= -0.60) return t.lateralization.leftBrain
      return t.lateralization.strong + ' ' + t.lateralization.leftBrain
    } else if (type === 'music') {
      if (value >= 1.20) return t.lateralization.extreme + ' ' + t.lateralization.rightBrain
      if (value >= 0.70) return t.lateralization.strong + ' ' + t.lateralization.rightBrain
      if (value >= -0.30) return t.lateralization.balanced
      if (value >= -0.70) return t.lateralization.leftBrain
      return t.lateralization.strong + ' ' + t.lateralization.leftBrain
    } else if (type === 'logic') {
      // 逻辑推理（负值=左脑优势）
      if (value <= -0.80) return t.lateralization.extreme + ' ' + t.lateralization.leftBrain
      if (value <= -0.50) return t.lateralization.strong + ' ' + t.lateralization.leftBrain
      if (value <= -0.20) return t.lateralization.leftBrain
      if (value <= 0.20) return t.lateralization.balanced
      if (value <= 0.50) return t.lateralization.rightBrain
      return t.lateralization.strong + ' ' + t.lateralization.rightBrain
    } else if (type === 'math') {
      // 数学能力（负值=左脑优势）
      if (value <= -0.90) return t.lateralization.extreme + ' ' + t.lateralization.leftBrain
      if (value <= -0.60) return t.lateralization.strong + ' ' + t.lateralization.leftBrain
      if (value <= -0.20) return t.lateralization.leftBrain
      if (value <= 0.20) return t.lateralization.balanced
      if (value <= 0.40) return t.lateralization.rightBrain
      return t.lateralization.strong + ' ' + t.lateralization.rightBrain
    } else {
      // 心理理论
      if (value >= 0.80) return t.lateralization.extreme + ' ' + t.lateralization.rightBrain
      if (value >= 0.40) return t.lateralization.strong + ' ' + t.lateralization.rightBrain
      if (value >= -0.20) return t.lateralization.balanced
      if (value >= -0.40) return t.lateralization.leftBrain
      return t.lateralization.strong + ' ' + t.lateralization.leftBrain
    }
  }

  // 侧化指标的颜色（蓝色系=左脑，粉色系=右脑）
  const getLateralizationColor = (percent: number): string => {
    if (percent >= 70) return '#e91e63' // 粉红 - 强右侧
    if (percent >= 60) return '#f48fb1' // 浅粉 - 偏右
    if (percent >= 40) return '#9c27b0' // 紫色 - 平衡
    if (percent >= 30) return '#7986cb' // 浅蓝 - 偏左
    return '#3f51b5' // 蓝色 - 强左侧
  }

  // 如果选中了某个指标，显示详情页
  if (selectedIndex) {
    return <IndexDetail index={selectedIndex} onBack={() => setSelectedIndex(null)} />
  }

  if (loading) {
    return (
      <div className="special-loading">
        <div className="loading-spinner" />
        <p>{t.dkt.analyzing}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="special-error">
        <p>❌ {error}</p>
      </div>
    )
  }

  // 高级功能偏侧化指标卡片
  const renderAdvancedLateralizationCard = (index: IndexResult, idx: number, type: 'spatial' | 'emotion' | 'face' | 'music' | 'tom' | 'logic' | 'math') => {
    const percent = getLateralizationPercent(index.value, type)
    const label = getAdvancedLateralizationLabel(index.value, type)
    const color = getLateralizationColor(percent)
    
    return (
      <div 
        key={idx} 
        className="index-card-clickable lateralization-card"
        onClick={() => setSelectedIndex(index)}
      >
        <div className="card-header">
          <span className="card-name">{t.dkt.indexNames[index.name as keyof typeof t.dkt.indexNames]}</span>
          <span 
            className="card-badge"
            style={{ background: color }}
          >
            {label}
          </span>
        </div>
        <div className="card-body">
          <div className="card-score">
            <span className="score-num">{index.value}</span>
            <span className="score-label">{t.dkt.lateralizationIndex}</span>
          </div>
        </div>
        <div className="lateralization-bar">
          <div className="lat-bar-left" style={{ width: `${100 - percent}%` }} />
          <div className="lat-bar-center" />
          <div className="lat-bar-right" style={{ width: `${percent}%` }} />
          <div 
            className="lat-bar-marker"
            style={{ left: `${percent}%` }}
          />
        </div>
        <div className="lateralization-labels">
          {type === 'spatial' ? (
            <>
              <span>{t.dkt.lateralizationLabels.leftSpatial}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.rightSpatial}</span>
            </>
          ) : type === 'emotion' ? (
            <>
              <span>{t.dkt.lateralizationLabels.positiveEmotion}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.negativeEmotion}</span>
            </>
          ) : type === 'face' ? (
            <>
              <span>{t.dkt.lateralizationLabels.analytical}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.holistic}</span>
            </>
          ) : type === 'music' ? (
            <>
              <span>{t.dkt.lateralizationLabels.rhythm}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.melody}</span>
            </>
          ) : type === 'tom' ? (
            <>
              <span>{t.dkt.lateralizationLabels.verbalReasoning}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.intuitivePerception}</span>
            </>
          ) : (
            <>
              <span>{t.lateralization.leftBrain}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.lateralization.rightBrain}</span>
            </>
          )}
        </div>
        <div className="card-footer">
          <span className="card-hint">{t.common.clickForDetails}</span>
          <span className="card-arrow">→</span>
        </div>
      </div>
    )
  }

  // 侧化指标卡片（左右脑偏向）
  const renderLateralizationCard = (index: IndexResult, idx: number, type: 'hand' | 'eye' | 'lang' | 'nostril') => {
    // 语言偏侧化使用不同的百分比计算
    const percent = getLateralizationPercent(index.value, type)
    const label = getLateralizationLabel(index.value, type)
    const color = getLateralizationColor(percent)
    
    // 获取对应的 icon
    const getIcon = () => {
      switch (type) {
        case 'hand':
          return handIcon
        default:
          return null
      }
    }
    
    const icon = getIcon()
    
    return (
      <div 
        key={idx} 
        className="index-card-clickable lateralization-card"
        onClick={() => setSelectedIndex(index)}
      >
        <div className="card-header">
          {icon && <img src={icon} alt="" className="card-icon" />}
          <span className="card-name">{t.dkt.indexNames[index.name as keyof typeof t.dkt.indexNames]}</span>
          <span 
            className="card-badge"
            style={{ background: color }}
          >
            {label}
          </span>
        </div>
        <div className="card-body">
          <div className="card-score">
            <span className="score-num">{index.value}</span>
            <span className="score-label">{t.dkt.lateralizationIndex}</span>
          </div>
        </div>
        <div className="lateralization-bar">
          <div className="lat-bar-left" style={{ width: `${100 - percent}%` }} />
          <div className="lat-bar-center" />
          <div className="lat-bar-right" style={{ width: `${percent}%` }} />
          <div 
            className="lat-bar-marker"
            style={{ left: `${percent}%` }}
          />
        </div>
        <div className="lateralization-labels">
          {type === 'hand' ? (
            <>
              <span>{t.lateralization.leftHand}</span>
              <span>{t.lateralization.ambidextrous}</span>
              <span>{t.lateralization.rightHand}</span>
            </>
          ) : type === 'eye' ? (
            <>
              <span>{t.lateralization.leftEye}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.lateralization.rightEye}</span>
            </>
          ) : type === 'nostril' ? (
            <>
              <span>{t.lateralization.leftNostril}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.lateralization.rightNostril}</span>
            </>
          ) : type === 'lang' ? (
            <>
              <span>{t.lateralization.leftBrain}</span>
              <span>{t.lateralization.bilateral}</span>
              <span>{t.lateralization.rightBrain}</span>
            </>
          ) : (
            <>
              <span>{t.dkt.lateralizationLabels.leftSide}</span>
              <span>{t.lateralization.balanced}</span>
              <span>{t.dkt.lateralizationLabels.rightSide}</span>
            </>
          )}
        </div>
        <div className="card-footer">
          <span className="card-hint">{t.common.clickForDetails}</span>
          <span className="card-arrow">→</span>
        </div>
      </div>
    )
  }

  // 普通指标卡片
  const renderIndexCard = (index: IndexResult, idx: number) => (
    <div 
      key={idx} 
      className="index-card-clickable"
      onClick={() => setSelectedIndex(index)}
    >
      <div className="card-header">
        <span className="card-name">{t.dkt.indexNames[index.name as keyof typeof t.dkt.indexNames]}</span>
        <span 
          className="card-badge"
          style={{ background: getPercentileColor(index.percentile) }}
        >
          {getPercentileLabel(index.percentile)}
        </span>
      </div>
      <div className="card-body">
        <div className="card-score">
          <span className="score-num">{index.value}</span>
          <span className="score-label">{t.dkt.zScore}</span>
        </div>
        <div className="card-percentile">
          {t.dkt.top}<strong>{100 - index.percentile}%</strong>
        </div>
      </div>
      <div className="card-bar">
        <div 
          className="card-bar-fill"
          style={{ 
            width: `${index.percentile}%`,
            background: getPercentileColor(index.percentile)
          }}
        />
      </div>
      <div className="card-footer">
        <span className="card-hint">{t.common.clickForDetails}</span>
        <span className="card-arrow">→</span>
      </div>
    </div>
  )

  return (
    <div className="special-report">
      <header className="special-header">
        <h1>{t.dkt.title}</h1>
        {subjectName && (
          <p className="report-subject">
            <span className="subject-icon">👤</span>
            {t.common.subject}: <strong>{subjectName}</strong>
          </p>
        )}
        <p>{t.dkt.subtitle}</p>
      </header>

      {analysis && (
        <>
          {/* 摘要 */}
          {(analysis.summary.topStrengths.length > 0 || analysis.summary.specialFeatures.length > 0 || analysis.summary.recommendations.length > 0) && (
            <section className="summary-section">
              <div className="summary-cards">
                {analysis.summary.topStrengths.length > 0 && (
                  <div className="summary-card strengths">
                    <h3>{t.report.topStrengths}</h3>
                    <ul>
                      {analysis.summary.topStrengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.summary.specialFeatures.length > 0 && (
                  <div className="summary-card features">
                    <h3>{t.report.specialFeatures}</h3>
                    <ul>
                      {analysis.summary.specialFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.summary.recommendations.length > 0 && (
                  <div className="summary-card recommendations">
                    <h3>{t.report.recommendations}</h3>
                    <ul>
                      {analysis.summary.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 基础侧化指标: 惯用手(0), 主视眼(1), 主嗅鼻孔(2), 语言偏侧化(3) */}
          <section className="indices-section">
            <h2>{t.dkt.basicLateralization}</h2>
            <p className="section-hint">{t.dkt.basicLateralizationHint}</p>
            <div className="indices-grid">
              {renderLateralizationCard(analysis.indices[0], 0, 'hand')}
              {renderLateralizationCard(analysis.indices[1], 1, 'eye')}
              {renderLateralizationCard(analysis.indices[2], 2, 'nostril')}
              {renderLateralizationCard(analysis.indices[3], 3, 'lang')}
            </div>
          </section>

          {/* 高级功能偏侧化指标: 空间注意(4), 情绪加工(5), 面孔识别(6), 音乐感知(7), 心理理论(8), 逻辑推理(9), 数学能力(10) */}
          <section className="indices-section">
            <h2>{t.dkt.advancedLateralization}</h2>
            <p className="section-hint">{t.dkt.advancedLateralizationHint}</p>
            <div className="indices-grid">
              {renderAdvancedLateralizationCard(analysis.indices[4], 4, 'spatial')}
              {renderAdvancedLateralizationCard(analysis.indices[5], 5, 'emotion')}
              {renderAdvancedLateralizationCard(analysis.indices[6], 6, 'face')}
              {renderAdvancedLateralizationCard(analysis.indices[7], 7, 'music')}
              {renderAdvancedLateralizationCard(analysis.indices[8], 8, 'tom')}
              {renderAdvancedLateralizationCard(analysis.indices[9], 9, 'logic')}
              {renderAdvancedLateralizationCard(analysis.indices[10], 10, 'math')}
            </div>
          </section>

          {/* 感知指标: 嗅觉(11) */}
          <section className="indices-section">
            <h2>{t.dkt.sensoryFunction}</h2>
            <div className="indices-grid">
              {renderIndexCard(analysis.indices[11], 11)}
            </div>
          </section>

          {/* 语言指标: 语言综合(12), 阅读流畅(13), 阅读障碍风险(14) */}
          <section className="indices-section">
            <h2>{t.dkt.languageReading}</h2>
            <div className="indices-grid">
              {renderIndexCard(analysis.indices[12], 12)}
              {renderIndexCard(analysis.indices[13], 13)}
              {renderIndexCard(analysis.indices[14], 14)}
            </div>
          </section>

          {/* 认知指标: 共情(15), 执行功能(16), 空间加工(17), 流体智力(18) */}
          <section className="indices-section">
            <h2>{t.dkt.cognitiveAbility}</h2>
            <div className="indices-grid">
              {analysis.indices.slice(15).map((index, idx) => renderIndexCard(index, idx + 15))}
            </div>
          </section>

          {/* 方法说明 */}
          <section className="method-section">
            <h2>{t.dkt.methodology}</h2>
            <div className="method-content">
              <p><strong>{t.report.dataSource}:</strong> {t.dkt.methodologyContent.dataSource}</p>
              <p><strong>{t.report.referencePopulation}:</strong> {t.dkt.methodologyContent.referencePopulation}</p>
              <p><strong>{t.report.calculationMethod}:</strong> {t.dkt.methodologyContent.calculationMethod}</p>
              <p><strong>{t.report.advancedLateralization}:</strong> {t.dkt.methodologyContent.advancedLateralization}</p>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
