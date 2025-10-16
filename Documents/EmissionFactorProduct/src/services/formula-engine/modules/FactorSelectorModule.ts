// ============================================================================
// 排放係數選擇器模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'
import { getEmissionFactorById } from '@/data/mockDatabase'

export const FactorSelectorModule: FormulaModule = {
  id: 'factor-selector',
  type: 'factor-selector',
  name: '排放係數選擇器',
  description: '從資料庫選擇一個排放係數',

  inputs: [
    {
      id: 'ef_id',
      name: '排放係數 ID',
      type: 'number',
      required: true,
      placeholder: '請輸入係數 ID',
      description: '選擇要使用的排放係數',
    },
  ],

  outputs: [
    {
      id: 'factor',
      name: '排放係數',
      type: 'factor',
      description: '選中的排放係數完整資料',
    },
    {
      id: 'value',
      name: '係數值',
      type: 'number',
      description: '排放係數的數值',
    },
    {
      id: 'unit',
      name: '單位',
      type: 'string',
      description: '排放係數的單位',
    },
  ],

  execute: (context: ExecutionContext, params: { ef_id: number }) => {
    const { ef_id } = params

    if (!ef_id) {
      throw new Error('缺少必填參數: ef_id')
    }

    // 檢查快取
    if (context.factorCache.has(ef_id)) {
      const cachedFactor = context.factorCache.get(ef_id)!
      return {
        factor: cachedFactor,
        value: cachedFactor.value,
        unit: cachedFactor.unit,
      }
    }

    // 從資料庫取得
    const factor = getEmissionFactorById(ef_id)

    if (!factor) {
      throw new Error(`找不到 ID=${ef_id} 的排放係數`)
    }

    // 存入快取
    context.factorCache.set(ef_id, factor)

    return {
      factor,
      value: factor.value,
      unit: factor.unit,
    }
  },

  validate: (params: { ef_id: number }) => {
    const errors: string[] = []

    if (!params.ef_id) {
      errors.push('ef_id 為必填欄位')
    }

    if (typeof params.ef_id !== 'number' || params.ef_id <= 0) {
      errors.push('ef_id 必須是正整數')
    }

    // 檢查係數是否存在
    if (params.ef_id && !getEmissionFactorById(params.ef_id)) {
      errors.push(`找不到 ID=${params.ef_id} 的排放係數`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '🔍',
    color: '#3182CE',
    category: 'input',
    width: 200,
    height: 80,
  },
}
