/**
 * 溫室氣體選項配置
 * 用於自訂係數表單的 GHG 多選器
 */
export const GHG_OPTIONS = [
  { value: 'CO2', label: 'CO₂' },
  { value: 'CH4', label: 'CH₄' },
  { value: 'N2O', label: 'N₂O' },
  { value: 'HFCs', label: 'HFCs' },
  { value: 'PFCs', label: 'PFCs' },
  { value: 'SF6', label: 'SF₆' },
  { value: 'NF3', label: 'NF₃' },
] as const

export type GHGType = typeof GHG_OPTIONS[number]['value']
