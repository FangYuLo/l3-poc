// ============================================================================
// 權重加總模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'

export const WeightedSumModule: FormulaModule = {
  id: 'weighted-sum',
  type: 'weighted-sum',
  name: '權重加總',
  description: '計算加權總和: Σ(value × weight)',

  inputs: [
    {
      id: 'values',
      name: '數值陣列',
      type: 'array',
      required: true,
      description: '要計算總和的數值陣列',
    },
    {
      id: 'weights',
      name: '權重陣列',
      type: 'array',
      required: true,
      description: '對應的權重陣列',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: '加權總和',
      type: 'number',
      description: '計算後的加權總和',
    },
  ],

  execute: (context: ExecutionContext, params: { values: number[]; weights: number[] }) => {
    const { values, weights } = params

    if (!values || !weights) {
      throw new Error('缺少必填參數: values 或 weights')
    }

    if (!Array.isArray(values) || !Array.isArray(weights)) {
      throw new Error('values 和 weights 必須是陣列')
    }

    if (values.length !== weights.length) {
      throw new Error('values 和 weights 的長度必須相同')
    }

    if (values.length === 0) {
      throw new Error('values 陣列不可為空')
    }

    // 檢查所有權重是否大於等於 0
    const negativeWeights = weights.filter((w) => w < 0)
    if (negativeWeights.length > 0) {
      throw new Error('權重不可為負數')
    }

    // 計算加權總和
    const result = values.reduce((sum, value, index) => {
      return sum + value * weights[index]
    }, 0)

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    return {
      result,
      value: result,
      total_weight: totalWeight,
    }
  },

  validate: (params: { values: number[]; weights: number[] }) => {
    const errors: string[] = []

    if (!params.values) {
      errors.push('values 為必填欄位')
    } else if (!Array.isArray(params.values)) {
      errors.push('values 必須是陣列')
    } else if (params.values.length === 0) {
      errors.push('values 陣列不可為空')
    }

    if (!params.weights) {
      errors.push('weights 為必填欄位')
    } else if (!Array.isArray(params.weights)) {
      errors.push('weights 必須是陣列')
    } else if (params.weights.length === 0) {
      errors.push('weights 陣列不可為空')
    }

    if (params.values && params.weights && params.values.length !== params.weights.length) {
      errors.push('values 和 weights 的長度必須相同')
    }

    if (params.weights) {
      const negativeWeights = params.weights.filter((w) => w < 0)
      if (negativeWeights.length > 0) {
        errors.push('權重不可為負數')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '➕',
    color: '#48BB78',
    category: 'operation',
    width: 200,
    height: 100,
  },
}
