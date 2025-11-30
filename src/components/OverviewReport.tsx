import { useState, useEffect } from 'react'
import { parseDKTStats, runDKTAnalysis, DKTAnalysisResult } from '../utils/dkt'
import BasicMetricDetail, { BasicMetric } from './BasicMetricDetail'
import { useI18n } from '../i18n'
import './OverviewReport.css'

// 基础指标详情数据 - 将在组件内部使用 i18n 动态生成
const getBasicMetricsInfo = (t: any): Record<string, Omit<BasicMetric, 'value'>> => ({
  brainVol: {
    id: 'brainVol',
    name: t.overview.metrics.brainVol.name,
    unit: 'cm³',
    icon: '🧠',
    description: t.overview.metrics.brainVol.description,
    normalRange: t.overview.metrics.brainVol.normalRange,
    interpretation: t.overview.metrics.brainVol.interpretation,
    relatedFunctions: t.overview.metrics.brainVol.relatedFunctions,
    references: [
      'Pietschnig J, et al. (2015). Meta-analysis of associations between human brain volume and intelligence differences. Neuroscience & Biobehavioral Reviews.',
      'Rushton JP, Ankney CD. (2009). Whole brain size and general mental ability. International Journal of Neuroscience.'
    ]
  },
  cortexVol: {
    id: 'cortexVol',
    name: t.overview.metrics.cortexVol.name,
    unit: 'cm³',
    icon: '🔘',
    description: t.overview.metrics.cortexVol.description,
    normalRange: t.overview.metrics.cortexVol.normalRange,
    interpretation: t.overview.metrics.cortexVol.interpretation,
    relatedFunctions: t.overview.metrics.cortexVol.relatedFunctions,
    references: [
      'Kanai R, Rees G. (2011). The structural basis of inter-individual differences in human behaviour and cognition. Nature Reviews Neuroscience.',
      'Zatorre RJ, et al. (2012). Plasticity in gray and white: neuroimaging changes in brain structure during learning. Nature Neuroscience.'
    ]
  },
  whiteVol: {
    id: 'whiteVol',
    name: t.overview.metrics.whiteVol.name,
    unit: 'cm³',
    icon: '⚪',
    description: t.overview.metrics.whiteVol.description,
    normalRange: t.overview.metrics.whiteVol.normalRange,
    interpretation: t.overview.metrics.whiteVol.interpretation,
    relatedFunctions: t.overview.metrics.whiteVol.relatedFunctions,
    references: [
      'Fields RD. (2008). White matter in learning, cognition and psychiatric disorders. Trends in Neurosciences.',
      'Johansen-Berg H. (2010). Behavioural relevance of variation in white matter microstructure. Current Opinion in Neurology.'
    ]
  },
  lhThickness: {
    id: 'lhThickness',
    name: t.overview.metrics.lhThickness.name,
    unit: 'mm',
    icon: '📐',
    description: t.overview.metrics.lhThickness.description,
    normalRange: t.overview.metrics.lhThickness.normalRange,
    interpretation: t.overview.metrics.lhThickness.interpretation,
    relatedFunctions: t.overview.metrics.lhThickness.relatedFunctions,
    references: [
      'Fischl B, Dale AM. (2000). Measuring the thickness of the human cerebral cortex from magnetic resonance images. PNAS.',
      'Shaw P, et al. (2006). Intellectual ability and cortical development in children and adolescents. Nature.'
    ]
  },
  rhThickness: {
    id: 'rhThickness',
    name: t.overview.metrics.rhThickness.name,
    unit: 'mm',
    icon: '📐',
    description: t.overview.metrics.rhThickness.description,
    normalRange: t.overview.metrics.rhThickness.normalRange,
    interpretation: t.overview.metrics.rhThickness.interpretation,
    relatedFunctions: t.overview.metrics.rhThickness.relatedFunctions,
    references: [
      'Toga AW, Thompson PM. (2003). Mapping brain asymmetry. Nature Reviews Neuroscience.',
      'Gazzaniga MS. (2000). Cerebral specialization and interhemispheric communication. Brain.'
    ]
  }
})

export default function OverviewReport() {
  const { t } = useI18n()
  const [analysis, setAnalysis] = useState<DKTAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBasicMetric, setSelectedBasicMetric] = useState<BasicMetric | null>(null)
  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [basicInfo, setBasicInfo] = useState<{
    eTIV: number
    brainVol: number
    cortexVol: number
    whiteVol: number
    lhThickness: number
    rhThickness: number
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 从 localStorage 读取数据
      const lhDKT = localStorage.getItem('freesurfer_lhDKT')
      const rhDKT = localStorage.getItem('freesurfer_rhDKT')
      const lhAparc = localStorage.getItem('freesurfer_lhAparc')
      const rhAparc = localStorage.getItem('freesurfer_rhAparc')
      const aseg = localStorage.getItem('freesurfer_aseg')
      const storedSubjectName = localStorage.getItem('freesurfer_subjectName')

      if (storedSubjectName) {
        setSubjectName(storedSubjectName)
      }

      if (!lhDKT || !rhDKT || !lhAparc || !rhAparc || !aseg) {
        console.log(lhDKT, rhDKT, lhAparc, rhAparc, aseg)
        throw new Error(t.overview.error)
      }

      // 解析基础信息
      const parseValue = (content: string, key: string): number => {
        // 格式: # Measure Cortex, CortexVol, Total cortical gray matter volume, 592279.383940, mm^3
        const match = content.match(new RegExp(`# Measure[^,]*,\\s*${key}[^,]*,[^,]*,\\s*([\\d.]+)`))
        return match ? parseFloat(match[1]) : 0
      }

      const parseMeanThickness = (content: string): number => {
        const match = content.match(/# Measure Cortex, MeanThickness.*,\s*([\d.]+)/)
        return match ? parseFloat(match[1]) : 0
      }

      setBasicInfo({
        eTIV: parseValue(aseg, 'eTIV'),
        brainVol: parseValue(aseg, 'BrainSegVol'),
        cortexVol: parseValue(aseg, 'CortexVol'),
        whiteVol: parseValue(aseg, 'CerebralWhiteMatterVol'),
        lhThickness: parseMeanThickness(lhAparc),
        rhThickness: parseMeanThickness(rhAparc)
      })

      // 运行 DKT 分析
      const lhData = parseDKTStats(lhDKT)
      const rhData = parseDKTStats(rhDKT)
      const result = runDKTAnalysis(lhData, rhData, t)
      setAnalysis(result)
    } catch (err) {
      console.log(err)
      setError(t.overview.error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="overview-loading">
        <div className="loading-spinner" />
        <p>{t.overview.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="overview-error">
        <p>❌ {error}</p>
      </div>
    )
  }

  // 计算综合评分
  // 只计算"能力型"指标的加权平均，排除偏侧化指标和风险指标
  const calculateOverallScore = (): number => {
    if (!analysis) return 75
    
    // 定义能力型指标及其权重（这些指标百分位数越高越好）
    const abilityIndices = [
      { name: 'Olfactory Function Index', weight: 0.08 },           // 嗅觉功能
      { name: 'Language Composite Index', weight: 0.15 },           // 语言综合
      { name: 'Reading Fluency Index', weight: 0.12 },              // 阅读流畅
      { name: 'Empathy Index', weight: 0.12 },                      // 共情能力
      { name: 'Executive Function Index', weight: 0.18 },           // 执行功能
      { name: 'Spatial Processing Index', weight: 0.15 },           // 空间加工
      { name: 'Fluid Intelligence Index (Structural)', weight: 0.20 }, // 流体智力
    ]
    
    let totalWeight = 0
    let weightedSum = 0
    
    for (const { name, weight } of abilityIndices) {
      const index = analysis.indices.find(i => i.name === name)
      if (index) {
        weightedSum += index.percentile * weight
        totalWeight += weight
      }
    }
    
    // 阅读障碍风险指数需要特殊处理（值越高越好，即风险越低）
    const dyslexiaIndex = analysis.indices.find(i => i.name === 'Dyslexia Structural Risk Index')
    if (dyslexiaIndex) {
      // 将风险指数转换为"阅读健康度"：百分位数越高表示风险越低
      weightedSum += dyslexiaIndex.percentile * 0.10
      totalWeight += 0.10
    }
    
    if (totalWeight === 0) return 75
    
    // 计算加权平均分
    const rawScore = weightedSum / totalWeight
    
    // 将百分位数映射到更直观的评分（50分位 = 75分，84分位 = 90分，98分位 = 100分）
    // 使用非线性映射使评分更有区分度
    let finalScore: number
    if (rawScore >= 84) {
      // 84-100 百分位 -> 90-100 分
      finalScore = 90 + (rawScore - 84) * (10 / 16)
    } else if (rawScore >= 50) {
      // 50-84 百分位 -> 75-90 分
      finalScore = 75 + (rawScore - 50) * (15 / 34)
    } else if (rawScore >= 16) {
      // 16-50 百分位 -> 60-75 分
      finalScore = 60 + (rawScore - 16) * (15 / 34)
    } else {
      // 0-16 百分位 -> 40-60 分
      finalScore = 40 + rawScore * (20 / 16)
    }
    
    return Math.round(Math.min(100, Math.max(0, finalScore)))
  }

  const overallScore = calculateOverallScore()

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4caf50'
    if (score >= 70) return '#8bc34a'
    if (score >= 50) return '#ffeb3b'
    if (score >= 30) return '#ff9800'
    return '#f44336'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t.scores.excellent
    if (score >= 70) return t.scores.good
    if (score >= 50) return t.scores.average
    if (score >= 30) return t.scores.belowAverage
    return t.scores.needsAttention
  }

  // 点击基础指标
  const handleBasicMetricClick = (metricId: string, value: number) => {
    const basicMetricsInfo = getBasicMetricsInfo(t)
    const info = basicMetricsInfo[metricId]
    if (info) {
      setSelectedBasicMetric({ ...info, value })
    }
  }

  // 如果选中了基础指标，显示详情页
  if (selectedBasicMetric) {
    return <BasicMetricDetail metric={selectedBasicMetric} onBack={() => setSelectedBasicMetric(null)} />
  }

  return (
    <div className="overview-report">
      {/* 页面标题 */}
      <header className="report-header">
        <h1>{t.overview.title}</h1>
        {subjectName && (
          <p className="report-subject">
            <span className="subject-icon">👤</span>
            {t.overview.subject}: <strong>{subjectName}</strong>
          </p>
        )}
        <p className="report-date">{t.overview.generatedAt}: {new Date().toLocaleString()}</p>
      </header>

      {/* 综合评分卡片 */}
      <section className="score-section">
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor(overallScore) }}>
            <span className="score-value" style={{ color: getScoreColor(overallScore) }}>
              {overallScore}
            </span>
            <span className="score-label">{getScoreLabel(overallScore)}</span>
          </div>
          <div className="score-info">
            <h2>{t.overview.overallScore}</h2>
            <p>{t.overview.overallScoreDesc}</p>
            {analysis && analysis.summary.topStrengths.length > 0 && (
              <div className="top-strengths">
                <h3>{t.overview.topStrengths}</h3>
                <div className="strength-tags">
                  {analysis.summary.topStrengths.map((s, i) => (
                    <span key={i} className="strength-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 基础指标 - 可点击卡片 */}
      {basicInfo && (
        <section className="basic-section">
          <h2>{t.overview.basicMetrics}</h2>
          <p className="section-subtitle">{t.overview.basicMetricsSubtitle}</p>
          <div className="metrics-grid">
            <div 
              className="metric-card clickable"
              onClick={() => handleBasicMetricClick('brainVol', basicInfo.brainVol / 1000)}
            >
              <div className="metric-icon">🧠</div>
              <div className="metric-info">
                <span className="metric-value">{(basicInfo.brainVol / 1000).toFixed(0)} cm³</span>
                <span className="metric-label">{t.overview.metrics.brainVol.name}</span>
              </div>
              <span className="metric-arrow">→</span>
            </div>
            <div 
              className="metric-card clickable"
              onClick={() => handleBasicMetricClick('cortexVol', basicInfo.cortexVol / 1000)}
            >
              <div className="metric-icon">🔘</div>
              <div className="metric-info">
                <span className="metric-value">{(basicInfo.cortexVol / 1000).toFixed(0)} cm³</span>
                <span className="metric-label">{t.overview.metrics.cortexVol.name}</span>
              </div>
              <span className="metric-arrow">→</span>
            </div>
            <div 
              className="metric-card clickable"
              onClick={() => handleBasicMetricClick('whiteVol', basicInfo.whiteVol / 1000)}
            >
              <div className="metric-icon">⚪</div>
              <div className="metric-info">
                <span className="metric-value">{(basicInfo.whiteVol / 1000).toFixed(0)} cm³</span>
                <span className="metric-label">{t.overview.metrics.whiteVol.name}</span>
              </div>
              <span className="metric-arrow">→</span>
            </div>
            <div 
              className="metric-card clickable"
              onClick={() => handleBasicMetricClick('lhThickness', basicInfo.lhThickness)}
            >
              <div className="metric-icon">📐</div>
              <div className="metric-info">
                <span className="metric-value">{basicInfo.lhThickness.toFixed(2)} mm</span>
                <span className="metric-label">{t.overview.metrics.lhThickness.name}</span>
              </div>
              <span className="metric-arrow">→</span>
            </div>
            <div 
              className="metric-card clickable"
              onClick={() => handleBasicMetricClick('rhThickness', basicInfo.rhThickness)}
            >
              <div className="metric-icon">📐</div>
              <div className="metric-info">
                <span className="metric-value">{basicInfo.rhThickness.toFixed(2)} mm</span>
                <span className="metric-label">{t.overview.metrics.rhThickness.name}</span>
              </div>
              <span className="metric-arrow">→</span>
            </div>
          </div>
        </section>
      )}

      {/* 特殊特征 */}
      {analysis && analysis.summary.specialFeatures.length > 0 && (
        <section className="special-section">
          <h2>{t.overview.specialFeatures}</h2>
          <div className="special-cards">
            {analysis.summary.specialFeatures.map((feature, idx) => (
              <div key={idx} className="special-card">
                <span className="special-icon">✨</span>
                <span className="special-text">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 建议 */}
      {/* 个性化建议 */}
      {analysis && analysis.summary.recommendations.length > 0 && (
        <section className="suggestions-section">
          <h2>{t.overview.recommendations}</h2>
          <div className="suggestions-list">
            {analysis.summary.recommendations.map((rec, idx) => (
              <div key={idx} className="suggestion-item">
                <span className="suggestion-icon">💡</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 通用健康建议 */}
      <section className="general-tips-section">
        <h2>{t.overview.brainHealthTips}</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🏃</div>
            <h3>{t.overview.exercise}</h3>
            <p>{t.overview.exerciseDesc}</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📖</div>
            <h3>{t.overview.learning}</h3>
            <p>{t.overview.learningDesc}</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">😴</div>
            <h3>{t.overview.sleep}</h3>
            <p>{t.overview.sleepDesc}</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🧘</div>
            <h3>{t.overview.stress}</h3>
            <p>{t.overview.stressDesc}</p>
          </div>
        </div>
      </section>

      {/* 免责声明 */}
      <footer className="report-footer">
        <p>{t.overview.disclaimer}</p>
      </footer>
    </div>
  )
}
