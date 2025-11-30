/**
 * Advanced Functional Lateralization Indices
 * Based on ENIGMA + UKBB + HCP 2024-2025 meta-analysis (n>120,000)
 */

import { DKTData, IndexResult, RegionDetail, REFERENCE_DATA_MALE, compositeZScore, zToPercentile } from './types'
import {
  getSpatialAttentionInterpretation,
  getEmotionLateralizationInterpretation,
  getFaceRecognitionInterpretation,
  getMusicLateralizationInterpretation,
  getTheoryOfMindInterpretation,
  getLogicalReasoningInterpretation,
  getMathematicalAbilityInterpretation,
  getDyslexiaRiskInterpretation
} from '../interpretations'

/**
 * Spatial Attention Lateralization Index
 */
export function calculateSpatialAttentionLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'inferiorparietal', weight: 0.45, metricWeights: [20, 50, 30] as [number, number, number] },
    { name: 'superiorparietal', weight: 0.35, metricWeights: [20, 50, 30] as [number, number, number] },
    { name: 'precuneus', weight: 0.20, metricWeights: [25, 45, 30] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Spatial Attention Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getSpatialAttentionInterpretation(totalIndex, t) : "",
    threshold: '≥+0.80 extreme right (top 5%); ≥+0.40 strong right (top 15%); -0.20~+0.40 balanced; ≤-0.40 left',
    formula: 'LI_spatial = Σ wᵢ(zRᵢ − zLᵢ)',
    references: ['ENIGMA 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['inferiorparietal (45%)', 'superiorparietal (35%)', 'precuneus (20%)'],
    weights: 'Thickness 20 : Surface Area 50 : Volume 30',
    details
  }
}

/**
 * Emotion Processing Lateralization Index
 */
export function calculateEmotionLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'insula', weight: 0.40, metricWeights: [70, 20, 10] as [number, number, number] },
    { name: 'medialorbitofrontal', weight: 0.30, metricWeights: [65, 25, 10] as [number, number, number] },
    { name: 'rostralanteriorcingulate', weight: 0.20, metricWeights: [70, 20, 10] as [number, number, number] },
    { name: 'posteriorcingulate', weight: 0.10, metricWeights: [65, 25, 10] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Emotion Processing Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getEmotionLateralizationInterpretation(totalIndex, t) : "",
    threshold: '≥+0.90 extreme right (top 8%); ≥+0.50 strong right; -0.30~+0.50 balanced; ≤-0.50 left (depression tendency)',
    formula: 'LI_emotion = Σ wᵢ(zRᵢ − zLᵢ)',
    references: ['ENIGMA 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['insula (40%)', 'medialorbitofrontal (30%)', 'rostralanteriorcingulate (20%)', 'posteriorcingulate (10%)'],
    weights: 'Thickness 65-70 : Surface Area 20-25 : Volume 10',
    details
  }
}

/**
 * Face Recognition Lateralization Index
 */
export function calculateFaceRecognitionLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'fusiform', weight: 0.70, metricWeights: [40, 20, 40] as [number, number, number] },
    { name: 'inferiortemporal', weight: 0.20, metricWeights: [45, 25, 30] as [number, number, number] },
    { name: 'lateraloccipital', weight: 0.10, metricWeights: [40, 30, 30] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Face Recognition Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getFaceRecognitionInterpretation(totalIndex, t) : "",
    threshold: '≥+1.00 extreme right (top 3%); ≥+0.60 strong right (top 10%); -0.20~+0.60 balanced; ≤-0.60 rare left',
    formula: 'LI_face = Σ wᵢ(zRᵢ − zLᵢ)',
    references: ['ENIGMA 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['fusiform/FFA (70%)', 'inferiortemporal (20%)', 'lateraloccipital (10%)'],
    weights: 'Thickness 40-45 : Surface Area 20-30 : Volume 30-40',
    details
  }
}

/**
 * Music Perception Lateralization Index
 */
export function calculateMusicLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'superiortemporal', weight: 0.70, metricWeights: [65, 25, 10] as [number, number, number] },
    { name: 'middletemporal', weight: 0.20, metricWeights: [60, 25, 15] as [number, number, number] },
    { name: 'insula', weight: 0.10, metricWeights: [55, 30, 15] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Music Perception Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getMusicLateralizationInterpretation(totalIndex, t) : "",
    threshold: '≥+1.20 extreme right (top 1%); ≥+0.70 strong right (top 8%); -0.30~+0.70 balanced; ≤-0.70 left (rare)',
    formula: 'LI_music = Σ wᵢ(zRᵢ − zLᵢ)',
    references: ['ENIGMA 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['superiortemporal (70%)', 'middletemporal (20%)', 'insula (10%)'],
    weights: 'Thickness 55-65 : Surface Area 25-30 : Volume 10-15',
    details
  }
}

/**
 * Theory of Mind Lateralization Index
 */
export function calculateTheoryOfMindLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'inferiorparietal', weight: 0.40, metricWeights: [55, 30, 15] as [number, number, number] },
    { name: 'supramarginal', weight: 0.30, metricWeights: [50, 35, 15] as [number, number, number] },
    { name: 'superiortemporal', weight: 0.20, metricWeights: [60, 25, 15] as [number, number, number] },
    { name: 'medialorbitofrontal', weight: 0.10, metricWeights: [65, 20, 15] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Theory of Mind Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getTheoryOfMindInterpretation(totalIndex, t) : "",
    threshold: '≥+0.80 extreme right (top 8%); ≥+0.40 strong right (top 20%); -0.20~+0.40 balanced; ≤-0.40 left',
    formula: 'LI_tom = Σ wᵢ(zRᵢ − zLᵢ)',
    references: ['ENIGMA 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['inferiorparietal/angular (40%)', 'supramarginal (30%)', 'superiortemporal/TPJ (20%)', 'medialorbitofrontal (10%)'],
    weights: 'Thickness 50-65 : Surface Area 20-35 : Volume 15',
    details
  }
}

/**
 * Logical Reasoning Lateralization Index
 */
export function calculateLogicalReasoningLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'rostralmiddlefrontal', weight: 0.40, metricWeights: [30, 30, 40] as [number, number, number] },
    { name: 'caudalmiddlefrontal', weight: 0.25, metricWeights: [35, 25, 40] as [number, number, number] },
    { name: 'superiorfrontal', weight: 0.20, metricWeights: [25, 35, 40] as [number, number, number] },
    { name: 'inferiorparietal', weight: 0.15, metricWeights: [50, 30, 20] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Logical Reasoning Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getLogicalReasoningInterpretation(totalIndex, t) : "",
    threshold: '≤-0.80 extreme left (top 1%); ≤-0.50 strong left (top 5%); ≤-0.20 mild left (top 20%); ±0.20 balanced; ≥+0.50 right dominance',
    formula: 'LI_logic = Σ wᵢ(zRᵢ − zLᵢ)  negative=left brain dominance',
    references: ['ENIGMA-Cognition 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['rostralmiddlefrontal (40%)', 'caudalmiddlefrontal (25%)', 'superiorfrontal (20%)', 'inferiorparietal (15%)'],
    weights: 'Independent weights per region, see details',
    details
  }
}

/**
 * Mathematical Ability Lateralization Index
 */
export function calculateMathematicalAbilityLateralization(data: DKTData, t?: any): IndexResult {
  const regionConfigs = [
    { name: 'inferiorparietal', weight: 0.50, metricWeights: [40, 30, 30] as [number, number, number] },
    { name: 'superiorfrontal', weight: 0.25, metricWeights: [25, 35, 40] as [number, number, number] },
    { name: 'caudalmiddlefrontal', weight: 0.15, metricWeights: [35, 25, 40] as [number, number, number] },
    { name: 'precuneus', weight: 0.10, metricWeights: [30, 40, 30] as [number, number, number] },
  ]

  let totalIndex = 0
  const details: RegionDetail[] = []

  for (const cfg of regionConfigs) {
    const ref = REFERENCE_DATA_MALE[cfg.name]
    if (!ref || !data.lh[cfg.name] || !data.rh[cfg.name]) continue

    const zL = compositeZScore(data.lh[cfg.name], ref, cfg.metricWeights)
    const zR = compositeZScore(data.rh[cfg.name], ref, cfg.metricWeights)
    totalIndex += cfg.weight * (zR - zL)

    details.push({
      region: cfg.name,
      regionWeight: cfg.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((cfg.weight * zL).toFixed(3)),
      contribR: Number((cfg.weight * zR).toFixed(3)),
      weightsUsed: `${cfg.metricWeights[0]}:${cfg.metricWeights[1]}:${cfg.metricWeights[2]}`
    })
  }

  return {
    name: 'Mathematical Ability Lateralization Index',
    value: Number(totalIndex.toFixed(3)),
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getMathematicalAbilityInterpretation(totalIndex, t) : "",
    threshold: '≤-0.90 extreme left (top 1%); ≤-0.60 strong left (top 3%); ≤-0.20 mild left (top 15%); ±0.20 balanced; ≥+0.40 right dominance',
    formula: 'LI_math = Σ wᵢ(zRᵢ − zLᵢ)  negative=left brain dominance',
    references: ['ENIGMA-Cognition 2024', 'UKBB 2024', 'HCP 2025 meta-analysis'],
    regions: ['inferiorparietal (50%)', 'superiorfrontal (25%)', 'caudalmiddlefrontal (15%)', 'precuneus (10%)'],
    weights: 'Independent weights per region, see details',
    details
  }
}

/**
 * Dyslexia Structural Risk Index
 */
export function calculateDyslexiaRiskIndex(data: DKTData, t?: any): IndexResult {
  const regionConfigs: Record<string, { weight: number; metricWeights: [number, number, number] }> = {
    superiortemporal: { weight: 0.25, metricWeights: [60, 15, 25] },
    fusiform: { weight: 0.20, metricWeights: [40, 20, 40] },
    inferiorparietal: { weight: 0.20, metricWeights: [50, 30, 20] },
    supramarginal: { weight: 0.20, metricWeights: [30, 50, 20] },
    middletemporal: { weight: 0.15, metricWeights: [70, 10, 20] }
  }
  
  let totalIndex = 0
  let totalWeight = 0
  const details: RegionDetail[] = []
  
  for (const [region, config] of Object.entries(regionConfigs)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, config.metricWeights)
    const zR = compositeZScore(data.rh[region], ref, config.metricWeights)
    const diff = zL - zR
    totalIndex += config.weight * diff
    totalWeight += config.weight
    
    details.push({
      region,
      regionWeight: config.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((config.weight * zL).toFixed(3)),
      contribR: Number((config.weight * zR).toFixed(3)),
      weightsUsed: `${config.metricWeights[0]}:${config.metricWeights[1]}:${config.metricWeights[2]}`
    })
  }
  
  if (totalWeight > 0) {
    totalIndex = totalIndex / totalWeight * Object.keys(regionConfigs).length * 0.2
  }
  
  const { riskLevel, interpretation } = t ? getDyslexiaRiskInterpretation(totalIndex, t) : { riskLevel: '', interpretation: '' }
  const percentile = zToPercentile(totalIndex)
  
  return {
    name: 'Dyslexia Structural Risk Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: percentile,
    interpretation: t ? `${riskLevel}. ${interpretation}` : '',
    threshold: '< -1.0 high risk; < -0.5 moderate risk; ≥ -0.5 low risk',
    formula: 'Dyslexia_risk = Σ[weight × (z_L − z_R)]',
    references: ['Richlan 2013 Hum Brain Mapp', 'ENIGMA-Dyslexia 2024', 'Vandermosten 2012 Brain'],
    regions: [
      'superiortemporal (25%)',
      'fusiform (20%)',
      'inferiorparietal (20%)',
      'supramarginal (20%)',
      'middletemporal (15%)'
    ],
    weights: 'Independent weights per region, see details table',
    details
  }
}
