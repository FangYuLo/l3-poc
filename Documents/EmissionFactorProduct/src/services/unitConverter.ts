// 單位轉換邏輯

import { mockUnitConversions, parseCompoundUnit } from '@/data/mockFormulaData'
import { UnitCompatibilityResult } from '@/types/formula.types'

// 獲取單位轉換係數
export function getConversionFactor(fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return 1

  // 直接查找轉換
  const directConversion = mockUnitConversions.find(
    c => c.from === fromUnit && c.to === toUnit
  )
  if (directConversion) return directConversion.factor

  // 嘗試反向查找
  const reverseConversion = mockUnitConversions.find(
    c => c.from === toUnit && c.to === fromUnit
  )
  if (reverseConversion) return 1 / reverseConversion.factor

  return null
}

// 轉換數值和單位
export function convertUnit(value: number, fromUnit: string, toUnit: string): { value: number; unit: string } | null {
  const factor = getConversionFactor(fromUnit, toUnit)

  if (factor === null) {
    return null
  }

  return {
    value: value * factor,
    unit: toUnit
  }
}

// 檢查兩個單位是否相容（可以進行運算）
export function checkUnitCompatibility(unit1: string, unit2: string, operation: 'multiply' | 'divide' | 'add' | 'subtract'): UnitCompatibilityResult {
  // 加法和減法要求單位相同或可轉換
  if (operation === 'add' || operation === 'subtract') {
    if (unit1 === unit2) {
      return { compatible: true, requiresConversion: false }
    }

    const conversionFactor = getConversionFactor(unit2, unit1)
    if (conversionFactor !== null) {
      return {
        compatible: true,
        requiresConversion: true,
        conversionFactor,
        message: `將 ${unit2} 轉換為 ${unit1}`
      }
    }

    return {
      compatible: false,
      requiresConversion: false,
      message: `單位 ${unit1} 和 ${unit2} 無法進行 ${operation === 'add' ? '加法' : '減法'} 運算`
    }
  }

  // 乘法和除法：單位會組合或約分
  return { compatible: true, requiresConversion: false }
}

// 計算運算後的單位
export function calculateResultUnit(unit1: string, unit2: string, operation: 'multiply' | 'divide' | 'add' | 'subtract'): string {
  // 加法和減法：結果單位與第一個操作數相同
  if (operation === 'add' || operation === 'subtract') {
    return unit1
  }

  // 乘法
  if (operation === 'multiply') {
    return multiplyUnits(unit1, unit2)
  }

  // 除法
  if (operation === 'divide') {
    return divideUnits(unit1, unit2)
  }

  return unit1
}

// 單位相乘
function multiplyUnits(unit1: string, unit2: string): string {
  // 解析複合單位
  const parsed1 = parseCompoundUnit(unit1)
  const parsed2 = parseCompoundUnit(unit2)

  // 簡單情況：兩個都是簡單單位
  if (!parsed1 && !parsed2) {
    // 嘗試約分（例如 L × L⁻¹ = 1）
    if (unit1 === unit2) {
      return unit1 + '²'
    }
    return `${unit1}·${unit2}`
  }

  // 複雜情況：處理複合單位
  // 例如：(kgCO2/MJ) × MJ = kgCO2
  if (parsed1 && !parsed2) {
    if (parsed1.denominator === unit2) {
      return parsed1.numerator // 約分
    }
    return `${unit1}·${unit2}`
  }

  if (!parsed1 && parsed2) {
    if (parsed2.denominator === unit1) {
      return parsed2.numerator // 約分
    }
    return `${unit1}·${unit2}`
  }

  // 兩個都是複合單位
  return `(${unit1})·(${unit2})`
}

// 單位相除
function divideUnits(unit1: string, unit2: string): string {
  // 解析複合單位
  const parsed1 = parseCompoundUnit(unit1)
  const parsed2 = parseCompoundUnit(unit2)

  // 簡單情況：相同單位相除
  if (unit1 === unit2) {
    return '1' // 無單位
  }

  // 簡單除法
  if (!parsed1 && !parsed2) {
    return `${unit1}/${unit2}`
  }

  // 複雜情況
  if (parsed1 && !parsed2) {
    // (kgCO2/MJ) / kgCO2 = 1/MJ
    if (parsed1.numerator === unit2) {
      return `1/${parsed1.denominator}`
    }
    return `${unit1}/${unit2}`
  }

  return `(${unit1})/(${unit2})`
}

// 簡化單位表示（移除冗余）
export function simplifyUnit(unit: string): string {
  // 移除 "1·" 前綴
  unit = unit.replace(/^1·/, '')

  // 移除 "·1" 後綴
  unit = unit.replace(/·1$/, '')

  // 如果只剩 "1"，返回空字符串或 "無單位"
  if (unit === '1') {
    return ''
  }

  return unit
}
