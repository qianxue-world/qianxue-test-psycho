import { useI18n } from '../i18n'
import './BasicMetricDetail.css'

export interface BasicMetric {
  id: string
  name: string
  value: number
  unit: string
  icon: string
  description: string
  normalRange: string
  interpretation: string
  relatedFunctions: string[]
  references: string[]
}

interface Props {
  metric: BasicMetric
  onBack: () => void
}

export default function BasicMetricDetail({ metric, onBack }: Props) {
  const { t } = useI18n()
  
  return (
    <div className="basic-metric-detail">
      <button className="back-button" onClick={onBack}>
        {t.basicMetricDetail.backButton}
      </button>

      <header className="detail-header">
        <span className="detail-icon">{metric.icon}</span>
        <h1>{metric.name}</h1>
      </header>

      {/* 核心数值 */}
      <section className="value-section">
        <div className="value-display">
          <span className="value-number">{metric.value.toFixed(metric.unit === 'mm' ? 2 : 0)}</span>
          <span className="value-unit">{metric.unit}</span>
        </div>
        <div className="normal-range">
          <span className="range-label">{t.basicMetricDetail.referenceRange}:</span>
          <span className="range-value">{metric.normalRange}</span>
        </div>
      </section>

      {/* 指标说明 */}
      <section className="detail-section">
        <h2>{t.basicMetricDetail.metricDescription}</h2>
        <div className="description-box">
          <p>{metric.description}</p>
        </div>
      </section>

      {/* 结果解读 */}
      <section className="detail-section">
        <h2>{t.basicMetricDetail.resultInterpretation}</h2>
        <div className="interpretation-box">
          <p>{metric.interpretation}</p>
        </div>
      </section>

      {/* 相关功能 */}
      <section className="detail-section">
        <h2>{t.basicMetricDetail.relatedFunctions}</h2>
        <div className="functions-list">
          {metric.relatedFunctions.map((func, i) => (
            <div key={i} className="function-item">
              <span className="function-bullet">•</span>
              <span>{func}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 参考文献 */}
      <section className="detail-section">
        <h2>{t.basicMetricDetail.references}</h2>
        <div className="references-list">
          {metric.references.map((ref, i) => (
            <div key={i} className="reference-item">
              <span className="ref-number">[{i + 1}]</span>
              <span className="ref-text">{ref}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="detail-footer">
        <p>{t.basicMetricDetail.disclaimer}</p>
      </footer>
    </div>
  )
}
