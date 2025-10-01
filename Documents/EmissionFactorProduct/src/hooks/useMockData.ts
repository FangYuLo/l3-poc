import { useMemo } from 'react'
import {
  EmissionFactor,
  CompositeFactor,
  FactorTableItem,
  SourceType,
  DataQuality,
  FactorUsageInfo,
  ProjectReference
} from '@/types/types'
import { getAllEmissionFactors, mockCompositeFactors, mockProductFootprintFactors } from '@/data/mockDatabase'
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
  getEmissionFactorBySelection,
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
  
  // 生成使用資訊的輔助函數
  const generateUsageInfo = (factorId: number): FactorUsageInfo => {
    // 模擬使用資訊生成
    const usage = getFactorUsageById(factorId)
    const projectRefs: ProjectReference[] = usage.map(u => ({
      project_id: u.projectId,
      project_name: u.projectName,
      project_type: u.projectId.includes('org') ? 'L1' :
                   u.projectId.includes('product') ? 'L2' : 'L4',
      usage_count: u.usageCount,
      last_used_date: new Date().toISOString()
    }))

    return {
      total_usage_count: usage.reduce((total, u) => total + u.usageCount, 0),
      project_references: projectRefs,
      usage_summary: formatProjectUsage(usage)
    }
  }

  // 獲取數據品質等級的輔助函數
  const getDataQuality = (factor: EmissionFactor): DataQuality => {
    // 根據來源類型和係數特性決定品質等級
    if (factor.source_type === 'pact') return 'Primary'
    if (factor.source_type === 'standard' && factor.source?.includes('官方')) return 'Primary'
    if (factor.source_type === 'supplier') return 'Secondary'
    if (factor.quality_score && factor.quality_score >= 80) return 'Primary'
    if (factor.quality_score && factor.quality_score >= 60) return 'Secondary'
    return 'Secondary' // 預設為 Secondary
  }

  // 將 EmissionFactor 轉換為 FactorTableItem 格式
  const convertToTableItem = (factor: EmissionFactor): FactorTableItem => {
    const usageInfo = generateUsageInfo(factor.id)
    const dataQuality = factor.data_quality || getDataQuality(factor)

    return {
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
      data: factor,
      // 新增品質和使用資訊
      data_quality: dataQuality,
      validation_status: factor.validation_status || 'verified',
      quality_score: factor.quality_score,
      usage_info: usageInfo,
      usageText: usageInfo.usage_summary
    }
  }

  // 將 CompositeFactor 轉換為 FactorTableItem 格式
  const convertCompositeToTableItem = (factor: CompositeFactor): FactorTableItem => {
    const usageInfo = generateUsageInfo(factor.id)

    return {
      id: factor.id,
      type: 'composite_factor',
      name: factor.name,
      value: factor.computed_value,
      unit: factor.unit,
      region: 'User Defined',
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      data: factor,
      // 新增品質和使用資訊
      data_quality: factor.data_quality || 'Tertiary', // 自建係數預設為 Tertiary
      validation_status: factor.validation_status || 'pending',
      usage_info: usageInfo,
      usageText: usageInfo.usage_summary
    }
  }

  // 不使用 useMemo，每次都動態計算以確保能讀取新增的係數
  const allEmissionFactorItems = getAllEmissionFactors().map(convertToTableItem)

  const allCompositeFactorItems = useMemo(
    () => mockCompositeFactors.map(convertCompositeToTableItem),
    []
  )

  // 產品碳足跡係數項目
  const allProductFootprintItems = useMemo(
    () => mockProductFootprintFactors.map(convertToTableItem),
    []
  )

  // 將專案碳足跡資料轉換為 FactorTableItem 格式
  const convertProjectCarbonFootprintToTableItem = (item: typeof mockProductCarbonFootprintData[0]): FactorTableItem => {
    // 根據 factor_selection 查找對應的排放係數
    const factor = getEmissionFactorBySelection(item.factor_selection)

    // Debug logging for product carbon footprint
    if (item.id <= 10) {
      console.log(`[DEBUG-PCF] 項目${item.id}: "${item.factor_selection}" → `,
        factor ? `ID ${factor.id}, value=${factor.value}` : 'NOT FOUND')
    }

    return {
      id: item.id + 10000, // 避免ID衝突
      type: 'project_item',
      name: `${item.stage} - ${item.item_name}`,
      value: factor ? factor.value : 0, // 使用真實係數值，找不到則為0
      unit: factor ? factor.unit : item.quantity_spec, // 使用係數單位，找不到則用數量規格
      year: item.year,
      region: factor ? factor.country : '台灣',
      method_gwp: 'GWP100',
      source_type: 'project_data',
      source_ref: item.factor_selection,
      version: factor ? factor.version : '1.0',
      data: {
        ...item,
        type: 'product_carbon_footprint',
        product_name: item.product === 'smartphone' ? '智慧型手機' :
                     item.product === 'led_light' ? 'LED燈具' :
                     item.product === 'laptop' ? '筆記型電腦' : item.product,
        // 保存原始係數資訊以便詳情顯示
        emission_factor: factor
      }
    }
  }

  // 將組織盤查資料轉換為 FactorTableItem 格式
  const convertOrganizationalInventoryToTableItem = (item: typeof mockOrganizationalInventoryData[0]): FactorTableItem => {
    // 直接使用 factor_id 查找對應的排放係數
    const factor = getAllEmissionFactors().find(f => f.id === item.factor_id)

    // 調試輸出 - 前5個項目
    if (item.id <= 50) {
      console.log(`[DEBUG] 項目${item.id}: factor_id=${item.factor_id} → `,
        factor ? `name="${factor.name}", value=${factor.value}` : 'NOT FOUND')
    }

    return {
      id: item.id + 20000, // 避免ID衝突
      type: 'project_item',
      name: `${item.scope} - ${item.emission_source_name}`,
      value: factor ? factor.value : 0, // 顯示排放係數值，而不是活動數據
      unit: factor ? factor.unit : item.activity_data_unit, // 顯示係數單位
      year: item.year,
      region: factor ? factor.country : '台灣',
      method_gwp: 'GWP100',
      source_type: 'project_data',
      source_ref: item.factor_selection,
      version: factor ? factor.version : (item.version || '1.0'),
      data: {
        ...item,
        type: 'organizational_inventory',
        // 保存原始係數資訊以便詳情顯示
        emission_factor: factor
      }
    }
  }

  // 所有專案碳足跡項目（不使用 useMemo 以確保能讀取新增的係數）
  const allProductCarbonFootprintItems = mockProductCarbonFootprintData.map(convertProjectCarbonFootprintToTableItem)

  // 所有組織盤查項目（不使用 useMemo 以確保能讀取新增的係數）
  const allOrganizationalInventoryItems = mockOrganizationalInventoryData.map(convertOrganizationalInventoryToTableItem)

  // 所有係數項目（排放係數 + 組合係數 + 產品碳足跡係數 + 專案資料）
  const allFactorItems = [...allEmissionFactorItems, ...allCompositeFactorItems, ...allProductFootprintItems, ...allProductCarbonFootprintItems, ...allOrganizationalInventoryItems]

  // 快取係數使用情況計算
  const factorUsageMap = useMemo(() => calculateFactorUsage(), [])

  // 中央係數庫資料（不使用 useMemo 以確保能讀取新增的係數）
  const centralLibraryFactors = (): ExtendedFactorTableItem[] => {
    const usageMap = new Map(factorUsageMap.map(u => [u.factorId, u.usedInProjects]))

    // 選擇被專案使用的係數（標準排放係數）
    const usedFactorItems = allEmissionFactorItems
      .filter(item => usageMap.has(item.id)) // 只包含被使用的係數
      .map(item => ({
        ...item,
        projectUsage: usageMap.get(item.id) || [],
        usageText: formatProjectUsage(usageMap.get(item.id) || [])
      }))

    // 加入產品碳足跡係數（所有 source_type 為 project_data 的係數）
    const productFootprintItems = allProductFootprintItems
      .map(item => ({
        ...item,
        projectUsage: [], // 產品碳足跡係數沒有專案引用追蹤
        usageText: `來自專案: ${item.data?.source_project_name || '未知'}`
      }))

    // 加入從產品碳足跡匯入的係數（source_type 為 'project_data'）
    const importedProductFactors = allEmissionFactorItems
      .filter(item => item.source_type === 'project_data')
      .map(item => ({
        ...item,
        projectUsage: usageMap.get(item.id) || [],
        usageText: `從產品碳足跡匯入`
      }))

    // 合併三種係數（去重）
    const allCentralItemsMap = new Map<number, ExtendedFactorTableItem>()

    // 先加入使用過的係數
    usedFactorItems.forEach(item => allCentralItemsMap.set(item.id, item))

    // 再加入產品碳足跡係數（來自 mockProductFootprintFactors）
    productFootprintItems.forEach(item => allCentralItemsMap.set(item.id, item))

    // 最後加入匯入的產品碳足跡係數（新增的）
    importedProductFactors.forEach(item => allCentralItemsMap.set(item.id, item))

    const allCentralItems = Array.from(allCentralItemsMap.values())

    // 按使用次數降序排序，次數相同時按名稱排序
    return allCentralItems.sort((a, b) => {
      const aUsageCount = a.projectUsage?.length || 0
      const bUsageCount = b.projectUsage?.length || 0

      if (aUsageCount !== bUsageCount) {
        return bUsageCount - aUsageCount // 使用次數多的在前
      }

      // 使用次數相同時按名稱排序
      return a.name.localeCompare(b.name, 'zh-TW')
    })
  }

  return {
    // === 基礎資料存取 ===
    
    /**
     * 取得所有排放係數
     */
    getAllEmissionFactors: () => getAllEmissionFactors(),

    /**
     * 取得所有組合係數
     */
    getAllCompositeFactors: () => mockCompositeFactors,

    /**
     * 取得所有產品碳足跡係數
     */
    getAllProductFootprintFactors: () => mockProductFootprintFactors,
    
    /**
     * 取得所有係數項目（用於表格顯示）
     */
    getAllFactorItems: () => allFactorItems,

    /**
     * 根據ID取得單一排放係數
     */
    getEmissionFactorById: (id: number): EmissionFactor | undefined =>
      getAllEmissionFactors().find(factor => factor.id === id),

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
        getAllEmissionFactors().find(f => f.id === item.id)?.country === country
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
    getCollectionCounts: (): CollectionCounts => {
      const baseCounts = getCollectionCounts()
      // 中央係數庫 = 原有的 favorites 數量 + 產品碳足跡係數數量
      return {
        ...baseCounts,
        favorites: baseCounts.favorites + allProductFootprintItems.length,
        user_defined: allCompositeFactorItems.length
      }
    },

    /**
     * 取得總係數數量
     */
    getTotalFactorCount: (): number => allFactorItems.length,

    /**
     * 取得搜尋篩選選項
     */
    getSearchFacets: () => {
      const factors = getAllEmissionFactors()
      return {
        countries: Array.from(new Set(factors.map(f => f.country))).sort(),
        years: Array.from(new Set(factors.map(f => f.year).filter(Boolean))).sort((a, b) => b! - a!),
        units: Array.from(new Set(factors.map(f => f.unit))).sort(),
        sourceTypes: Array.from(new Set(factors.map(f => f.source_type))),
        continents: Array.from(new Set(factors.map(f => f.continent))).sort()
      }
    },

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
     * 取得L2產品碳足跡資料
     */
    getProjectAData: (productType?: 'smartphone' | 'led_light' | 'laptop'): FactorTableItem[] => {
      let data = allProductCarbonFootprintItems
      if (productType) {
        data = data.filter(item => (item.data as any).product === productType)
      }
      return data
    },

    /**
     * 取得L1組織盤查資料
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
      // L2產品節點
      if (nodeId === 'product_1_1') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'smartphone')
      }
      if (nodeId === 'product_1_2') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'led_light')
      }
      if (nodeId === 'product_1_3') {
        return allProductCarbonFootprintItems.filter(item => (item.data as any).product === 'laptop')
      }

      // L1年份節點
      if (nodeId === 'year_2_2024') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2024)
      }
      if (nodeId === 'year_2_2023') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2023)
      }
      if (nodeId === 'year_2_2022') {
        return allOrganizationalInventoryItems.filter(item => item.year === 2022)
      }

      // L2排放源節點 - 按階段篩選
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

      // L1排放源節點 - 按Scope篩選
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
    getCentralLibraryFactors: (): ExtendedFactorTableItem[] => centralLibraryFactors()
  }
}