// ============================================================================
// 乘法運算模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'

export const MultiplyModule: FormulaModule = {
  id: 'multiply',
  type: 'multiply',
  name: '乘法運算',
  description: '將兩個數值相乘',

  inputs: [
    {
      id: 'a',
      name: '數值 A',
      type: 'number',
      required: true,
      description: '第一個數值',
    },
    {
      id: 'b',
      name: '數值 B',
      type: 'number',
      required: true,
      description: '第二個數值',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: '結果',
      type: 'number',
      description: 'A × B 的結果',
    },
  ],

  execute: (context: ExecutionContext, params: Record<string, any>) => {
    // 支援從 previousValue 取得值
    let a = params.a
    let b = params.b

    // 如果 a 未提供，嘗試從 previousValue 取得
    if (a === undefined && context.previousValue !== undefined) {
      if (typeof context.previousValue === 'object' && 'value' in context.previousValue) {
        a = context.previousValue.value
      } else if (typeof context.previousValue === 'number') {
        a = context.previousValue
      }
    }

    if (a === undefined || b === undefined) {
      throw new Error('缺少必填參數: a 或 b')
    }

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('a 和 b 必須是數字')
    }

    const result = a * b

    return {
      result,
      value: result, // 相容性輸出
    }
  },

  validate: (params: Record<string, any>) => {
    const errors: string[] = []

    if (params.a === undefined) {
      errors.push('a 為必填欄位')
    } else if (typeof params.a !== 'number') {
      errors.push('a 必須是數字')
    }

    if (params.b === undefined) {
      errors.push('b 為必填欄位')
    } else if (typeof params.b !== 'number') {
      errors.push('b 必須是數字')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '✖️',
    color: '#805AD5',
    category: 'operation',
    width: 150,
    height: 80,
  },
}
