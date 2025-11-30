/**
 * Cognitive Ability Indices
 * - Olfactory Function Index
 * - Language Composite Index
 * - Reading Fluency Index
 * - Empathy Index
 * - Executive Function Index
 * - Spatial Processing Index
 * - Fluid Intelligence Index
 */

import { DKTData, IndexResult, RegionDetail, REFERENCE_DATA_MALE, compositeZScore, zToPercentile } from './types'
import {
  getOlfactoryInterpretation,
  getLanguageInterpretation,
  getReadingInterpretation,
  getEmpathyInterpretation,
  getExecutiveInterpretation,
  getSpatialInterpretation,
  getFluidIntelligenceInterpretation
} from '../interpretations'

/**
 * Olfactory Function Index
 */
export function calculateOlfactoryIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { entorhinal: 0.60, parahippocampal: 0.20, medialorbitofrontal: 0.20 }
  const metricWeights: [number, number, number] = [80, 10, 10]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * ((zL + zR) / 2)
    
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
    name: 'Olfactory Function Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getOlfactoryInterpretation(totalIndex, t) : "",
    threshold: '> +1.0 top 16%; > +1.5 top 7%',
    formula: 'Olfaction_z = Σ[weight × ((z_L + z_R)/2)]',
    references: ['Saygin 2022 Neuroimage', 'ENIGMA-Olfaction 2024'],
    regions: ['entorhinal (0.60)', 'parahippocampal (0.20)', 'medialorbitofrontal (0.20)'],
    weights: 'Thickness 80 : Surface Area 10 : Volume 10',
    details
  }
}

/**
 * Language Composite Index
 */
export function calculateLanguageIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    superiortemporal: 0.35, 
    parsopercularis: 0.25, 
    parstriangularis: 0.20, 
    middletemporal: 0.10, 
    fusiform: 0.10 
  }
  const metricWeights: [number, number, number] = [45, 30, 25]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * (0.7 * zL + 0.3 * zR)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * 0.7 * zL).toFixed(3)),
      contribR: Number((weight * 0.3 * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Language Composite Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getLanguageInterpretation(totalIndex, t) : "",
    threshold: '> +2.0 top 2.5%; > +2.4 top 0.7%',
    formula: 'Language_z = Σ[weight × (0.7×z_L + 0.3×z_R)]',
    references: ['Friederici 2022 Brain', 'ENIGMA-Language 2024'],
    regions: ['superiortemporal (0.35)', 'parsopercularis/BA44 (0.25)', 'parstriangularis/BA45 (0.20)', 'middletemporal (0.10)', 'fusiform (0.10)'],
    weights: 'Thickness 45 : Surface Area 30 : Volume 25',
    details
  }
}

/**
 * Reading Fluency Index
 */
export function calculateReadingIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    superiortemporal: 0.40, 
    supramarginal: 0.25, 
    inferiorparietal: 0.20, 
    fusiform: 0.15 
  }
  const metricWeights: [number, number, number] = [50, 30, 20]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * (0.75 * zL + 0.25 * zR)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * 0.75 * zL).toFixed(3)),
      contribR: Number((weight * 0.25 * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Reading Fluency Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getReadingInterpretation(totalIndex, t) : "",
    threshold: '> +2.0 top 2.5%',
    formula: 'Reading_z = Σ[weight × (0.75×z_L + 0.25×z_R)]',
    references: ['Black 2022 Brain', 'ABCD/ENIGMA-Reading 2024'],
    regions: ['superiortemporal (0.40)', 'supramarginal (0.25)', 'inferiorparietal (0.20)', 'fusiform (0.15)'],
    weights: 'Thickness 50 : Surface Area 30 : Volume 20',
    details
  }
}

/**
 * Empathy Index
 */
export function calculateEmpathyIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    rostralanteriorcingulate: 0.45, 
    medialorbitofrontal: 0.25, 
    insula: 0.20, 
    posteriorcingulate: 0.10 
  }
  const metricWeights: [number, number, number] = [80, 10, 10]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * ((zL + zR) / 2)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * zL / 2).toFixed(3)),
      contribR: Number((weight * zR / 2).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Empathy Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getEmpathyInterpretation(totalIndex, t) : "",
    threshold: '> +1.5 top 7%; > +1.6 top 5%',
    formula: 'Empathy_z = Σ[weight × ((z_L + z_R)/2)]',
    references: ['Timmers 2018 Neurosci Biobehav Rev', 'UKBB-EQ 2024'],
    regions: ['rostralanteriorcingulate (0.45)', 'medialorbitofrontal (0.25)', 'insula (0.20)', 'posteriorcingulate (0.10)'],
    weights: 'Thickness 80 : Surface Area 10 : Volume 10',
    details
  }
}

/**
 * Executive Function Index
 */
export function calculateExecutiveIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    superiorfrontal: 0.40, 
    rostralmiddlefrontal: 0.30, 
    caudalmiddlefrontal: 0.20, 
    parsopercularis: 0.10 
  }
  const metricWeights: [number, number, number] = [35, 25, 40]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * ((zL + zR) / 2)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * zL / 2).toFixed(3)),
      contribR: Number((weight * zR / 2).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Executive Function Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getExecutiveInterpretation(totalIndex, t) : "",
    threshold: '> +1.8 top 4%; > +1.9 top 3%',
    formula: 'Executive_z = Σ[weight × ((z_L + z_R)/2)]',
    references: ['Woolgar 2021 Neuropsychopharm', 'ENIGMA-Cognition 2024'],
    regions: ['superiorfrontal (0.40)', 'rostralmiddlefrontal (0.30)', 'caudalmiddlefrontal (0.20)', 'parsopercularis (0.10)'],
    weights: 'Thickness 35 : Surface Area 25 : Volume 40',
    details
  }
}

/**
 * Spatial Processing Index
 */
export function calculateSpatialIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    inferiorparietal: 0.50, 
    superiorparietal: 0.35, 
    precuneus: 0.15 
  }
  const metricWeights: [number, number, number] = [20, 50, 30]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * (0.4 * zL + 0.6 * zR)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * 0.4 * zL).toFixed(3)),
      contribR: Number((weight * 0.6 * zR).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Spatial Processing Index',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getSpatialInterpretation(totalIndex, t) : "",
    threshold: '> +1.2 top 11%; > +1.5 top 7%',
    formula: 'Spatial_z = Σ[weight × (0.4×z_L + 0.6×z_R)]',
    references: ['Ruthsatz 2023 Cortex', 'Seghier 2022 Neuroimage'],
    regions: ['inferiorparietal (0.50)', 'superiorparietal (0.35)', 'precuneus (0.15)'],
    weights: 'Thickness 20 : Surface Area 50 : Volume 30',
    details
  }
}

/**
 * Fluid Intelligence Index (Structural)
 */
export function calculateFluidIntelligenceIndex(data: DKTData, t?: any): IndexResult {
  const regionWeights = { 
    superiorfrontal: 0.25, 
    inferiorparietal: 0.20, 
    superiortemporal: 0.20, 
    rostralmiddlefrontal: 0.20, 
    insula: 0.15 
  }
  const metricWeights: [number, number, number] = [30, 30, 40]
  
  let totalIndex = 0
  const details: RegionDetail[] = []
  
  for (const [region, weight] of Object.entries(regionWeights)) {
    const ref = REFERENCE_DATA_MALE[region]
    if (!ref || !data.lh[region] || !data.rh[region]) continue
    
    const zL = compositeZScore(data.lh[region], ref, metricWeights)
    const zR = compositeZScore(data.rh[region], ref, metricWeights)
    totalIndex += weight * ((zL + zR) / 2)
    
    details.push({
      region,
      regionWeight: weight,
      zL: Number(zL.toFixed(3)),
      zR: Number(zR.toFixed(3)),
      contribL: Number((weight * zL / 2).toFixed(3)),
      contribR: Number((weight * zR / 2).toFixed(3)),
      weightsUsed: `${metricWeights[0]}:${metricWeights[1]}:${metricWeights[2]}`
    })
  }
  
  return {
    name: 'Fluid Intelligence Index (Structural)',
    value: Math.round(totalIndex * 100) / 100,
    percentile: zToPercentile(totalIndex),
    interpretation: t ? getFluidIntelligenceInterpretation(totalIndex, t) : "",
    threshold: '> +2.0 top 2.5%; > +2.1 top 1.8% (structural maximum estimate)',
    formula: 'gF_z = Σ[weight × ((z_L + z_R)/2)]',
    references: ['Nave 2023 Sci Adv', 'Pietschnig 2020 Cereb Cortex', 'UKBB 2024'],
    regions: ['superiorfrontal (0.25)', 'inferiorparietal (0.20)', 'superiortemporal (0.20)', 'rostralmiddlefrontal (0.20)', 'insula (0.15)'],
    weights: 'Thickness 30 : Surface Area 30 : Volume 40',
    details
  }
}
