// ============================================================================
// 熱值資料庫 (Heat Value Database)
// ============================================================================

import { HeatValue } from '@/types/formula.types'

/**
 * 燃料熱值資料庫
 * 資料來源：環保署溫室氣體排放係數管理表、IEA、IPCC
 */
export const mockHeatValues: HeatValue[] = [
  // 台灣 - 石油產品
  {
    fuel_type: '汽油',
    country: '台灣',
    value: 34.46,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: '車用汽油',
  },
  {
    fuel_type: '柴油',
    country: '台灣',
    value: 38.26,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: '車用柴油',
  },
  {
    fuel_type: '航空汽油',
    country: '台灣',
    value: 33.52,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
  },
  {
    fuel_type: '航空燃油',
    country: '台灣',
    value: 37.40,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
  },
  {
    fuel_type: '液化石油氣',
    country: '台灣',
    value: 25.3,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: 'LPG',
  },
  {
    fuel_type: '燃料油',
    country: '台灣',
    value: 40.87,
    unit: 'MJ/L',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
  },

  // 台灣 - 氣體燃料
  {
    fuel_type: '天然氣',
    country: '台灣',
    value: 38.94,
    unit: 'MJ/Nm³',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: '工業用天然氣',
  },
  {
    fuel_type: '液化天然氣',
    country: '台灣',
    value: 54.48,
    unit: 'MJ/kg',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: 'LNG',
  },

  // 台灣 - 固體燃料
  {
    fuel_type: '煤炭',
    country: '台灣',
    value: 28.90,
    unit: 'MJ/kg',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
    description: '燃料煤',
  },
  {
    fuel_type: '焦炭',
    country: '台灣',
    value: 29.10,
    unit: 'MJ/kg',
    source: '台灣環保署溫室氣體排放係數管理表 6.0.4',
    year: 2024,
  },

  // 英國 - 石油產品 (DEFRA 2024)
  {
    fuel_type: '汽油',
    country: '英國',
    value: 34.2,
    unit: 'MJ/L',
    source: 'UK DEFRA 2024',
    year: 2024,
    description: '汽車用汽油',
  },
  {
    fuel_type: '柴油',
    country: '英國',
    value: 38.6,
    unit: 'MJ/L',
    source: 'UK DEFRA 2024',
    year: 2024,
    description: '汽車用柴油',
  },
  {
    fuel_type: '航空燃油',
    country: '英國',
    value: 37.0,
    unit: 'MJ/L',
    source: 'UK DEFRA 2024',
    year: 2024,
    description: 'Jet A-1',
  },

  // 美國 - 石油產品 (EPA 2024)
  {
    fuel_type: '汽油',
    country: '美國',
    value: 34.8,
    unit: 'MJ/L',
    source: 'US EPA 2024',
    year: 2024,
  },
  {
    fuel_type: '柴油',
    country: '美國',
    value: 38.3,
    unit: 'MJ/L',
    source: 'US EPA 2024',
    year: 2024,
  },
  {
    fuel_type: '天然氣',
    country: '美國',
    value: 38.3,
    unit: 'MJ/Nm³',
    source: 'US EPA 2024',
    year: 2024,
  },

  // 中國 - 燃料 (國家發改委)
  {
    fuel_type: '汽油',
    country: '中國',
    value: 33.5,
    unit: 'MJ/L',
    source: '中國國家發改委 2024',
    year: 2024,
  },
  {
    fuel_type: '柴油',
    country: '中國',
    value: 37.8,
    unit: 'MJ/L',
    source: '中國國家發改委 2024',
    year: 2024,
  },
  {
    fuel_type: '天然氣',
    country: '中國',
    value: 38.9,
    unit: 'MJ/Nm³',
    source: '中國國家發改委 2024',
    year: 2024,
  },
  {
    fuel_type: '煤炭',
    country: '中國',
    value: 20.9,
    unit: 'MJ/kg',
    source: '中國國家發改委 2024',
    year: 2024,
    description: '煙煤',
  },

  // 日本 - 燃料 (環境省)
  {
    fuel_type: '汽油',
    country: '日本',
    value: 34.6,
    unit: 'MJ/L',
    source: '日本環境省 2023',
    year: 2023,
  },
  {
    fuel_type: '柴油',
    country: '日本',
    value: 38.2,
    unit: 'MJ/L',
    source: '日本環境省 2023',
    year: 2023,
  },
  {
    fuel_type: '天然氣',
    country: '日本',
    value: 43.5,
    unit: 'MJ/Nm³',
    source: '日本環境省 2023',
    year: 2023,
  },

  // 國際通用值 (IPCC 2006)
  {
    fuel_type: '汽油',
    country: '國際',
    value: 34.2,
    unit: 'MJ/L',
    source: 'IPCC 2006 Guidelines',
    year: 2006,
    description: 'IPCC 預設值',
  },
  {
    fuel_type: '柴油',
    country: '國際',
    value: 38.6,
    unit: 'MJ/L',
    source: 'IPCC 2006 Guidelines',
    year: 2006,
    description: 'IPCC 預設值',
  },
  {
    fuel_type: '天然氣',
    country: '國際',
    value: 38.9,
    unit: 'MJ/Nm³',
    source: 'IPCC 2006 Guidelines',
    year: 2006,
    description: 'IPCC 預設值',
  },
  {
    fuel_type: '煤炭',
    country: '國際',
    value: 25.8,
    unit: 'MJ/kg',
    source: 'IPCC 2006 Guidelines',
    year: 2006,
    description: 'IPCC 預設值 - 煙煤',
  },
]

/**
 * 根據燃料類型和國家查詢熱值
 */
export function getHeatValue(fuelType: string, country: string = '台灣'): HeatValue | null {
  // 先嘗試精確匹配
  let result = mockHeatValues.find(
    (hv) => hv.fuel_type === fuelType && hv.country === country
  )

  // 如果找不到，嘗試使用國際通用值
  if (!result && country !== '國際') {
    result = mockHeatValues.find(
      (hv) => hv.fuel_type === fuelType && hv.country === '國際'
    )
  }

  return result || null
}

/**
 * 取得所有可用的燃料類型
 */
export function getAvailableFuelTypes(): string[] {
  return Array.from(new Set(mockHeatValues.map((hv) => hv.fuel_type)))
}

/**
 * 取得所有可用的國家/地區
 */
export function getAvailableCountries(): string[] {
  return Array.from(new Set(mockHeatValues.map((hv) => hv.country)))
}

/**
 * 根據國家取得該國所有燃料類型
 */
export function getFuelTypesByCountry(country: string): string[] {
  return mockHeatValues
    .filter((hv) => hv.country === country)
    .map((hv) => hv.fuel_type)
}
