// Base types
export type SourceType = 'standard' | 'pact' | 'supplier' | 'user_defined' | 'project_data' | 'global'
export type CollectionType = 'favorites' | 'user_defined' | 'pact' | 'supplier' | 'project'
export type FormulaType = 'sum' | 'weighted'

// 數據品質類型
export type DataQuality = 'Primary' | 'Secondary' | 'Tertiary'
export type ValidationStatus = 'verified' | 'pending' | 'rejected'

// 專案引用資訊
export interface ProjectReference {
  project_id: string
  project_name: string
  project_type: 'L1' | 'L2' | 'L4' // L1: 組織碳盤查, L2: 產品碳足跡, L4: 供應商係數
  usage_count: number
  last_used_date: string
}

// 係數使用追蹤
export interface FactorUsageInfo {
  total_usage_count: number
  project_references: ProjectReference[]
  usage_summary: string // 格式化的使用摘要文字
}

// Emission Factor
export interface EmissionFactor {
  id: number
  source: string              // 係數來源 (如: 英國 - GHG Emission Factors Hub 2024)
  name: string                // 係數名稱
  effective_date: string      // 啟用日期
  continent: string           // 大洲
  country: string             // 國家
  region?: string             // 地區 (可選)

  // 排放係數數據
  co2_factor: number          // CO₂係數值
  co2_unit: string            // CO₂單位
  ch4_factor?: number         // CH₄係數值
  ch4_unit?: string           // CH₄單位
  n2o_factor?: number         // N₂O係數值
  n2o_unit?: string           // N₂O單位

  // 保留的原有欄位
  value: number               // 主要係數值 (向後相容)
  unit: string                // 主要單位 (向後相容)
  year?: number               // 年份 (向後相容)
  method_gwp?: string
  source_type: SourceType
  source_ref?: string
  version: string
  description?: string
  notes?: string              // 備註 (新增)
  created_at: string
  updated_at: string

  // GWP 轉換標記
  requires_gwp_conversion?: boolean // 是否需要 GWP 轉換（當有多氣體數據但未轉換成 CO2e 時）

  // 新增欄位 - 數據品質和追蹤
  data_quality: DataQuality   // 數據品質等級
  validation_status?: ValidationStatus // 驗證狀態
  quality_score?: number      // 品質評分 (0-100)
  usage_info?: FactorUsageInfo // 使用資訊

  // 新增欄位 - 中央庫設定資訊
  isic_categories?: string[]        // 適用產業分類 (ISIC)
  lifecycle_stages?: string[]       // 適用生命週期階段
  system_boundary_detail?: string   // 系統邊界詳細說明（用於顯示）
}

// Composite Factor
export interface CompositeFactor {
  id: number
  name: string
  formula_type: FormulaType
  computed_value: number
  unit: string
  description?: string
  created_by?: string
  created_at: string
  updated_at: string
  components: CompositeFactorComponent[]

  // 新增欄位 - 數據品質和追蹤
  data_quality: DataQuality   // 自建係數預設為 Tertiary
  validation_status?: ValidationStatus
  usage_info?: FactorUsageInfo

  // 新增欄位 - 中央庫設定資訊
  isic_categories?: string[]        // 適用產業分類 (ISIC)
  lifecycle_stages?: string[]       // 適用生命週期階段
  system_boundary_detail?: string   // 系統邊界詳細說明
}

export interface CompositeFactorComponent {
  id: number
  composite_id: number
  ef_id: number
  weight: number
  emission_factor?: EmissionFactor
}

// Project and Emission Source
export interface Project {
  id: number
  name: string
  description?: string
  created_by?: string
  created_at: string
  updated_at: string
  emission_sources: EmissionSource[]
}

export interface EmissionSource {
  id: number
  project_id: number
  name: string
  description?: string
  created_at: string
}

// Project Factor Links (version locking)
export interface ProjectFactorLink {
  id: number
  project_id: number
  emission_source_id: number
  ef_id?: number
  composite_id?: number
  effective_version: string
  linked_at: string
  emission_factor?: EmissionFactor
  composite_factor?: CompositeFactor
}

// Collections
export interface Collection {
  id: number
  type: CollectionType
  name: string
  project_id?: number
  created_by?: string
  created_at: string
  items?: CollectionItem[]
}

export interface CollectionItem {
  id: number
  collection_id: number
  ef_id?: number
  composite_id?: number
  added_at: string
  emission_factor?: EmissionFactor
  composite_factor?: CompositeFactor
}

// UI State types
export interface TreeNode {
  id: string
  name: string
  type: 'collection' | 'project' | 'emission_source' | 'product' | 'yearly_inventory'
  collection_type?: CollectionType
  project_id?: number
  product_id?: number
  emission_source_id?: number
  year?: number
  children?: TreeNode[]
  isExpanded?: boolean
}

export interface FactorTableItem {
  id: number
  type: 'emission_factor' | 'composite_factor' | 'project_item'
  name: string
  value: number
  unit: string
  year?: number
  region?: string
  method_gwp?: string
  source_type?: SourceType
  source_ref?: string
  version: string
  data: any // Temporary: Make this more flexible for deployment

  // 新增欄位 - 品質和追蹤
  data_quality?: DataQuality
  validation_status?: ValidationStatus
  quality_score?: number
  usage_info?: FactorUsageInfo
  usageText?: string // 格式化後的使用摘要文字（向後相容）

  // 同步追蹤欄位（用於從自建係數匯入到中央庫的係數）
  source_composite_id?: number        // 來源自建係數 ID
  source_version?: string             // 來源係數版本
  synced_at?: string                  // 同步時間
  synced_version?: string             // 已同步版本
  imported_to_central?: boolean       // 標記為已匯入中央庫
  imported_at?: string                // 首次匯入時間
  last_synced_at?: string             // 最後同步時間
  last_synced_version?: string        // 最後同步版本

  // 完整排放係數資訊（用於詳情頁面顯示）
  co2_factor?: number
  ch4_factor?: number
  n2o_factor?: number
  co2_unit?: string
  ch4_unit?: string
  n2o_unit?: string
  source?: string                     // 完整來源描述
  effective_date?: string             // 生效日期
  continent?: string                  // 大洲
  country?: string                    // 國家
  formula_type?: 'weighted' | 'sum'   // 計算方法
  components?: any[]                  // 組成係數
}

export interface SearchFacets {
  regions: string[]
  years: number[]
  units: string[]
  methods: string[]
  sourceTypes: SourceType[]
}

export interface SearchFilters {
  keyword: string
  regions: string[]
  years: number[]
  units: string[]
  methods: string[]
  sourceTypes: SourceType[]
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Store types (for Zustand)
export interface AppState {
  // Navigation
  selectedNode: TreeNode | null
  expandedNodes: Set<string>
  
  // Current data
  currentFactors: FactorTableItem[]
  selectedFactor: FactorTableItem | null
  
  // UI states
  isGlobalSearchOpen: boolean
  isCompositeEditorOpen: boolean
  isLoading: boolean
  
  // Search
  searchResults: FactorTableItem[]
  searchFilters: SearchFilters
  searchFacets: SearchFacets
  
  // Composite editor
  compositeComponents: CompositeFactorComponent[]
  compositeFormula: FormulaType
  
  // Actions
  setSelectedNode: (node: TreeNode | null) => void
  setExpandedNode: (nodeId: string, expanded: boolean) => void
  setCurrentFactors: (factors: FactorTableItem[]) => void
  setSelectedFactor: (factor: FactorTableItem | null) => void
  setGlobalSearchOpen: (open: boolean) => void
  setCompositeEditorOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setSearchResults: (results: FactorTableItem[]) => void
  setSearchFilters: (filters: SearchFilters) => void
  setSearchFacets: (facets: SearchFacets) => void
  addCompositeComponent: (component: CompositeFactorComponent) => void
  removeCompositeComponent: (componentId: number) => void
  updateCompositeComponent: (componentId: number, updates: Partial<CompositeFactorComponent>) => void
  setCompositeFormula: (formula: FormulaType) => void
  clearCompositeComponents: () => void
}

// Form types
export interface CreateCompositeFactorForm {
  name: string
  formula_type: FormulaType
  unit: string
  description?: string
  components: Array<{
    ef_id: number
    weight: number
  }>
}

// Dataset (User-defined factor collections)
export interface Dataset {
  id: string
  name: string
  description?: string
  factorIds: number[] // IDs of factors in this dataset
  created_by?: string
  created_at: string
  updated_at: string
}

// Product Carbon Footprint Summary
export interface ProductCarbonFootprintSummary {
  productId: string
  productName: string
  functionalUnit: string
  totalFootprint: number
  unit: string
  stageBreakdown: {
    stage: string
    emission: number
    percentage: number
  }[]
  calculationDate: string
  standard: string
  isImported: boolean
}

// L2 Project Info
export interface L2ProjectInfo {
  projectId: string
  projectName: string
  lastImportDate: string
  version: string
  status: 'locked' | 'unlocked' | 'draft'
  productCount: number
  pactProductCount: number
}

// Project Product Item
export interface ProjectProductItem {
  id: string
  type: 'product' | 'pact'
  name: string
  carbonFootprint: number | null
  unit: string
  projectStatus: 'locked' | 'unlocked' | 'verified' | 'draft'
  centralLibStatus: 'imported' | 'not_imported' | 'pending'
  lastUpdated: string
}

// L1 Project Info (組織碳盤查專案)
export interface L1ProjectInfo {
  projectId: string
  projectName: string
  lastImportDate: string
  version: string
  status: 'locked' | 'unlocked' | 'draft'
  inventoryYearCount: number  // 盤查年度數量
  totalScopeCount: number     // 總排放源數量
}

// Inventory Year Item (盤查年度項目)
export interface InventoryYearItem {
  id: string
  year: number
  name: string  // 例如: "2024年度盤查"
  totalEmission: number | null  // 總排放量
  unit: string  // kg CO₂e
  organizationalBoundary: string  // 組織盤查邊界（分公司名稱）
  scope1Count: number
  scope2Count: number
  scope3Count: number
  projectStatus: 'locked' | 'unlocked' | 'verified' | 'draft'
  centralLibStatus: 'imported' | 'not_imported' | 'pending'
  lastUpdated: string
}

// Product Footprint Factor (產品碳足跡係數)
export interface ProductFootprintFactor extends EmissionFactor {
  footprint_type: 'product_footprint'  // 標記為產品碳足跡係數
  functional_unit: string               // 功能單位
  product_name: string                  // 產品名稱

  // 適用範圍
  product_categories: string[]          // 產品類別標籤
  geographic_scope: 'taiwan' | 'asia' | 'global' | string
  temporal_validity: {
    valid_from: string                  // 有效起始年份
    valid_years: number                 // 預計有效年限
  }

  // 計算邊界
  system_boundary: 'cradle_to_grave' | 'cradle_to_gate' | 'gate_to_gate'
  exclusions?: string                   // 排除項目說明

  // 數據品質資訊
  data_sources: {
    primary_data_percentage: number     // 實測數據佔比
    secondary_data_percentage: number   // 次級數據佔比
  }

  // 階段分解
  stage_breakdown: {
    raw_material: number                // 原物料階段排放
    manufacturing: number               // 製造階段排放
    distribution: number                // 配送階段排放
    use: number                         // 使用階段排放
    disposal: number                    // 廢棄階段排放
  }

  // 計算資訊
  calculation_standard: string          // 計算依據標準
  calculation_date: string              // 計算日期
  source_project_id: string             // 來源專案ID
  source_project_name: string           // 來源專案名稱
  calculation_details_link?: string     // 計算細節連結

  // 使用建議
  usage_notes?: string                  // 使用建議說明
  reference_documents?: string[]        // 參考文件
}

// Import to Central Form Data (匯入中央庫表單資料)
export interface ImportToCentralFormData {
  // 基本資訊（自動帶入，可編輯）
  factor_name: string
  functional_unit: string
  carbon_footprint_value: number
  unit: string

  // 適用範圍
  product_categories: string[]
  geographic_scope: string
  valid_from: string
  valid_years: number

  // 計算邊界
  system_boundary: string
  exclusions?: string

  // 數據品質
  primary_data_percentage: number
  secondary_data_percentage: number
  data_quality: DataQuality

  // 使用建議
  usage_notes?: string
  reference_documents?: File[]
}

// Import Composite to Central Form Data (組合係數匯入中央庫表單資料)
export interface ImportCompositeToCentralFormData {
  // 基本資訊（自動帶入，可編輯）
  factor_name: string
  description: string
  factor_value: number
  unit: string

  // 適用範圍（必填）
  isic_categories: string[]  // ISIC 產業分類（必填）
  geographic_scope: string   // 地理範圍（自動對應，可修改）

  // 產品生命週期階段（必填）
  lifecycle_stages: string[]

  // 數據品質（必填）
  data_quality: 'Secondary' | 'Primary'

  // 自動生成欄位
  valid_from?: string                // 啟用日期（自動使用 enabledDate）
  composition_notes?: string         // 組成說明（自動生成）
  system_boundary_detail?: string    // 系統邊界詳細說明（自動生成）
}

// Utility types
export type Factor = EmissionFactor | CompositeFactor | ProductFootprintFactor
export type FactorId = { type: 'emission_factor'; id: number } | { type: 'composite_factor'; id: number } | { type: 'product_footprint'; id: number }