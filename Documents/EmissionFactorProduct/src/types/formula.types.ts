// 公式建構器相關型別定義

import { Node, Edge } from 'reactflow'

// 節點類型
export type FormulaNodeType =
  | 'emission_factor'      // 排放係數節點
  | 'heat_value'           // 熱值節點
  | 'operation'            // 運算節點
  | 'weighted_average'     // 加權平均節點
  | 'unit_conversion'      // 單位轉換節點
  | 'constant'             // 常數節點

// 運算類型
export type OperationType = 'multiply' | 'divide' | 'add' | 'subtract'

// 節點資料基礎介面
export interface BaseNodeData {
  label: string
  value?: number
  unit?: string
  error?: string
}

// 排放係數節點資料
export interface EmissionFactorNodeData extends BaseNodeData {
  factorId?: number // 改為可選的 number，配合資料庫 ID
  factorName: string
  factorValue: number
  factorUnit: string
  category?: 'fuel' | 'electricity' | 'process' // 改為可選
  region?: string // 新增地區資訊
  source_type?: string // 新增來源類型
  year?: number // 新增年份
}

// 熱值節點資料
export interface HeatValueNodeData extends BaseNodeData {
  heatValueId: string
  country: string
  fuelType: string
  heatValue: number
  heatUnit: string
}

// 運算節點資料
export interface OperationNodeData extends BaseNodeData {
  operation: OperationType
  operationSymbol: string
}

// 加權平均節點資料
export interface WeightedAverageNodeData extends BaseNodeData {
  weights: Array<{
    inputId: string
    weight: number
  }>
}

// 單位轉換節點資料
export interface UnitConversionNodeData extends BaseNodeData {
  fromUnit: string
  toUnit: string
  conversionFactor: number
}

// 常數節點資料
export interface ConstantNodeData extends BaseNodeData {
  constantValue: number
  constantUnit: string
}

// 聯合節點資料型別
export type FormulaNodeData =
  | EmissionFactorNodeData
  | HeatValueNodeData
  | OperationNodeData
  | WeightedAverageNodeData
  | UnitConversionNodeData
  | ConstantNodeData

// React Flow 節點型別（帶有型別標記）
export type FormulaNode = Node<FormulaNodeData> & {
  type: FormulaNodeType
}

// React Flow 邊（連接）型別
export type FormulaEdge = Edge

// 公式評估結果
export interface FormulaEvaluationResult {
  success: boolean
  finalValue?: number
  finalUnit?: string
  steps: EvaluationStep[]
  error?: string
}

// 評估步驟
export interface EvaluationStep {
  nodeId: string
  nodeType: FormulaNodeType
  nodeLabel: string
  inputValues: Array<{
    sourceId: string
    value: number
    unit: string
  }>
  outputValue: number
  outputUnit: string
  description: string
}

// 儲存的公式結構
export interface SavedFormula {
  id: string
  name: string
  description?: string
  nodes: FormulaNode[]
  edges: FormulaEdge[]
  finalValue: number
  finalUnit: string
  created_at: string
  updated_at: string
}

// 拖曳區塊模板
export interface BlockTemplate {
  id: string
  type: FormulaNodeType
  label: string
  icon: string
  description: string
  category: 'input' | 'operation' | 'conversion'
  color: string
}

// 區塊面板項目
export interface BlockPanelItem {
  template: BlockTemplate
  data?: Partial<FormulaNodeData>
}

// 單位相容性檢查結果
export interface UnitCompatibilityResult {
  compatible: boolean
  requiresConversion: boolean
  conversionFactor?: number
  message?: string
}

// 公式驗證結果
export interface FormulaValidationResult {
  valid: boolean
  errors: Array<{
    nodeId?: string
    edgeId?: string
    message: string
    type: 'error' | 'warning'
  }>
}

// 公式建構器狀態
export interface FormulaBuilderState {
  nodes: FormulaNode[]
  edges: FormulaEdge[]
  selectedNodeId: string | null
  evaluationResult: FormulaEvaluationResult | null
  isEvaluating: boolean
}

// ============================================================================
// 模板系統 - 新增型別定義
// ============================================================================

import { EmissionFactor } from './types'

// ----------------------------------------------------------------------------
// 模組類型定義 (Template System)
// ----------------------------------------------------------------------------

export type ModuleType =
  | 'factor-selector'      // 選擇排放係數
  | 'heatvalue-fetcher'    // 取得熱值
  | 'multiply'             // 乘法運算
  | 'weighted-average'     // 權重平均
  | 'weighted-sum'         // 權重加總
  | 'unit-converter'       // 單位轉換
  | 'constant'             // 常數輸入

export type ModuleCategory = 'input' | 'operation' | 'conversion' | 'output'

export interface ModuleInput {
  id: string
  name: string
  type: 'number' | 'string' | 'factor' | 'array' | 'select'
  required: boolean
  defaultValue?: any
  options?: Array<{ value: any; label: string }>  // 用於 select 類型
  placeholder?: string
  description?: string
}

export interface ModuleOutput {
  id: string
  name: string
  type: 'number' | 'string' | 'factor' | 'array' | 'object'
  description?: string
}

// ----------------------------------------------------------------------------
// 執行上下文
// ----------------------------------------------------------------------------

export interface ExecutionContext {
  variables: Record<string, any>
  previousValue?: any
  factorCache: Map<number, EmissionFactor>
  heatValueCache: Map<string, number>
  errors: string[]
  warnings: string[]
}

// ----------------------------------------------------------------------------
// 模組定義
// ----------------------------------------------------------------------------

export interface FormulaModule {
  id: string
  type: ModuleType
  name: string
  description: string

  // 輸入/輸出定義
  inputs: ModuleInput[]
  outputs: ModuleOutput[]

  // 執行函數
  execute: (context: ExecutionContext, params: Record<string, any>) => any

  // 驗證函數
  validate?: (params: Record<string, any>) => { isValid: boolean; errors: string[] }

  // UI 配置
  ui: {
    icon: string
    color: string
    category: ModuleCategory
    width?: number   // React Flow 節點寬度
    height?: number  // React Flow 節點高度
  }
}

// ----------------------------------------------------------------------------
// 模板定義
// ----------------------------------------------------------------------------

export interface ModuleConfig {
  moduleId: string      // 對應 FormulaModule.id
  instanceId: string    // 此模組在模板中的唯一 ID
  params: Record<string, any>
  position?: { x: number; y: number }  // 視覺化編輯器位置
}

export interface FormulaTemplate {
  id: string
  name: string
  description: string
  category: 'weighted' | 'conversion' | 'custom'

  // 模組鏈定義
  modules: ModuleConfig[]

  // 輸出配置
  output: {
    unit: string
    name: string
    description?: string
  }

  // UI 配置
  ui: {
    icon?: string
    thumbnail?: string
    difficulty: 'basic' | 'intermediate' | 'advanced'
  }

  created_at: string
  updated_at: string
  created_by?: string
  is_system: boolean  // 系統預設模板 vs 用戶自訂
}

// ----------------------------------------------------------------------------
// 模板實例
// ----------------------------------------------------------------------------

export interface CalculationStep {
  moduleId: string
  moduleName: string
  input: any
  output: any
  timestamp: string
  duration?: number  // 執行時間 (ms)
}

export interface TemplateInstance {
  id: number
  template_id: string
  name: string
  description?: string

  // 用戶填入的參數值
  params: Record<string, any>

  // 計算結果
  computed_value: number
  unit: string

  // 中繼資料
  metadata: {
    calculation_steps: CalculationStep[]
    warnings: string[]
    errors: string[]
    total_duration?: number  // 總執行時間 (ms)
  }

  // 向後相容
  legacy_composite_id?: number  // 如果是從舊 CompositeFactor 遷移

  created_at: string
  updated_at: string
  created_by?: string
}

// ----------------------------------------------------------------------------
// 評估結果
// ----------------------------------------------------------------------------

export interface EvaluationResult {
  success: boolean
  value: number
  unit: string
  steps: CalculationStep[]
  warnings: string[]
  errors: string[]
  duration: number  // 總執行時間 (ms)
}

// ----------------------------------------------------------------------------
// 熱值資料結構
// ----------------------------------------------------------------------------

export interface HeatValue {
  fuel_type: string       // 燃料類型 (e.g., '柴油', '汽油', '天然氣')
  country: string         // 國家/地區
  value: number           // 熱值
  unit: string            // 單位 (e.g., 'MJ/L', 'MJ/kg', 'MJ/Nm³')
  source: string          // 資料來源
  year: number            // 年份
  description?: string
}

// ----------------------------------------------------------------------------
// 單位轉換對照表
// ----------------------------------------------------------------------------

export interface UnitConversion {
  from: string
  to: string
  factor: number
  category: 'energy' | 'mass' | 'volume' | 'emission'
}

// ----------------------------------------------------------------------------
// React Flow 模組節點資料
// ----------------------------------------------------------------------------

export interface ModuleNodeData {
  moduleId: string
  moduleName: string
  icon: string
  color: string
  params: Record<string, any>
  outputs?: any
  errors?: string[]
  onUpdate?: (params: Record<string, any>) => void
  onDelete?: () => void
}
