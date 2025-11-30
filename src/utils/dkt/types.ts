/**
 * DKT Analysis Type Definitions
 */

// Reference data for adult males
export const REFERENCE_DATA_MALE: Record<string, { 
  thickness: { mean: number; std: number }
  surfArea: { mean: number; std: number }
  volume: { mean: number; std: number }
}> = {
  precentral: { thickness: { mean: 2.65, std: 0.18 }, surfArea: { mean: 5400, std: 650 }, volume: { mean: 16500, std: 2200 } },
  postcentral: { thickness: { mean: 2.15, std: 0.16 }, surfArea: { mean: 5200, std: 600 }, volume: { mean: 13500, std: 1800 } },
  paracentral: { thickness: { mean: 2.45, std: 0.17 }, surfArea: { mean: 1700, std: 280 }, volume: { mean: 4800, std: 700 } },
  pericalcarine: { thickness: { mean: 1.55, std: 0.14 }, surfArea: { mean: 1900, std: 320 }, volume: { mean: 2400, std: 400 } },
  cuneus: { thickness: { mean: 1.95, std: 0.15 }, surfArea: { mean: 2300, std: 380 }, volume: { mean: 4600, std: 650 } },
  lingual: { thickness: { mean: 2.05, std: 0.15 }, surfArea: { mean: 3800, std: 500 }, volume: { mean: 8200, std: 1100 } },
  entorhinal: { thickness: { mean: 3.20, std: 0.35 }, surfArea: { mean: 480, std: 100 }, volume: { mean: 1600, std: 350 } },
  parahippocampal: { thickness: { mean: 2.75, std: 0.22 }, surfArea: { mean: 700, std: 120 }, volume: { mean: 2200, std: 380 } },
  medialorbitofrontal: { thickness: { mean: 2.45, std: 0.20 }, surfArea: { mean: 1800, std: 300 }, volume: { mean: 5000, std: 750 } },
  superiortemporal: { thickness: { mean: 2.85, std: 0.20 }, surfArea: { mean: 5800, std: 700 }, volume: { mean: 19000, std: 2500 } },
  parsopercularis: { thickness: { mean: 2.55, std: 0.16 }, surfArea: { mean: 1600, std: 250 }, volume: { mean: 4500, std: 650 } },
  parstriangularis: { thickness: { mean: 2.40, std: 0.17 }, surfArea: { mean: 1550, std: 280 }, volume: { mean: 4000, std: 600 } },
  middletemporal: { thickness: { mean: 2.85, std: 0.19 }, surfArea: { mean: 5000, std: 650 }, volume: { mean: 16000, std: 2200 } },
  fusiform: { thickness: { mean: 2.70, std: 0.18 }, surfArea: { mean: 3300, std: 450 }, volume: { mean: 9500, std: 1300 } },
  supramarginal: { thickness: { mean: 2.60, std: 0.17 }, surfArea: { mean: 3800, std: 500 }, volume: { mean: 11500, std: 1600 } },
  inferiorparietal: { thickness: { mean: 2.50, std: 0.16 }, surfArea: { mean: 5500, std: 700 }, volume: { mean: 15500, std: 2100 } },
  rostralanteriorcingulate: { thickness: { mean: 2.85, std: 0.22 }, surfArea: { mean: 1100, std: 200 }, volume: { mean: 3500, std: 550 } },
  insula: { thickness: { mean: 3.05, std: 0.22 }, surfArea: { mean: 2500, std: 350 }, volume: { mean: 7800, std: 1000 } },
  posteriorcingulate: { thickness: { mean: 2.45, std: 0.20 }, surfArea: { mean: 1500, std: 250 }, volume: { mean: 4000, std: 600 } },
  superiorfrontal: { thickness: { mean: 2.75, std: 0.18 }, surfArea: { mean: 9500, std: 1200 }, volume: { mean: 30000, std: 4000 } },
  rostralmiddlefrontal: { thickness: { mean: 2.40, std: 0.17 }, surfArea: { mean: 4700, std: 600 }, volume: { mean: 13000, std: 1800 } },
  caudalmiddlefrontal: { thickness: { mean: 2.65, std: 0.17 }, surfArea: { mean: 2600, std: 400 }, volume: { mean: 7500, std: 1000 } },
  superiorparietal: { thickness: { mean: 2.25, std: 0.15 }, surfArea: { mean: 5200, std: 650 }, volume: { mean: 13000, std: 1700 } },
  precuneus: { thickness: { mean: 2.40, std: 0.16 }, surfArea: { mean: 4600, std: 580 }, volume: { mean: 12000, std: 1600 } },
  lateraloccipital: { thickness: { mean: 2.20, std: 0.16 }, surfArea: { mean: 6300, std: 800 }, volume: { mean: 15000, std: 2000 } },
  lateralorbitofrontal: { thickness: { mean: 2.55, std: 0.20 }, surfArea: { mean: 3500, std: 480 }, volume: { mean: 9800, std: 1400 } },
  inferiortemporal: { thickness: { mean: 2.80, std: 0.20 }, surfArea: { mean: 3900, std: 520 }, volume: { mean: 12500, std: 1700 } },
}

// DKT region data interface
export interface DKTRegionData {
  thickness: number
  surfArea: number
  volume: number
}

export interface DKTData {
  lh: Record<string, DKTRegionData>
  rh: Record<string, DKTRegionData>
}

// Region detail interface
export interface RegionDetail {
  region: string
  regionWeight: number
  zL: number
  zR: number
  contribL: number
  contribR: number
  weightsUsed: string
}

// Index result interface
export interface IndexResult {
  name: string
  value: number
  percentile: number
  interpretation: string
  threshold: string
  formula: string
  references: string[]
  regions: string[]
  weights: string
  zScore?: number
  details?: RegionDetail[]
}

// Calculate z-score
export function zScore(value: number, mean: number, std: number): number {
  return (value - mean) / std
}

// Calculate composite z-score (thickness:surfArea:volume weights)
export function compositeZScore(
  data: DKTRegionData,
  ref: { thickness: { mean: number; std: number }; surfArea: { mean: number; std: number }; volume: { mean: number; std: number } },
  weights: [number, number, number] // [thickness, surfArea, volume]
): number {
  const zThick = zScore(data.thickness, ref.thickness.mean, ref.thickness.std)
  const zSurf = zScore(data.surfArea, ref.surfArea.mean, ref.surfArea.std)
  const zVol = zScore(data.volume, ref.volume.mean, ref.volume.std)
  
  const [wT, wS, wV] = weights.map(w => w / 100)
  return zThick * wT + zSurf * wS + zVol * wV
}

// Convert z-score to percentile
export function zToPercentile(z: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = z < 0 ? -1 : 1
  const absZ = Math.abs(z)
  const t = 1.0 / (1.0 + p * absZ)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ / 2)
  
  return Math.round((0.5 * (1.0 + sign * y)) * 100)
}

// Parse DKT stats file
export function parseDKTStats(content: string): Record<string, DKTRegionData> {
  const data: Record<string, DKTRegionData> = {}
  const lines = content.split('\n')
  
  let inTable = false
  for (const line of lines) {
    if (line.includes('ColHeaders')) {
      inTable = true
      continue
    }
    if (inTable && line.trim() && !line.startsWith('#')) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 5) {
        const regionName = parts[0]
        data[regionName] = {
          surfArea: parseFloat(parts[2]),
          volume: parseFloat(parts[3]),
          thickness: parseFloat(parts[4])
        }
      }
    }
  }
  
  return data
}
