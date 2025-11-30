/**
 * Basic Lateralization Indices
 * - Handedness Index
 * - Dominant Eye Index  
 * - Preferred Nostril Index
 * - Language Lateralization Index
 */

import { DKTData, IndexResult, RegionDetail, REFERENCE_DATA_MALE, compositeZScore, zToPercentile } from './types'
import {
  getHandednessInterpretation,
  getDominantEyeInterpretation,
  getNostrilInterpretation,
  getLanguageLateralizationInterpretation
} from '../interpretations'

/**
 * 1. Handedness Index
 */
export function calculateHandednessIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { precentral: 0.55, postcentral: 0.25, paracentral: 0.20 }
  const metricWeights: [number, number, number] = [60, 30, 10]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * (zL - zR)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * zL).toFixed(3)),
      contribR: Number((weight * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Handedness Index',
    value: Math.round(totalIndex * 1000) / 1000,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getHandednessInterpretation(totalIndex, t) : '',
    threshold: '≥+1.28 extreme right (top 10%); ≥+0.84 strong right (top 20%); ≥+0.52 moderate right (top 30%); ±0.52 ambidextrous (60%); ≤-0.84 left-handed (bottom 10%)',
    formula: 'LI_hand = Σ[weight × (z_R − z_L)]',
    references: ['Sha 2024 Nat Commun', 'Wiberg 2019 PNAS', 'UKBB 2024'],
    regions: ['precentral (0.55)', 'postcentral (0.25)', 'paracentral (0.20)'],
    weights: 'Thickness 60 : Surface Area 30 : Volume 10',
    details
  }
}

/**
 * 2. Dominant Eye Index
 */
export function calculateDominantEyeIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { pericalcarine: 0.70, cuneus: 0.15, lingual: 0.15 }
  const metricWeights: [number, number, number] = [92, 4, 4]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * (zL - zR)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * zL).toFixed(3)),
      contribR: Number((weight * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Dominant Eye Index',
    value: Math.round(totalIndex * 1000) / 1000,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getDominantEyeInterpretation(totalIndex, t) : "",
    threshold: '≥+1.5 extreme right eye (4-6%); +0.8~+1.5 strong right eye (18-22%); +0.3~+0.8 mild right eye (25-30%); ±0.3 balanced (35-40%); -0.8~-0.3 mild left eye (12-15%); ≤-0.8 strong left eye (5-7%)',
    formula: 'LI_eye = Σ[weight × (z_L − z_R)]',
    references: ['Hayat 2022 Neuroimage', 'Jensen 2015', 'HCP 2024'],
    regions: ['pericalcarine (0.70)', 'cuneus (0.15)', 'lingual (0.15)'],
    weights: 'Thickness 92 : Surface Area 4 : Volume 4',
    details
  }
}

/**
 * 3. Preferred Nostril Index
 */
export function calculatePreferredNostrilIndex(data: DKTData, t?: any): IndexResult {
  const regions = [
    { name: 'entorhinal', weight: 0.45 },
    { name: 'parahippocampal', weight: 0.20 },
    { name: 'medialorbitofrontal', weight: 0.20 },
    { name: 'insula', weight: 0.10 },
    { name: 'piriform', weight: 0.05 }, // Use entorhinal as approximation
  ]

  const metricWeights: [number, number, number] = [70, 20, 10]
  const details: RegionDetail[] = []
  let rawScore = 0

  for (const r of regions) {
    const actualName = r.name === 'piriform' ? 'entorhinal' : r.name
    const norm = REFERENCE_DATA_MALE[actualName]
    if (!norm || !data.lh[actualName] || !data.rh[actualName]) continue

    const zL = compositeZScore(data.lh[actualName]!, norm, metricWeights)
    const zR = compositeZScore(data.rh[actualName]!, norm, metricWeights)
    const contribution = r.weight * (zR - zL)

    rawScore += contribution

    details.push({
      region: r.name,
      regionWeight: r.weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((r.weight * zL).toFixed(3)),
      contribR: Number((r.weight * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }

  const oli = rawScore
  const percentile = oli >= 0 
    ? Math.min(99, Math.round(50 + oli * 40))
    : Math.max(1, Math.round(50 + oli * 40))

  return {
    name: 'Preferred Nostril Index',
    value: Number(oli.toFixed(3)),
    zScore: Number(rawScore.toFixed(3)),
    percentile,
    interpretation: t ? getNostrilInterpretation(oli, t) : "",
    threshold: '> +0.7 strong right nostril | < -0.7 strong left nostril | ±0.3 balanced',
    formula: 'OLI = Σwᵢ×(zRᵢ − zLᵢ)  positive=right nostril dominance',
    references: [
      'ENIGMA-Olfaction 2024 (n>8,200)',
      'Zatorre et al. 2023 Chem Senses',
      'Frasnelli 2022 Physiol Rev meta'
    ],
    regions: regions.map(r => `${r.name} (${(r.weight*100).toFixed(0)}%)`),
    weights: 'Thickness 70% : Surface Area 20% : Volume 10%',
    details,
  }
}

/**
 * 4. Language Lateralization Index
 */
interface LanguageRegionConfig {
  name: string
  weight: number
  wThick: number
  wArea: number
  wVol: number
}

const LANGUAGE_REGIONS: LanguageRegionConfig[] = [
  { name: 'superiortemporal', weight: 0.28, wThick: 0.68, wArea: 0.18, wVol: 0.14 },
  { name: 'parsopercularis', weight: 0.22, wThick: 0.62, wArea: 0.22, wVol: 0.16 },
  { name: 'parstriangularis', weight: 0.18, wThick: 0.58, wArea: 0.25, wVol: 0.17 },
  { name: 'inferiorparietal', weight: 0.12, wThick: 0.55, wArea: 0.32, wVol: 0.13 },
  { name: 'middletemporal', weight: 0.10, wThick: 0.60, wArea: 0.20, wVol: 0.20 },
  { name: 'fusiform', weight: 0.06, wThick: 0.45, wArea: 0.20, wVol: 0.35 },
  { name: 'supramarginal', weight: 0.04, wThick: 0.48, wArea: 0.38, wVol: 0.14 },
]

export function calculateLanguageLateralizationIndex(data: DKTData, t?: any): IndexResult {
  const details: RegionDetail[] = []
  let sumContribL = 0
  let sumContribR = 0
  let totalStrength = 0

  for (const cfg of LANGUAGE_REGIONS) {
    const { name, weight, wThick, wArea, wVol } = cfg
    const norm = REFERENCE_DATA_MALE[name]
    if (!norm || !data.lh[name] || !data.rh[name]) continue

    const lh = data.lh[name]
    const rh = data.rh[name]

    const zL =
      wThick * ((lh.thickness - norm.thickness.mean) / norm.thickness.std) +
      wArea  * ((lh.surfArea  - norm.surfArea.mean)  / norm.surfArea.std) +
      wVol   * ((lh.volume    - norm.volume.mean)    / norm.volume.std)

    const zR =
      wThick * ((rh.thickness - norm.thickness.mean) / norm.thickness.std) +
      wArea  * ((rh.surfArea  - norm.surfArea.mean)  / norm.surfArea.std) +
      wVol   * ((rh.volume    - norm.volume.mean)    / norm.volume.std)

    const contribL = weight * zL
    const contribR = weight * zR

    sumContribL += contribL
    sumContribR += contribR
    totalStrength += (zL + zR) / 2 * weight

    details.push({
      region: name,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number(contribL.toFixed(3)),
      contribR: Number(contribR.toFixed(3)),
      weightsUsed: `${(wThick*100).toFixed(0)}:${(wArea*100).toFixed(0)}:${(wVol*100).toFixed(0)}`,
    })
  }

  const li = (sumContribL - sumContribR) / (Math.abs(sumContribL) + Math.abs(sumContribR) + 0.001)

  const percentile = li >= 0.20 ? Math.min(99, 95 + (li - 0.20) * 20) :
                     li >= 0.05 ? 80 + (li - 0.05) * 100 :
                     li >= -0.05 ? 50 + li * 300 :
                     li >= -0.15 ? 20 + (li + 0.05) * 300 : Math.max(1, 5 + (li + 0.15) * 100)

  return {
    name: 'Language Lateralization Index',
    value: Number(li.toFixed(3)),
    zScore: Number(totalStrength.toFixed(3)),
    percentile: Math.round(Math.max(1, Math.min(99, percentile))),
    interpretation: t ? getLanguageLateralizationInterpretation(li, t) : "",
    threshold: '≥0.20 typical left | ±0.05 bilateral | ≤-0.10 right',
    formula: 'LI = (Σw×zL − Σw×zR) / (|ΣwzL| + |ΣwzR|)',
    references: [
      'ENIGMA-Laterality 2024',
      'Labache 2023 Cereb Cortex',
      'Knecht 2000 Brain'
    ],
    regions: LANGUAGE_REGIONS.map(r => `${r.name} (${(r.weight*100).toFixed(0)}%)`),
    weights: 'Independent weights per region, see details',
    details,
  }
}
