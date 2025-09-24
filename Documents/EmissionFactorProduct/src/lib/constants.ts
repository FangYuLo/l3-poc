export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'

export const COLLECTION_TYPES = {
  FAVORITES: 'favorites' as const,
  USER_DEFINED: 'user_defined' as const,
  PACT: 'pact' as const,
  SUPPLIER: 'supplier' as const,
  PROJECT: 'project' as const,
}

export const SOURCE_TYPES = {
  STANDARD: 'standard' as const,
  PACT: 'pact' as const,
  SUPPLIER: 'supplier' as const,
  USER_DEFINED: 'user_defined' as const,
}

export const FORMULA_TYPES = {
  SUM: 'sum' as const,
  WEIGHTED: 'weighted' as const,
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const COLLECTION_NAMES = {
  [COLLECTION_TYPES.FAVORITES]: '常用係數',
  [COLLECTION_TYPES.USER_DEFINED]: '自建係數',
  [COLLECTION_TYPES.PACT]: 'PACT交換',
  [COLLECTION_TYPES.SUPPLIER]: '供應商係數',
}

export const SOURCE_TYPE_NAMES = {
  [SOURCE_TYPES.STANDARD]: '標準資料庫',
  [SOURCE_TYPES.PACT]: 'PACT交換',
  [SOURCE_TYPES.SUPPLIER]: '供應商提供',
  [SOURCE_TYPES.USER_DEFINED]: '使用者自建',
}

// Common units for emissions
export const COMMON_UNITS = [
  'kg CO2e',
  'g CO2e',
  'kg CO2e/kg',
  'kg CO2e/MJ',
  'kg CO2e/kWh',
  'kg CO2e/km',
  'kg CO2e/unit',
]

// Common GWP methods
export const GWP_METHODS = [
  'GWP100',
  'GWP20',
  'GTP100',
  'GTP20',
]

// Common regions
export const REGIONS = [
  'Global',
  'Asia',
  'Europe',
  'North America',
  'China',
  'USA',
  'Japan',
  'Taiwan',
  'Singapore',
]