// ============================================================================
// 常數模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'

export const ConstantModule: FormulaModule = {
  id: 'constant',
  type: 'constant',
  name: '常數',
  description: '輸入一個固定的常數值',

  inputs: [
    {
      id: 'value',
      name: '常數值',
      type: 'number',
      required: true,
      description: '輸入常數值',
      placeholder: '0',
    },
    {
      id: 'unit',
      name: '單位',
      type: 'string',
      required: false,
      description: '常數的單位（可選）',
      placeholder: '例: kg, L, kWh',
    },
  ],

  outputs: [
    {
      id: 'value',
      name: '輸出值',
      type: 'number',
      description: '常數值',
    },
    {
      id: 'unit',
      name: '單位',
      type: 'string',
      description: '常數單位',
    },
  ],

  execute: (context: ExecutionContext, params: Record<string, any>) => {
    const { value, unit } = params

    if (value === undefined || value === null) {
      throw new Error('缺少必填參數: value')
    }

    if (typeof value !== 'number') {
      throw new Error('value 必須是數字')
    }

    return {
      value,
      unit: unit || '',
    }
  },

  validate: (params: Record<string, any>) => {
    const errors: string[] = []

    if (params.value === undefined || params.value === null) {
      errors.push('value 為必填欄位')
    } else if (typeof params.value !== 'number') {
      errors.push('value 必須是數字')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '🔢',
    color: '#718096',
    category: 'input',
    width: 150,
    height: 80,
  },
}
