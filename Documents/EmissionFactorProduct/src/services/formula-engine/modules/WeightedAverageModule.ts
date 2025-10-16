// ============================================================================
// 權重平均模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'
import { getEmissionFactorById } from '@/data/mockDatabase'

export const WeightedAverageModule: FormulaModule = {
  id: 'weighted-average',
  type: 'weighted-average',
  name: '權重平均',
  description: '計算加權平均值: Σ(value × weight) / Σ(weight)，支援直接使用係數 ID 或數值',

  inputs: [
    {
      id: 'factors',
      name: '排放係數陣列',
      type: 'array',
      required: false,
      description: '排放係數物件陣列 (包含 id, value, weight)',
    },
    {
      id: 'values',
      name: '數值陣列',
      type: 'array',
      required: false,
      description: '要計算平均的數值陣列 (可選，若提供 factors 則不需要)',
    },
    {
      id: 'weights',
      name: '權重陣列',
      type: 'array',
      required: false,
      description: '對應的權重陣列 (若使用 factors 則不需要)',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: '加權平均值',
      type: 'number',
      description: '計算後的加權平均值',
    },
  ],

  execute: (
    context: ExecutionContext,
    params: {
      factors?: Array<{ id: number; value: number; weight: number; name?: string }>
      values?: number[]
      weights?: number[]
    }
  ) => {
    let values: number[]
    let weights: number[]
    let factorDetails: Array<{ id: number; name: string; value: number; weight: number }> = []

    // 模式 1: 使用 factors 陣列 (新模式 - 從係數庫選擇)
    if (params.factors && Array.isArray(params.factors) && params.factors.length > 0) {
      // 從 factors 陣列中提取或查詢係數值
      values = []
      weights = []

      for (const factor of params.factors) {
        // 如果 factor 已經包含 value，直接使用
        if (typeof factor.value === 'number') {
          values.push(factor.value)
          weights.push(factor.weight)
          factorDetails.push({
            id: factor.id,
            name: factor.name || `係數 ${factor.id}`,
            value: factor.value,
            weight: factor.weight,
          })
        }
        // 否則從資料庫查詢
        else if (typeof factor.id === 'number') {
          const dbFactor = getEmissionFactorById(factor.id)
          if (!dbFactor) {
            throw new Error(`找不到 ID=${factor.id} 的排放係數`)
          }
          values.push(dbFactor.value)
          weights.push(factor.weight)
          factorDetails.push({
            id: factor.id,
            name: dbFactor.name,
            value: dbFactor.value,
            weight: factor.weight,
          })
        }
      }

      if (values.length === 0) {
        throw new Error('factors 陣列不可為空')
      }
    }
    // 模式 2: 使用 values 和 weights 陣列 (舊模式 - 直接輸入數值)
    else if (params.values && params.weights) {
      values = params.values
      weights = params.weights
    }
    // 兩種模式都沒有提供
    else {
      throw new Error('請提供 factors 陣列或 values/weights 陣列')
    }

    // 驗證陣列
    if (!Array.isArray(values) || !Array.isArray(weights)) {
      throw new Error('values 和 weights 必須是陣列')
    }

    if (values.length !== weights.length) {
      throw new Error('values 和 weights 的長度必須相同')
    }

    if (values.length === 0) {
      throw new Error('陣列不可為空')
    }

    // 檢查所有權重是否大於 0
    const invalidWeights = weights.filter((w) => w <= 0)
    if (invalidWeights.length > 0) {
      throw new Error('所有權重必須大於 0')
    }

    // 計算加權總和
    const weightedSum = values.reduce((sum, value, index) => {
      return sum + value * weights[index]
    }, 0)

    // 計算總權重
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    if (totalWeight === 0) {
      throw new Error('總權重不可為 0')
    }

    const result = weightedSum / totalWeight

    // 驗證權重總和是否接近 1.0
    if (Math.abs(totalWeight - 1) > 0.001) {
      context.warnings.push(`權重總和為 ${totalWeight.toFixed(3)}，建議為 1.0`)
    }

    // 建立詳細的計算說明
    const calculation_details =
      factorDetails.length > 0
        ? factorDetails.map(
            (f) =>
              `${f.name} (${f.value}) × ${f.weight} = ${(f.value * f.weight).toFixed(4)}`
          )
        : values.map(
            (v, i) => `數值 ${i + 1} (${v}) × ${weights[i]} = ${(v * weights[i]).toFixed(4)}`
          )

    return {
      result,
      value: result,
      weighted_sum: weightedSum,
      total_weight: totalWeight,
      factors_used: factorDetails.length > 0 ? factorDetails : undefined,
      calculation_details,
    }
  },

  validate: (params: {
    factors?: Array<{ id: number; value?: number; weight: number }>
    values?: number[]
    weights?: number[]
  }) => {
    const errors: string[] = []

    // 檢查是否提供任一種輸入模式
    const hasFactors = params.factors && Array.isArray(params.factors) && params.factors.length > 0
    const hasValuesWeights = params.values && params.weights

    if (!hasFactors && !hasValuesWeights) {
      errors.push('請提供 factors 陣列或 values/weights 陣列')
      return { isValid: false, errors }
    }

    // 驗證 factors 模式
    if (hasFactors) {
      if (params.factors!.length === 0) {
        errors.push('factors 陣列不可為空')
      }

      params.factors!.forEach((factor, index) => {
        if (!factor.id && typeof factor.value !== 'number') {
          errors.push(`係數 ${index + 1}: 必須提供 id 或 value`)
        }
        if (typeof factor.weight !== 'number') {
          errors.push(`係數 ${index + 1}: 必須提供 weight`)
        }
        if (factor.weight <= 0) {
          errors.push(`係數 ${index + 1}: 權重必須大於 0`)
        }
      })
    }

    // 驗證 values/weights 模式
    if (hasValuesWeights) {
      if (!Array.isArray(params.values)) {
        errors.push('values 必須是陣列')
      } else if (params.values.length === 0) {
        errors.push('values 陣列不可為空')
      }

      if (!Array.isArray(params.weights)) {
        errors.push('weights 必須是陣列')
      } else if (params.weights.length === 0) {
        errors.push('weights 陣列不可為空')
      }

      if (
        params.values &&
        params.weights &&
        params.values.length !== params.weights.length
      ) {
        errors.push('values 和 weights 的長度必須相同')
      }

      if (params.weights) {
        const invalidWeights = params.weights.filter((w) => w <= 0)
        if (invalidWeights.length > 0) {
          errors.push('所有權重必須大於 0')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '⚖️',
    color: '#38B2AC',
    category: 'operation',
    width: 200,
    height: 100,
  },
}
