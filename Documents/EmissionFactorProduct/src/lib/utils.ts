// import { type ClassValue, clsx } from 'clsx'
// import { twMerge } from 'tailwind-merge'
import { EmissionFactor, CompositeFactor, FactorTableItem, SourceType } from '@/types/types'

export function cn(...inputs: any[]) {
  // return twMerge(clsx(inputs))
  return inputs.join(' ')
}

// Format number with appropriate precision
export function formatNumber(value: number | null | undefined, precision = 6): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  if (value === 0) return '0'
  
  const abs = Math.abs(value)
  if (abs >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  } else if (abs >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  } else if (abs >= 1) {
    return value.toFixed(Math.min(precision, 3))
  } else if (abs >= 0.001) {
    return value.toFixed(precision)
  } else {
    return value.toExponential(2)
  }
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Format datetime
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Convert EmissionFactor to FactorTableItem
export function emissionFactorToTableItem(ef: EmissionFactor): FactorTableItem {
  return {
    id: ef.id,
    type: 'emission_factor',
    name: ef.name,
    value: ef.value,
    unit: ef.unit,
    year: ef.year,
    region: ef.region,
    method_gwp: ef.method_gwp,
    source_type: ef.source_type,
    source_ref: ef.source_ref,
    version: ef.version,
    data: ef,
  }
}

// Convert CompositeFactor to FactorTableItem
export function compositeFactorToTableItem(cf: CompositeFactor): FactorTableItem {
  return {
    id: cf.id,
    type: 'composite_factor',
    name: cf.name,
    value: cf.computed_value,
    unit: cf.unit,
    version: '1.0', // Composite factors don't have versions yet
    data: cf,
  }
}

// Generate unique ID for tree nodes
export function generateNodeId(type: string, id?: number | string): string {
  return `${type}_${id || 'root'}`
}

// Filter functions
export function filterByKeyword(items: FactorTableItem[], keyword: string): FactorTableItem[] {
  if (!keyword.trim()) return items
  
  const lowerKeyword = keyword.toLowerCase()
  return items.filter(item => 
    item.name.toLowerCase().includes(lowerKeyword) ||
    item.unit.toLowerCase().includes(lowerKeyword) ||
    item.region?.toLowerCase().includes(lowerKeyword) ||
    item.source_ref?.toLowerCase().includes(lowerKeyword)
  )
}

export function filterBySourceTypes(items: FactorTableItem[], sourceTypes: SourceType[]): FactorTableItem[] {
  if (sourceTypes.length === 0) return items
  return items.filter(item => item.source_type && sourceTypes.includes(item.source_type))
}

export function filterByYears(items: FactorTableItem[], years: number[]): FactorTableItem[] {
  if (years.length === 0) return items
  return items.filter(item => item.year && years.includes(item.year))
}

export function filterByRegions(items: FactorTableItem[], regions: string[]): FactorTableItem[] {
  if (regions.length === 0) return items
  return items.filter(item => item.region && regions.includes(item.region))
}

export function filterByUnits(items: FactorTableItem[], units: string[]): FactorTableItem[] {
  if (units.length === 0) return items
  return items.filter(item => units.includes(item.unit))
}

export function filterByMethods(items: FactorTableItem[], methods: string[]): FactorTableItem[] {
  if (methods.length === 0) return items
  return items.filter(item => item.method_gwp && methods.includes(item.method_gwp))
}

// Pagination helpers
export function paginateArray<T>(array: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize
  return array.slice(startIndex, startIndex + pageSize)
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize)
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Calculate composite factor value
export function calculateCompositeValue(
  components: Array<{ ef: EmissionFactor; weight: number }>,
  formulaType: 'sum' | 'weighted'
): number {
  if (components.length === 0) return 0
  
  if (formulaType === 'sum') {
    return components.reduce((sum, { ef, weight }) => sum + ef.value * weight, 0)
  } else {
    // weighted average
    const totalWeight = components.reduce((sum, { weight }) => sum + weight, 0)
    if (totalWeight === 0) return 0
    
    const weightedSum = components.reduce((sum, { ef, weight }) => sum + ef.value * weight, 0)
    return weightedSum / totalWeight
  }
}

// Validate composite components
export function validateCompositeComponents(
  components: Array<{ ef: EmissionFactor; weight: number }>,
  targetUnit: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (components.length === 0) {
    errors.push('至少需要一個組成係數')
  }
  
  // Check if all units are compatible or can be converted to target unit
  const incompatibleUnits = components.filter(({ ef }) => !areUnitsCompatible(ef.unit, targetUnit))
  if (incompatibleUnits.length > 0) {
    errors.push(`以下係數的單位與目標單位 ${targetUnit} 不相容: ${incompatibleUnits.map(c => c.ef.name).join(', ')}`)
  }
  
  // Check for negative or zero weights
  const invalidWeights = components.filter(({ weight }) => weight <= 0)
  if (invalidWeights.length > 0) {
    errors.push('權重必須大於零')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Simple unit compatibility check (can be expanded)
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  // Normalize units for comparison
  const normalize = (unit: string) => unit.toLowerCase().replace(/\s+/g, '')
  return normalize(unit1) === normalize(unit2)
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// Generate mock data helpers
export function generateMockId(): number {
  return Math.floor(Math.random() * 1000000) + 1
}

export function generateMockDate(daysAgo = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}