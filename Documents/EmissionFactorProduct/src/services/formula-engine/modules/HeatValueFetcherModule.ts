// ============================================================================
// 熱值查詢器模組
// ============================================================================

import { FormulaModule, ExecutionContext } from '@/types/formula.types'
import { getHeatValue, getAvailableCountries, getAvailableFuelTypes } from '@/data/mockHeatValues'

export const HeatValueFetcherModule: FormulaModule = {
  id: 'heatvalue-fetcher',
  type: 'heatvalue-fetcher',
  name: '熱值查詢器',
  description: '從資料庫查詢燃料熱值',

  inputs: [
    {
      id: 'fuel_type',
      name: '燃料類型',
      type: 'select',
      required: true,
      options: getAvailableFuelTypes().map(fuel => ({ value: fuel, label: fuel })),
      description: '選擇燃料類型',
    },
    {
      id: 'country',
      name: '國家/地區',
      type: 'select',
      required: false,
      defaultValue: '台灣',
      options: getAvailableCountries().map(country => ({ value: country, label: country })),
      description: '選擇國家或地區',
    },
  ],

  outputs: [
    {
      id: 'heat_value',
      name: '熱值',
      type: 'number',
      description: '燃料熱值數值',
    },
    {
      id: 'unit',
      name: '單位',
      type: 'string',
      description: '熱值單位',
    },
  ],

  execute: (context: ExecutionContext, params: Record<string, any>) => {
    const { fuel_type, country = '台灣' } = params

    if (!fuel_type) {
      throw new Error('缺少必填參數: fuel_type')
    }

    // 建立快取鍵
    const cacheKey = `${country}:${fuel_type}`

    // 檢查快取
    if (context.heatValueCache.has(cacheKey)) {
      const cachedValue = context.heatValueCache.get(cacheKey)!
      return {
        heat_value: cachedValue,
        unit: 'MJ/L', // 簡化處理，實際應從資料庫讀取
      }
    }

    // 從資料庫查詢
    const heatValueData = getHeatValue(fuel_type, country)

    if (!heatValueData) {
      context.warnings.push(
        `找不到 ${country} 的 ${fuel_type} 熱值，將使用國際預設值`
      )

      // 嘗試使用國際預設值
      const defaultHeatValue = getHeatValue(fuel_type, '國際')

      if (!defaultHeatValue) {
        throw new Error(`找不到 ${fuel_type} 的熱值資料`)
      }

      context.heatValueCache.set(cacheKey, defaultHeatValue.value)

      return {
        heat_value: defaultHeatValue.value,
        unit: defaultHeatValue.unit,
      }
    }

    // 存入快取
    context.heatValueCache.set(cacheKey, heatValueData.value)

    return {
      heat_value: heatValueData.value,
      unit: heatValueData.unit,
    }
  },

  validate: (params: Record<string, any>) => {
    const errors: string[] = []

    if (!params.fuel_type) {
      errors.push('fuel_type 為必填欄位')
    }

    // 檢查燃料類型是否存在
    if (params.fuel_type) {
      const fuelTypes = getAvailableFuelTypes()
      if (!fuelTypes.includes(params.fuel_type)) {
        errors.push(`不支援的燃料類型: ${params.fuel_type}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  ui: {
    icon: '🔥',
    color: '#ED8936',
    category: 'input',
    width: 200,
    height: 100,
  },
}
