// ============================================================================
// 預設公式模板
// ============================================================================

import { FormulaTemplate } from '@/types/formula.types'

/**
 * 系統預設模板
 */
export const systemTemplates: FormulaTemplate[] = [
  // ============================================================================
  // 模板 1: 權重組合係數 (向後相容現有功能)
  // ============================================================================
  {
    id: 'weighted-composite',
    name: '權重組合係數',
    description: '將多個排放係數進行加權平均計算，適用於混合燃料或複合材料的碳排放估算',
    category: 'weighted',

    modules: [
      {
        moduleId: 'weighted-average',
        instanceId: 'weighted-op-1',
        params: {
          // values 和 weights 由用戶輸入
        },
        position: { x: 200, y: 100 },
      },
    ],

    output: {
      unit: 'kg CO₂e/unit',
      name: '組合係數值',
      description: '加權平均後的組合排放係數',
    },

    ui: {
      icon: '⚖️',
      difficulty: 'basic',
    },

    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_system: true,
  },

  // ============================================================================
  // 模板 2: 燃料排放係數計算 (EF × 熱值 × 單位轉換)
  // ============================================================================
  {
    id: 'ef-heatvalue-convert',
    name: '燃料排放係數計算',
    description: '排放係數 × 熱值 × 單位轉換，例如：將燃料的排放係數從 L 單位轉換為 kWh 單位',
    category: 'conversion',

    modules: [
      {
        moduleId: 'factor-selector',
        instanceId: 'factor-1',
        params: {
          // ef_id 由用戶輸入
        },
        position: { x: 100, y: 100 },
      },
      {
        moduleId: 'heatvalue-fetcher',
        instanceId: 'heatvalue-1',
        params: {
          // fuel_type 和 country 由用戶輸入
        },
        position: { x: 300, y: 100 },
      },
      {
        moduleId: 'multiply',
        instanceId: 'multiply-1',
        params: {
          // a 從 factor-1 的輸出取得
          // b 從 heatvalue-1 的輸出取得
        },
        position: { x: 500, y: 100 },
      },
      {
        moduleId: 'unit-converter',
        instanceId: 'converter-1',
        params: {
          // value 從 multiply-1 的輸出取得
          // from_unit 和 to_unit 由用戶輸入
        },
        position: { x: 700, y: 100 },
      },
    ],

    output: {
      unit: 'kg CO₂e/kWh',
      name: '轉換後係數',
      description: '已轉換單位的排放係數',
    },

    ui: {
      icon: '🔥',
      difficulty: 'intermediate',
    },

    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_system: true,
  },

  // ============================================================================
  // 模板 3: 簡易乘法計算
  // ============================================================================
  {
    id: 'simple-multiply',
    name: '簡易乘法計算',
    description: '排放係數 × 常數，適用於簡單的係數調整或單位換算',
    category: 'conversion',

    modules: [
      {
        moduleId: 'factor-selector',
        instanceId: 'factor-1',
        params: {},
        position: { x: 150, y: 100 },
      },
      {
        moduleId: 'constant',
        instanceId: 'constant-1',
        params: {},
        position: { x: 350, y: 100 },
      },
      {
        moduleId: 'multiply',
        instanceId: 'multiply-1',
        params: {},
        position: { x: 550, y: 100 },
      },
    ],

    output: {
      unit: 'kg CO₂e/unit',
      name: '計算結果',
      description: '係數乘以常數的結果',
    },

    ui: {
      icon: '✖️',
      difficulty: 'basic',
    },

    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_system: true,
  },

  // ============================================================================
  // 模板 4: 單位轉換
  // ============================================================================
  {
    id: 'unit-conversion-only',
    name: '單位轉換',
    description: '將排放係數從一個單位轉換到另一個單位',
    category: 'conversion',

    modules: [
      {
        moduleId: 'factor-selector',
        instanceId: 'factor-1',
        params: {},
        position: { x: 200, y: 100 },
      },
      {
        moduleId: 'unit-converter',
        instanceId: 'converter-1',
        params: {},
        position: { x: 450, y: 100 },
      },
    ],

    output: {
      unit: 'kg CO₂e/unit',
      name: '轉換後係數',
      description: '單位轉換後的排放係數',
    },

    ui: {
      icon: '🔄',
      difficulty: 'basic',
    },

    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_system: true,
  },

  // ============================================================================
  // 模板 5: 自訂公式 (空白畫布)
  // ============================================================================
  {
    id: 'custom-formula',
    name: '自訂公式',
    description: '從零開始建立您的自訂公式，可自由組合各種模組',
    category: 'custom',

    modules: [],

    output: {
      unit: 'kg CO₂e/unit',
      name: '計算結果',
    },

    ui: {
      icon: '🎨',
      difficulty: 'advanced',
    },

    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_system: true,
  },
]

/**
 * 根據 ID 取得模板
 */
export function getTemplateById(templateId: string): FormulaTemplate | null {
  return systemTemplates.find((t) => t.id === templateId) || null
}

/**
 * 根據類別取得模板
 */
export function getTemplatesByCategory(
  category: 'weighted' | 'conversion' | 'custom'
): FormulaTemplate[] {
  return systemTemplates.filter((t) => t.category === category)
}

/**
 * 取得所有系統模板
 */
export function getAllSystemTemplates(): FormulaTemplate[] {
  return systemTemplates
}

/**
 * 檢查模板是否存在
 */
export function templateExists(templateId: string): boolean {
  return systemTemplates.some((t) => t.id === templateId)
}
