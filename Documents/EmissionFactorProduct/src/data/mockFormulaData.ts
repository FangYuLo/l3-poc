// Mock 資料：排放係數、熱值、單位轉換表

export interface EmissionFactorData {
  id: string
  name: string
  value: number
  unit: string
  description: string
  category: 'fuel' | 'electricity' | 'process'
}

export interface HeatValueData {
  id: string
  country: string
  fuel_type: string
  value: number
  unit: string
}

export interface UnitConversionData {
  from: string
  to: string
  factor: number
}

export const mockEmissionFactors: EmissionFactorData[] = [
  {
    id: 'EF_CO2_Diesel',
    name: '柴油 CO2',
    value: 2.68,
    unit: 'kgCO2/L',
    description: '柴油直接燃燒排放係數',
    category: 'fuel'
  },
  {
    id: 'EF_CO2_NaturalGas',
    name: '天然氣 CO2',
    value: 0.0521,
    unit: 'kgCO2/MJ',
    description: '天然氣燃燒排放係數（基於熱值）',
    category: 'fuel'
  },
  {
    id: 'EF_CO2_Coal',
    name: '煤炭 CO2',
    value: 0.0946,
    unit: 'kgCO2/MJ',
    description: '煤炭燃燒排放係數（基於熱值）',
    category: 'fuel'
  },
  {
    id: 'EF_CO2_Electricity_TW',
    name: '台灣電力 CO2',
    value: 0.502,
    unit: 'kgCO2/kWh',
    description: '台灣電力排放係數 (2024)',
    category: 'electricity'
  },
  {
    id: 'EF_CH4_NaturalGas',
    name: '天然氣 CH4',
    value: 0.000092,
    unit: 'kgCH4/MJ',
    description: '天然氣甲烷排放係數',
    category: 'fuel'
  },
  {
    id: 'EF_N2O_NaturalGas',
    name: '天然氣 N2O',
    value: 0.0000037,
    unit: 'kgN2O/MJ',
    description: '天然氣氧化亞氮排放係數',
    category: 'fuel'
  }
]

export const mockHeatValues: HeatValueData[] = [
  {
    id: 'HV_NaturalGas_TW',
    country: '台灣',
    fuel_type: '天然氣',
    value: 39,
    unit: 'MJ/Nm3'
  },
  {
    id: 'HV_NaturalGas_JP',
    country: '日本',
    fuel_type: '天然氣',
    value: 41,
    unit: 'MJ/Nm3'
  },
  {
    id: 'HV_NaturalGas_US',
    country: '美國',
    fuel_type: '天然氣',
    value: 38.3,
    unit: 'MJ/Nm3'
  },
  {
    id: 'HV_Diesel_TW',
    country: '台灣',
    fuel_type: '柴油',
    value: 38.2,
    unit: 'MJ/L'
  },
  {
    id: 'HV_Coal_TW',
    country: '台灣',
    fuel_type: '煤炭',
    value: 25.5,
    unit: 'MJ/kg'
  },
  {
    id: 'HV_Gasoline_TW',
    country: '台灣',
    fuel_type: '汽油',
    value: 34.6,
    unit: 'MJ/L'
  }
]

export const mockUnitConversions: UnitConversionData[] = [
  { from: 'MJ', to: 'kWh', factor: 0.2778 },
  { from: 'kWh', to: 'MJ', factor: 3.6 },
  { from: 'Nm3', to: 'm3', factor: 1 },
  { from: 'L', to: 'm3', factor: 0.001 },
  { from: 'm3', to: 'L', factor: 1000 },
  { from: 'kg', to: 'ton', factor: 0.001 },
  { from: 'ton', to: 'kg', factor: 1000 },
  { from: 'kgCO2', to: 'tonCO2', factor: 0.001 },
  { from: 'tonCO2', to: 'kgCO2', factor: 1000 },
  { from: 'GJ', to: 'MJ', factor: 1000 },
  { from: 'MJ', to: 'GJ', factor: 0.001 }
]

// 輔助函數：獲取單位轉換係數
export function getConversionFactor(fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return 1

  const conversion = mockUnitConversions.find(
    c => c.from === fromUnit && c.to === toUnit
  )

  return conversion ? conversion.factor : null
}

// 輔助函數：解析複合單位（例如 "kgCO2/MJ" -> { numerator: "kgCO2", denominator: "MJ" }）
export function parseCompoundUnit(unit: string): { numerator: string; denominator: string } | null {
  const parts = unit.split('/')
  if (parts.length !== 2) return null

  return {
    numerator: parts[0].trim(),
    denominator: parts[1].trim()
  }
}
