// ============================================================================
// 單位轉換模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'

// 單位轉換對照表
const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  // 能源單位轉換
  'MJ': {
    'kWh': 0.277778,  // 1 MJ = 0.277778 kWh
    'MJ': 1,
    'GJ': 0.001,
  },
  'kWh': {
    'MJ': 3.6,        // 1 kWh = 3.6 MJ
    'kWh': 1,
    'GJ': 0.0036,
  },
  'GJ': {
    'MJ': 1000,
    'kWh': 277.778,
    'GJ': 1,
  },

  // 質量單位轉換
  'kg': {
    'g': 1000,
    'kg': 1,
    't': 0.001,
  },
  'g': {
    'g': 1,
    'kg': 0.001,
    't': 0.000001,
  },
  't': {
    'g': 1000000,
    'kg': 1000,
    't': 1,
  },

  // 體積單位轉換
  'L': {
    'mL': 1000,
    'L': 1,
    'm³': 0.001,
  },
  'mL': {
    'mL': 1,
    'L': 0.001,
    'm³': 0.000001,
  },
  'm³': {
    'mL': 1000000,
    'L': 1000,
    'm³': 1,
    'Nm³': 1, // 簡化處理
  },
  'Nm³': {
    'm³': 1,
    'Nm³': 1,
  },
}

export const UnitConverterModule: FormulaModule = {
  id: 'unit-converter',
  type: 'unit-converter',
  name: '單位轉換',
  description: '將數值從一個單位轉換到另一個單位',

  inputs: [
    {
      id: 'value',
      name: '數值',
      type: 'number',
      required: true,
      description: '要轉換的數值',
    },
    {
      id: 'from_unit',
      name: '原始單位',
      type: 'select',
      required: true,
      options: [
        { value: 'MJ', label: 'MJ (兆焦耳)' },
        { value: 'kWh', label: 'kWh (千瓦時)' },
        { value: 'GJ', label: 'GJ (吉焦耳)' },
        { value: 'kg', label: 'kg (公斤)' },
        { value: 'g', label: 'g (克)' },
        { value: 't', label: 't (公噸)' },
        { value: 'L', label: 'L (公升)' },
        { value: 'mL', label: 'mL (毫升)' },
        { value: 'm³', label: 'm³ (立方米)' },
        { value: 'Nm³', label: 'Nm³ (標準立方米)' },
      ],
      description: '原始單位',
    },
    {
      id: 'to_unit',
      name: '目標單位',
      type: 'select',
      required: true,
      options: [
        { value: 'MJ', label: 'MJ (兆焦耳)' },
        { value: 'kWh', label: 'kWh (千瓦時)' },
        { value: 'GJ', label: 'GJ (吉焦耳)' },
        { value: 'kg', label: 'kg (公斤)' },
        { value: 'g', label: 'g (克)' },
        { value: 't', label: 't (公噸)' },
        { value: 'L', label: 'L (公升)' },
        { value: 'mL', label: 'mL (毫升)' },
        { value: 'm³', label: 'm³ (立方米)' },
        { value: 'Nm³', label: 'Nm³ (標準立方米)' },
      ],
      description: '目標單位',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: '轉換結果',
      type: 'number',
      description: '轉換後的數值',
    },
    {
      id: 'unit',
      name: '單位',
      type: 'string',
      description: '轉換後的單位',
    },
  ],

  execute: (
    context: ExecutionContext,
    params: Record<string, any>
  ) => {
    let { value, from_unit, to_unit } = params

    // 支援從 previousValue 取得值
    if (value === undefined && context.previousValue !== undefined) {
      if (typeof context.previousValue === 'object' && 'value' in context.previousValue) {
        value = context.previousValue.value
      } else if (typeof context.previousValue === 'number') {
        value = context.previousValue
      }
    }

    if (value === undefined) {
      throw new Error('缺少必填參數: value')
    }

    if (!from_unit || !to_unit) {
      throw new Error('缺少必填參數: from_unit 或 to_unit')
    }

    // 相同單位，直接返回
    if (from_unit === to_unit) {
      return {
        result: value,
        value,
        unit: to_unit,
      }
    }

    // 查找轉換係數
    const fromConversions = CONVERSION_FACTORS[from_unit]
    if (!fromConversions) {
      throw new Error(`不支援的原始單位: ${from_unit}`)
    }

    const conversionFactor = fromConversions[to_unit]
    if (conversionFactor === undefined) {
      throw new Error(`無法從 ${from_unit} 轉換到 ${to_unit}`)
    }

    const result = value * conversionFactor

    return {
      result,
      value: result,
      unit: to_unit,
      conversion_factor: conversionFactor,
    }
  },

  validate: (params: Record<string, any>) => {
    const errors: string[] = []

    if (params.value === undefined) {
      errors.push('value 為必填欄位')
    } else if (typeof params.value !== 'number') {
      errors.push('value 必須是數字')
    }

    if (!params.from_unit) {
      errors.push('from_unit 為必填欄位')
    } else if (!CONVERSION_FACTORS[params.from_unit]) {
      errors.push(`不支援的原始單位: ${params.from_unit}`)
    }

    if (!params.to_unit) {
      errors.push('to_unit 為必填欄位')
    }

    if (
      params.from_unit &&
      params.to_unit &&
      params.from_unit !== params.to_unit &&
      CONVERSION_FACTORS[params.from_unit] &&
      CONVERSION_FACTORS[params.from_unit][params.to_unit] === undefined
    ) {
      errors.push(`無法從 ${params.from_unit} 轉換到 ${params.to_unit}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '🔄',
    color: '#9F7AEA',
    category: 'conversion',
    width: 200,
    height: 100,
  },
}
