// Base types
export type SourceType = 'standard' | 'pact' | 'supplier' | 'user_defined' | 'project_data'
export type CollectionType = 'favorites' | 'user_defined' | 'pact' | 'supplier' | 'project'
export type FormulaType = 'sum' | 'weighted'

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

// Utility types
export type Factor = EmissionFactor | CompositeFactor
export type FactorId = { type: 'emission_factor'; id: number } | { type: 'composite_factor'; id: number }