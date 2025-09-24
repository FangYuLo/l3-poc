import { useMemo } from 'react'
import { EmissionFactor, CompositeFactor, FactorTableItem, SourceType } from '@/types/types'
import { mockEmissionFactors, mockCompositeFactors } from '@/data/mockDatabase'
import { 
  mockProductCarbonFootprintData, 
  mockOrganizationalInventoryData 
} from '@/data/mockProjectData'
import { 
  favoriteFactorIds, 
  pactFactorIds, 
  supplierFactorIds, 
  compositeFactorIds,
  getCollectionCounts,
  isFactorInCollection 
} from '@/data/mockCollections'
import { 
  calculateFactorUsage, 
  getFactorUsageById, 
  getAllUsedFactors, 
  formatProjectUsage,
  type FactorUsage,
  type ProjectUsage 
} from '@/data/factorProjectMapping'

export interface CollectionCounts {
  favorites: number
  pact: number
  supplier: number
  user_defined: number
  composite: number
}

// 擴展 FactorTableItem 以包含引用資訊
export interface ExtendedFactorTableItem extends FactorTableItem {
  projectUsage?: ProjectUsage[]
  usageText?: string
}

/**
 * 統一的假資料存取 Hook
 * 提供所有組件需要的資料存取方法
 */
export function useMockData() {
  
  // 將 EmissionFactor 轉換為 FactorTableItem 格式
  const convertToTableItem = (factor: EmissionFactor): FactorTableItem => ({
    id: factor.id,
    type: 'emission_factor',
    name: factor.name,
    value: factor.value,
    unit: factor.unit,
    year: factor.year,
    region: factor.country,
    method_gwp: factor.method_gwp,
    source_type: factor.source_type,
    source_ref: factor.source_ref,
    version: factor.version,
    data: factor
  })

  // 將 CompositeFactor 轉換為 FactorTableItem 格式
  const convertCompositeToTableItem = (factor: CompositeFactor): FactorTableItem => ({
    id: factor.id,
    type: 'composite_factor',
    name: factor.name,
    value: factor.computed_value,
    unit: factor.unit,
    region: 'User Defined',
    method_gwp: 'GWP100',
    source_type: 'user_defined',
    version: '1.0',
    data: factor
  })

  // 快取轉換結果
  const allEmissionFactorItems = useMemo(
    () => mockEmissionFactors.map(convertToTableItem),
    []
  )

  const allCompositeFactorItems = useMemo(
    () => mockCompositeFactors.map(convertCompositeToTableItem),
    []
  )

  // 將專案碳足跡資料轉換為 FactorTableItem 格式
  const convertProjectCarbonFootprintToTableItem = (item: typeof mockProductCarbonFootprintData[0]): FactorTableItem => ({
    id: item.id + 10000, // 避免ID衝突
    type: 'project_item',
    name: `${item.stage} - ${item.item_name}`,
    value: 0, // 專案資料沒有具體係數值，先設為0
    unit: item.quantity_spec,
    year: item.year,
    region: '台灣',
    method_gwp: 'GWP100',
    source_type: 'project_data',
    source_ref: item.factor_selection,
    version: '1.0',
    data: {
      ...item,
      type: 'product_carbon_footprint',
      product_name: item.product === 'smartphone' ? '智慧型手機' : 
                   item.product === 'led_light' ? 'LED燈具' : 
                   item.product === 'laptop' ? '筆記型電腦' : item.product
    }
  })

  // 將組織盤查資料轉換為 FactorTableItem 格式
  const convertOrganizationalInventoryToTableItem = (item: typeof mockOrganizationalInventoryData[0]): FactorTableItem => ({
    id: item.id + 20000, // 避免ID衝突
    type: 'project_item',
    name: `${item.scope} - ${item.emission_source_name}`,
    value: item.activity_data,
    unit: item.activity_data_unit,
    year: item.year,
    region: '台灣',
    method_gwp: 'GWP100',
    source_type: 'project_data',
    source_ref: item.factor_selection,
    version: item.version,
    data: {
      ...item,
      type: 'organizational_inventory'
    }
  })

  // 所有專案碳足跡項目
  const allProductCarbonFootprintItems = useMemo(
    () => mockProductCarbonFootprintData.map(convertProjectCarbonFootprintToTableItem),
    []
  )

  // 所有組織盤查項目
  const allOrganizationalInventoryItems = useMemo(
    () => mockOrganizationalInventoryData.map(convertOrganizationalInventoryToTableItem),
    []
  )

  // 所有係數項目（排放係數 + 組合係數 + 專案資料）
  const allFactorItems = useMemo(
    () => [...allEmissionFactorItems, ...allCompositeFactorItems, ...allProductCarbonFootprintItems, ...allOrganizationalInventoryItems],
    [allEmissionFactorItems, allCompositeFactorItems, allProductCarbonFootprintItems, allOrganizationalInventoryItems]
  )

  // 快取係數使用情況計算
  const factorUsageMap = useMemo(() => calculateFactorUsage(), [])

  // 快取中央係數庫資料
  const centralLibraryFactors = useMemo((): ExtendedFactorTableItem[] => {
    const usageMap = new Map(factorUsageMap.map(u => [u.factorId, u.usedInProjects]))

    // 只選擇被專案使用的係數
    const usedFactorItems = allEmissionFactorItems
      .filter(item => usageMap.has(item.id)) // 只包含被使用的係數
      .map(item => ({
        ...item,
        projectUsage: usageMap.get(item.id) || [],
        usageText: formatProjectUsage(usageMap.get(item.id) || [])
      }))

    // 按使用次數降序排序，次數相同時按名稱排序
    return usedFactorItems.sort((a, b) => {
      const aUsageCount = a.projectUsage?.length || 0
      const bUsageCount = b.projectUsage?.length || 0
      
      if (aUsageCount !== bUsageCount) {
        return bUsageCount - aUsageCount // 使用次數多的在前
      }
      
      // 使用次數相同時按名稱排序
      return a.name.localeCompare(b.name, 'zh-TW')
    })
  }, [allEmissionFactorItems, factorUsageMap])

  return {
    // === 基礎資料存取 ===
    
    /**
     * 取得所有排放係數
     */
    getAllEmissionFactors: () => mockEmissionFactors,
    
    /**
     * 取得所有組合係數
     */
    getAllCompositeFactors: () => mockCompositeFactors,
    
    /**
     * 取得所有係數項目（用於表格顯示）
     */
    getAllFactorItems: () => allFactorItems,

    /**
     * 根據ID取得單一排放係數
     */
    getEmissionFactorById: (id: number): EmissionFactor | undefined => 
      mockEmissionFactors.find(factor => factor.id === id),

    /**
     * 根據ID取得單一組合係數
     */
    getCompositeFactorById: (id: number): CompositeFactor | undefined =>
      mockCompositeFactors.find(factor => factor.id === id),

    // === 集合類型資料存取 ===

    /**
     * 取得常用係數
     */
    getFavoriteFactors: (): FactorTableItem[] => 
      allEmissionFactorItems.filter(item => favoriteFactorIds.includes(item.id)),

    /**
     * 取得PACT係數
     */
    getPactFactors: (): FactorTableItem[] =>
      allEmissionFactorItems.filter(item => pactFactorIds.includes(item.id)),

    /**
     * 取得供應商係數
     */
    getSupplierFactors: (): FactorTableItem[] =>
      allEmissionFactorItems.filter(item => supplierFactorIds.includes(item.id)),

    /**
     * 取得組合係數（用戶自建）
     */
    getUserDefinedFactors: (): FactorTableItem[] => allCompositeFactorItems,

    // === 根據類型篩選 ===

    /**
     * 根據來源類型篩選係數
     */
    getFactorsBySourceType: (sourceType: SourceType): FactorTableItem[] =>
      allEmissionFactorItems.filter(item => item.source_type === sourceType),

    /**
     * 根據國家篩選係數
     */
    getFactorsByCountry: (country: string): FactorTableItem[] =>
      allEmissionFactorItems.filter(item => 
        mockEmissionFactors.find(f => f.id === item.id)?.country === country
      ),

    /**
     * 根據年份篩選係數
     */
    getFactorsByYear: (year: number): FactorTableItem[] =>
      allEmissionFactorItems.filter(item => item.year === year),

    // === 搜尋功能 ===

    /**
     * 搜尋係數（支援名稱、來源、單位搜尋）
     */
    searchFactors: (keyword: string): FactorTableItem[] => {
      if (!keyword.trim()) return allFactorItems
      
      const searchTerm = keyword.toLowerCase().trim()
      return allFactorItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.unit.toLowerCase().includes(searchTerm) ||
        item.source_type?.toLowerCase().includes(searchTerm) ||
        (item.data as EmissionFactor).source?.toLowerCase().includes(searchTerm)
      )
    },

    /**
     * 根據ID列表取得係數
     */
    getFactorsByIds: (ids: number[]): FactorTableItem[] =>
      allFactorItems.filter(item => ids.includes(item.id)),

    // === 統計資訊 ===

    /**
     * 取得各集合的係數數量
     */
    getCollectionCounts: (): CollectionCounts => ({
      ...getCollectionCounts(),
      user_defined: allCompositeFactorItems.length
    }),

    /**
     * 取得總係數數量
     */
    getTotalFactorCount: (): number => allFactorItems.length,

    /**
     * 取得搜尋篩選選項
     */
    getSearchFacets: () => ({
      countries: Array.from(new Set(mockEmissionFactors.map(f => f.country))).sort(),
      years: Array.from(new Set(mockEmissionFactors.map(f => f.year).filter(Boolean))).sort((a, b) => b! - a!),
      units: Array.from(new Set(mockEmissionFactors.map(f => f.unit))).sort(),
      sourceTypes: Array.from(new Set(mockEmissionFactors.map(f => f.source_type))),
      continents: Array.from(new Set(mockEmissionFactors.map(f => f.continent))).sort()
    }),

    // === 實用工具函數 ===

    /**
     * 檢查係數是否在指定集合中
     */
    isFactorInCollection: (factorId: number, collection: 'favorites' | 'pact' | 'supplier' | 'composite') =>
      isFactorInCollection(factorId, collection),

    /**
     * 格式化係數顯示
     */
    formatFactorValue: (value: number, unit: string): string => {
      const formatted = value >= 1000 
        ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
        : value.toFixed(4)
      return `${formatted} ${unit}`
    },

    // === 專案資料存取 ===

    /**
     * 取得專案A產品碳足跡資料
     */
    getProjectAData: (productType?: 'smartphone' | 'led_light' | 'laptop'): FactorTableItem[] => {
      let data = allProductCarbonFootprintItems
      if (productType) {
        data = data.filter(item => (item.data as any).product === productType)
      }
      return data
    },

    /**
     * 取得專案B組織盤查資料
     */
    getProjectBData: (year?: number, scope?: 'Scope 1' | 'Scope 2' | 'Scope 3'): FactorTableItem[] => {
      let data = allOrganizationalInventoryItems
      if (year) {
        data = data.filter(item => item.year === year)
      }
      if (scope) {
        data = data.filter(item => (item.data as any).scope === scope)
      }
      return data
    },

    /**
     * 根據節點ID取得專案資料
     */
    getProjectDataByNodeId: (nodeId: string): FactorTableItem[] => {
      // 專案A產品節點
      if (nodeId === 'product_1_1') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'smartphone')
      }
      if (nodeId === 'product_1_2') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'led_light')
      }
      if (nodeId === 'product_1_3') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'laptop')
      }

      // 專案B年份節點
      if (nodeId === 'year_2_2024') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2024)
      }
      if (nodeId === 'year_2_2023') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2023)
      }
      if (nodeId === 'year_2_2022') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2022)
      }

      // 專案A排放源節點 - 按階段篩選
      if (nodeId.startsWith('source_1_1_')) { // 智慧型手機的排放源
        const data = allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'smartphone')
        const sourceId = nodeId.split('_')[3]
        if (sourceId === '1') return data.filter(item => (item.data as any).stage === '原物料')
        if (sourceId === '2') return data.filter(item => (item.data as any).stage === '製造')
        if (sourceId === '3') return data.filter(item => ['配送', '使用', '廢棄'].includes((item.data as any).stage))
      }
      
      if (nodeId.startsWith('source_1_2_')) { // LED燈具的排放源
        const data = allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'led_light')
        const sourceId = nodeId.split('_')[3]
        if (sourceId === '1') return data.filter(item => (item.data as any).stage === '原物料')
        if (sourceId === '2') return data.filter(item => (item.data as any).stage === '製造')
        if (sourceId === '3') return data.filter(item => ['配送', '使用', '廢棄'].includes((item.data as any).stage))
      }
      
      if (nodeId.startsWith('source_1_3_')) { // 筆記型電腦的排放源
        const data = allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'laptop')
        const sourceId = nodeId.split('_')[3]
        if (sourceId === '1') return data.filter(item => (item.data as any).stage === '原物料')
        if (sourceId === '2') return data.filter(item => (item.data as any).stage === '製造')
        if (sourceId === '3') return data.filter(item => ['配送', '使用', '廢棄'].includes((item.data as any).stage))
      }

      // 專案B排放源節點 - 按Scope篩選
      if (nodeId.startsWith('source_2_')) {
        const parts = nodeId.split('_')
        const year = parseInt(parts[2])
        const scopeId = parts[3]
        
        let data = allOrganizationalInventoryItems.filter(item => item.year === year)
        
        if (scopeId === '1') return data.filter(item => (item.data as any).scope === 'Scope 1')
        if (scopeId === '2') return data.filter(item => (item.data as any).scope === 'Scope 2')
        if (scopeId === '3') return data.filter(item => (item.data as any).scope === 'Scope 3')
      }

      return []
    },

    /**
     * 取得所有專案資料
     */
    getAllProjectData: (): FactorTableItem[] => {
      return [...allProductCarbonFootprintItems, ...allOrganizationalInventoryItems]
    },

    // === 係數引用關係功能 ===

    /**
     * 取得所有係數的專案引用情況
     */
    getFactorUsageMap: (): FactorUsage[] => factorUsageMap,

    /**
     * 根據係數ID取得專案引用情況
     */
    getFactorProjectUsage: (factorId: number): ProjectUsage[] => getFactorUsageById(factorId),

    /**
     * 取得所有被專案使用的係數
     */
    getAllUsedFactors: (): FactorUsage[] => factorUsageMap.filter(f => f.usedInProjects.length > 0),

    /**
     * 格式化專案引用文字
     */
    formatFactorUsage: (usage: ProjectUsage[]): string => formatProjectUsage(usage),

    /**
     * 取得擴展的係數項目（包含引用資訊）
     */
    getExtendedFactorItems: (): ExtendedFactorTableItem[] => {
      const factorUsageMap = calculateFactorUsage()
      const usageMap = new Map(factorUsageMap.map(u => [u.factorId, u.usedInProjects]))

      return allEmissionFactorItems.map(item => ({
        ...item,
        projectUsage: usageMap.get(item.id) || [],
        usageText: formatProjectUsage(usageMap.get(item.id) || [])
      }))
    },

    /**
     * 取得中央係數庫的係數（以引用為出發點整合）
     * 只顯示被專案使用過的係數
     */
    getCentralLibraryFactors: (): ExtendedFactorTableItem[] => centralLibraryFactors
  }
}