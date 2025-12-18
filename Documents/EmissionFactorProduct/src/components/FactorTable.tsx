'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  CheckboxGroup,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Badge,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  SettingsIcon,
  EditIcon,
  DeleteIcon,
  HamburgerIcon,
  ArrowUpIcon,
  CheckIcon,
  WarningIcon,
  RepeatIcon,
} from '@chakra-ui/icons'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useMockData, checkIfNeedsSync } from '@/hooks/useMockData'
import { useFactors } from '@/hooks/useFactors'
import { useComposites } from '@/hooks/useComposites'
// 引入配置驅動系統
import { getTableConfig } from '@/config/tableColumns'
import { renderTableHeader, renderTableRow, renderEmptyState } from '@/utils/tableRenderer'
import { FactorTableItem } from '@/types/types'
import ProductCarbonFootprintCard from '@/components/ProductCarbonFootprintCard'
import ProjectOverviewView from '@/components/ProjectOverviewView'
import OrganizationalInventoryOverview from '@/components/OrganizationalInventoryOverview'
import ImportCompositeToCentralModal from '@/components/ImportCompositeToCentralModal'
import ImportedFactorInfoDialog from '@/components/ImportedFactorInfoDialog'
import BlockDeleteImportedDialog from '@/components/BlockDeleteImportedDialog'
import BatchImportConfirmDialog from '@/components/BatchImportConfirmDialog'
import UpdateFactorButton from '@/components/UpdateFactorButton'
import RelatedFactorUpdateNotification from '@/components/RelatedFactorUpdateNotification'
import RelatedFactorComparisonModal from '@/components/RelatedFactorComparisonModal'
import UpdateStatusIcon from '@/components/UpdateStatusIcon'
import IndividualFactorComparisonModal from '@/components/IndividualFactorComparisonModal'
import { mockProductCarbonFootprintSummaries, mockL2ProjectInfo, mockProjectProducts, mockL1ProjectInfo, mockInventoryYears } from '@/data/mockProjectData'
import { UpdateResult, RelatedFactorInfo, FactorUpdateInfo, ExtendedFactorTableItem } from '@/hooks/useMockData'

// 已從 types.ts 引入 FactorTableItem，移除重複定義

// 新增組織溫盤資料項目介面
interface OrganizationalInventoryItem {
  id: number
  scope: string // 範疇
  emission_source_category: string // 排放源類別
  emission_source_name: string // 排放源名稱
  activity_data: number // 活動數據
  activity_data_unit: string // 活動數據單位
  factor_selection: string // 係數選擇
  version: string // 版本
  error_level: string // 排放計算參數誤差等級
}

// 新增產品碳足跡資料項目介面
interface ProductCarbonFootprintItem {
  id: number
  stage: '原物料' | '製造' | '配送' | '使用' | '廢棄' // 階段
  item_name: string // 項目名稱
  quantity_spec: string // 數量/規格
  additional_info: string // 補充資訊
  factor_selection: string // 係數選擇(含版本)
  error_level: string // 誤差等級
}

interface TreeNodeProps {
  id: string
  name: string
  type: 'collection' | 'project' | 'emission_source' | 'product' | 'yearly_inventory'
  count?: number
  children?: TreeNodeProps[]
}

interface FactorTableProps {
  onFactorSelect?: (factor: FactorTableItem) => void
  selectedNodeType?: 'general' | 'organizational_inventory' | 'product_carbon_footprint' | 'user_defined' | 'favorites' | 'pact' | 'supplier' | 'dataset' | 'project_overview' | 'inventory_overview' | 'global_search' // 新增全庫搜尋類型
  selectedNode?: TreeNodeProps | null // 新增：選中的節點資訊
  userDefinedFactors?: any[] // 自建係數數據
  onOpenComposite?: () => void // 新增開啟組合係數編輯器的回調
  onEditComposite?: (factor: any) => void // 編輯組合係數的回調
  onEditCustomFactor?: (factor: any) => void // 編輯自訂係數的回調
  onOpenCustomFactor?: () => void // 新增：開啟自訂係數 Modal
  datasetFactors?: FactorTableItem[] // 資料集包含的係數數據
  onOpenGlobalSearch?: () => void // 新增開啟全庫搜尋的回調
  onNavigateToProduct?: (productId: string) => void // 新增導航到產品的回調
  onSyncL2Project?: () => Promise<void> // 新增同步 L2 專案的回調
  onNavigateToYear?: (yearId: string) => void // 新增導航到年度盤查的回調
  onSyncL1Project?: () => Promise<void> // 新增同步 L1 專案的回調
  productSummaries?: any[] // 產品碳足跡摘要列表
  onImportProduct?: (productId: string, formData: any) => Promise<void> // 匯入產品到中央庫
  onRefreshSelectedFactor?: () => void // 刷新當前選中係數的資料
  dataRefreshKey?: number // 用於強制刷新數據的 key
  onDeleteFactor?: (factor: any) => void // 刪除自建係數的回調
  onNavigateToCentral?: (factor: any) => void // 導航到中央庫並選中係數的回調
  onBlockEdit?: (factor: any) => void // 阻止編輯已匯入係數的回調
  
  // Resource_8 係數更新相關
  onUpdateDetected?: (result: UpdateResult) => void // 處理更新檢測結果的回調
  updateResult?: UpdateResult | null // 更新結果狀態
  showUpdateNotification?: boolean // 是否顯示更新通知
  onDismissNotification?: () => void // 關閉更新通知的回調
}

export default function FactorTable({
  onFactorSelect,
  selectedNodeType = 'general',
  selectedNode = null,
  userDefinedFactors = [],
  onOpenComposite,
  onEditComposite,
  onEditCustomFactor,
  onOpenCustomFactor,
  datasetFactors = [],
  onOpenGlobalSearch,
  onRefreshSelectedFactor,
  onNavigateToProduct,
  onSyncL2Project,
  onNavigateToYear,
  onSyncL1Project,
  productSummaries: _productSummaries,
  onImportProduct,
  dataRefreshKey = 0,
  onDeleteFactor,
  onNavigateToCentral,
  onBlockEdit,
  
  // Resource_8 係數更新相關
  onUpdateDetected,
  updateResult,
  showUpdateNotification,
  onDismissNotification
}: FactorTableProps) {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedFactor, setSelectedFactor] = useState<FactorTableItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // 用於強制重新渲染

  // 全庫搜尋專用的篩選狀態
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([])

  // 自建組合係數操作相關狀態
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedComposite, setSelectedComposite] = useState<any | null>(null)
  const [importedInfoDialogOpen, setImportedInfoDialogOpen] = useState(false)
  const [selectedImportedFactor, setSelectedImportedFactor] = useState<any | null>(null)
  const [blockDeleteDialogOpen, setBlockDeleteDialogOpen] = useState(false)
  const [blockedFactor, setBlockedFactor] = useState<any | null>(null)
  const { importCompositeToCentral, isLoading: compositeLoading } = useComposites()

  // 處理查看係數對比
  const handleViewComparison = (relatedFactors: RelatedFactorInfo[]) => {
    setIsComparisonModalOpen(true)
  }

  // 批次匯入狀態（針對希達係數）
  const [batchSelectedIds, setBatchSelectedIds] = useState<number[]>([])
  const [isBatchImportDialogOpen, setIsBatchImportDialogOpen] = useState(false)
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  // Resource_8 係數更新相關狀態（模態框控制）
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)

  // 個別係數更新檢測相關狀態
  const [factorUpdates, setFactorUpdates] = useState<Map<number, FactorUpdateInfo>>(new Map())
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [individualComparisonFactor, setIndividualComparisonFactor] = useState<ExtendedFactorTableItem | null>(null)
  const [isIndividualComparisonOpen, setIsIndividualComparisonOpen] = useState(false)

  // 獲取表格配置（希達係數庫使用 global_search 配置）
  const tableConfig = getTableConfig(
    selectedNode?.id === 'global_search' ? 'global_search' : selectedNodeType
  )

  // 獲取產品碳足跡摘要（僅在產品碳足跡節點時）
  const productSummary = useMemo(() => {
    if (selectedNodeType !== 'product_carbon_footprint' || !selectedNode) {
      return null
    }

    // 根據選中節點判斷產品類型
    let productId: string | null = null

    // 使用節點 ID 或名稱匹配產品
    if (selectedNode.id === 'product_1_1' || selectedNode.name.includes('智慧型手機')) {
      productId = 'smartphone'
    } else if (selectedNode.id === 'product_1_2' || selectedNode.name.includes('LED燈具')) {
      productId = 'led_light'
    } else if (selectedNode.id === 'product_1_3' || selectedNode.name.includes('筆記型電腦')) {
      productId = 'laptop'
    }

    if (!productId) return null

    return mockProductCarbonFootprintSummaries.find(s => s.productId === productId)
  }, [selectedNodeType, selectedNode])

  // 使用統一資料管理
  const dataService = useMockData()

  // 使用 useFactors hook 處理專案資料
  const { factors: projectFactors } = useFactors({
    nodeId: selectedNode?.id,
    collectionId: selectedNodeType === 'favorites' ? 'favorites' :
                  selectedNodeType === 'user_defined' ? 'user_defined' :
                  selectedNodeType === 'pact' ? 'pact' :
                  selectedNodeType === 'supplier' ? 'supplier' : undefined,
    refreshKey: dataRefreshKey // 添加外部傳入的 refreshKey 以強制重新載入數據
  })

  // 全庫搜尋的動態篩選選項
  const globalSearchFacets = useMemo(() => {
    if (selectedNodeType !== 'global_search') return null

    const allFactors = dataService.getAllFactorItems()
    const regionSet = new Set<string>()
    const yearSet = new Set<number>()
    const unitSet = new Set<string>()
    const methodSet = new Set<string>()

    allFactors.forEach(factor => {
      if (factor.region) regionSet.add(factor.region)
      if (factor.year) yearSet.add(factor.year)
      unitSet.add(factor.unit)
      if (factor.method_gwp) methodSet.add(factor.method_gwp)
    })

    return {
      regions: Array.from(regionSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
      units: Array.from(unitSet).sort(),
      methods: Array.from(methodSet).sort(),
      sourceTypes: [
        { value: 'standard', label: '標準資料庫' },
        { value: 'pact', label: 'PACT交換' },
        { value: 'supplier', label: '供應商係數' },
        { value: 'user_defined', label: '自建係數' },
        { value: 'project_data', label: '產品碳足跡' },
      ],
    }
  }, [selectedNodeType, dataService])
  

  // 根據選擇的節點類型取得對應的係數資料
  const getFactorDataByType = useCallback(() => {
    switch (selectedNodeType) {
      case 'favorites':
        return dataService.getCentralLibraryFactors() // 使用中央係數庫功能
      case 'pact':
        return dataService.getPactFactors()
      case 'supplier':
        return dataService.getSupplierFactors()
      case 'user_defined':
        return [] // 自建係數由 filteredData 直接處理，避免重複
      case 'dataset':
        // 希達係數庫需要獲取所有標準係數，普通資料集由 filteredData 處理
        if (selectedNode?.id === 'global_search') {
          return dataService.getAllFactorItems()
        }
        return [] // 普通資料集係數由 filteredData 直接處理，避免重複
      case 'global_search':
        return dataService.getAllFactorItems() // 全庫搜尋：取得所有係數
      default:
        return dataService.getAllFactorItems()
    }
  }, [selectedNodeType, selectedNode, dataService, dataRefreshKey])  // 添加 selectedNode 到依賴

  // 使用統一資料管理 - 不再使用硬編碼假資料

  // 組織溫盤 Mock 資料
  const mockOrganizationalData: OrganizationalInventoryItem[] = [
    {
      id: 1,
      scope: 'Scope 1',
      emission_source_category: '固定燃燒源',
      emission_source_name: '天然氣鍋爐',
      activity_data: 12500,
      activity_data_unit: 'Nm³',
      factor_selection: '臺灣-天然氣-工業用-2024',
      version: 'v2024.1',
      error_level: '自廠發展係數/質量平衡所得係數'
    },
    {
      id: 2,
      scope: 'Scope 1',
      emission_source_category: '移動燃燒源',
      emission_source_name: '公務車輛-汽油',
      activity_data: 8500,
      activity_data_unit: '公升',
      factor_selection: '臺灣-汽油-車用-2024',
      version: 'v2024.1',
      error_level: '同製程/設備經驗係數'
    },
    {
      id: 3,
      scope: 'Scope 2',
      emission_source_category: '外購電力',
      emission_source_name: '台電購電',
      activity_data: 245000,
      activity_data_unit: 'kWh',
      factor_selection: '臺灣電力-2024',
      version: 'v2024.2',
      error_level: '國家排放係數'
    },
    {
      id: 4,
      scope: 'Scope 3',
      emission_source_category: '上游運輸',
      emission_source_name: '原料運輸',
      activity_data: 15600,
      activity_data_unit: 'tkm',
      factor_selection: '貨運-陸運-柴油卡車-2024',
      version: 'v2024.1',
      error_level: '區域排放係數'
    },
    {
      id: 5,
      scope: 'Scope 3',
      emission_source_category: '員工通勤',
      emission_source_name: '員工交通補貼',
      activity_data: 2800,
      activity_data_unit: '人·km',
      factor_selection: '大眾運輸-捷運-2024',
      version: 'v2024.1',
      error_level: '製造廠提供係數'
    },
    {
      id: 6,
      scope: 'Scope 1',
      emission_source_category: '製程排放',
      emission_source_name: '化學反應製程',
      activity_data: 450,
      activity_data_unit: '噸',
      factor_selection: '化工製程-有機溶劑-2024',
      version: 'v2024.1',
      error_level: '國際排放係數'
    }
  ]

  // 產品碳足跡 Mock 資料 - 擴展三個產品
  const mockProductCarbonFootprintData: ProductCarbonFootprintItem[] = [
    // 原物料階段
    {
      id: 1,
      stage: '原物料',
      item_name: '鋁合金板材',
      quantity_spec: '15.2 公斤',
      additional_info: '海運-貨櫃',
      factor_selection: '鋁合金-初級生產-2024 v2.1',
      error_level: '自廠發展係數/質量平衡所得係數'
    },
    {
      id: 2,
      stage: '原物料',
      item_name: '塑膠粒料-ABS',
      quantity_spec: '2.8 公斤',
      additional_info: '陸運-卡車',
      factor_selection: 'ABS塑膠-石化原料-2024 v1.3',
      error_level: '同製程/設備經驗係數'
    },
    {
      id: 3,
      stage: '原物料',
      item_name: '電子元件',
      quantity_spec: '0.5 公斤',
      additional_info: '空運',
      factor_selection: '電子元件-混合-2024 v1.0',
      error_level: '國際排放係數'
    },
    // 製造階段
    {
      id: 4,
      stage: '製造',
      item_name: '射出成型製程',
      quantity_spec: '450 kWh',
      additional_info: '塑膠成型',
      factor_selection: '臺灣電力-工業用-2024 v2.2',
      error_level: '國家排放係數'
    },
    {
      id: 5,
      stage: '製造',
      item_name: '金屬加工',
      quantity_spec: '1200 Nm³',
      additional_info: '固定燃燒源',
      factor_selection: '臺灣-天然氣-工業用-2024 v2.1',
      error_level: '國家排放係數'
    },
    {
      id: 6,
      stage: '製造',
      item_name: '表面處理',
      quantity_spec: '25 公升',
      additional_info: '化學製程',
      factor_selection: '工業溶劑-有機化合物-2024 v1.5',
      error_level: '製造廠提供係數'
    },
    // 配送階段
    {
      id: 7,
      stage: '配送',
      item_name: '工廠→配送中心',
      quantity_spec: '280 km',
      additional_info: '柴油卡車+500kg',
      factor_selection: '貨運-陸運-柴油卡車-2024 v1.8',
      error_level: '國家排放係數'
    },
    {
      id: 8,
      stage: '配送',
      item_name: '配送中心→零售店',
      quantity_spec: '45 km',
      additional_info: '電動貨車+200kg',
      factor_selection: '電動車-商用貨車-2024 v1.2',
      error_level: '區域排放係數'
    },
    // 使用階段
    {
      id: 9,
      stage: '使用',
      item_name: '正常使用情境',
      quantity_spec: '180 kWh/年',
      additional_info: '5年+臺灣',
      factor_selection: '臺灣電力-家庭用-2024 v2.2',
      error_level: '國家排放係數'
    },
    {
      id: 10,
      stage: '使用',
      item_name: '維護保養',
      quantity_spec: '2 次/年',
      additional_info: '3年+服務運輸',
      factor_selection: '服務業-運輸-2024 v1.0',
      error_level: '區域排放係數'
    },
    // 廢棄階段
    {
      id: 11,
      stage: '廢棄',
      item_name: '金屬部件回收',
      quantity_spec: '15.2 公斤',
      additional_info: '回收95%+臺灣',
      factor_selection: '金屬回收-機械處理-2024 v1.4',
      error_level: '國家排放係數'
    },
    {
      id: 12,
      stage: '廢棄',
      item_name: '塑膠焚化處理',
      quantity_spec: '2.8 公斤',
      additional_info: '焚化5%+臺灣',
      factor_selection: '廢塑膠-焚化-2024 v1.7',
      error_level: '國家排放係數'
    }
  ]

  const filteredData = useMemo(() => {
    // 優先檢查是否有專案資料
    if (selectedNode && projectFactors.length > 0) {
      // 將 FactorTableItem 轉換為對應的專案資料格式進行顯示
      if (selectedNodeType === 'organizational_inventory' || selectedNode.id.startsWith('year_') || selectedNode.id.startsWith('source_2_')) {
        // 組織盤查資料：轉換 FactorTableItem 回 mockOrganizationalInventoryData 格式，並保留 emission_factor
        const orgData = projectFactors.map((factor: any) => {
          const data = factor.data
          return {
            id: data.id,
            scope: data.scope,
            emission_source_category: data.emission_source_category,
            emission_source_name: data.emission_source_name,
            activity_data: data.activity_data,
            activity_data_unit: data.activity_data_unit,
            factor_selection: data.factor_selection,
            version: data.version,
            error_level: data.error_level,
            year: data.year,
            // 保留 emission_factor 以便表格顯示實際係數值
            emission_factor: data.emission_factor,
            data: data  // 保留完整的 data 物件
          }
        })
        
        if (!searchTerm) return orgData
        return orgData.filter(item =>
          item.emission_source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.emission_source_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.scope.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else if (selectedNodeType === 'product_carbon_footprint' || selectedNode.id.startsWith('product_') || selectedNode.id.startsWith('source_1_')) {
        // 產品碳足跡資料：保留完整的 data 結構以便訪問 emission_factor
        const productData = projectFactors.map((factor: any) => {
          return {
            id: factor.data.id,
            stage: factor.data.stage,
            item_name: factor.data.item_name,
            quantity_spec: factor.data.quantity_spec,
            additional_info: factor.data.additional_info,
            factor_selection: factor.data.factor_selection,
            error_level: factor.data.error_level,
            product: factor.data.product,
            year: factor.data.year,
            data: factor.data  // 保留完整的 data 物件，包含 emission_factor
          }
        })
        
        if (!searchTerm) return productData
        return productData.filter(item =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.factor_selection.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    }

    // 原始邏輯處理其他情況
    if (selectedNodeType === 'organizational_inventory') {
      if (!searchTerm) return mockOrganizationalData
      return mockOrganizationalData.filter(item =>
        item.emission_source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.emission_source_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.scope.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else if (selectedNodeType === 'product_carbon_footprint') {
      if (!searchTerm) return mockProductCarbonFootprintData
      return mockProductCarbonFootprintData.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.factor_selection.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else {
      // 使用統一資料管理取得係數資料
      const factorData = getFactorDataByType()
      
      // 根據節點類型選擇資料，避免重複整合
      let baseData: FactorTableItem[]
      
      if (selectedNodeType === 'user_defined') {
        // 自建係數節點：直接使用 userDefinedFactors，避免重複
        baseData = userDefinedFactors.map(factor => ({
          id: factor.id,
          type: factor.type || 'composite_factor',
          name: factor.name,
          value: factor.value,
          unit: factor.unit,
          year: factor.year,
          region: factor.region,
          method_gwp: factor.method_gwp,
          source_type: factor.source_type,
          source_ref: factor.source_ref,
          version: factor.version,
          data: factor,
          // 重要：複製日期欄位（組合係數用 enabledDate，自訂係數用 effective_date）
          enabledDate: (factor as any).enabledDate,
          effective_date: (factor as any).effective_date,
          // 重要：複製同步相關欄位到頂層，以便刪除檢查和狀態顯示
          imported_to_central: factor.imported_to_central,
          central_library_id: factor.central_library_id,
          imported_at: factor.imported_at,
          last_synced_at: factor.last_synced_at,
          last_synced_version: factor.last_synced_version,
        }))
      } else if (selectedNodeType === 'dataset') {
        // 資料集節點：區分希達係數庫和普通資料集
        if (selectedNode?.id === 'global_search') {
          // 希達係數庫：顯示所有標準係數
          baseData = factorData.map(factor => ({
            id: factor.id,
            type: factor.type as 'emission_factor' | 'composite_factor',
            name: factor.name,
            value: factor.value,
            unit: factor.unit,
            year: factor.year,
            region: factor.region,
            method_gwp: factor.method_gwp,
            source_type: factor.source_type,
            source_ref: factor.source_ref,
            version: factor.version,
            data: factor,
          }))
        } else {
          // 普通資料集：直接使用資料集係數
          baseData = datasetFactors
        }
      } else if (selectedNodeType === 'favorites') {
        // 中央係數庫：直接使用擴展的係數資料，保留 projectUsage 和 usageText
        baseData = factorData as any[] // factorData 已經是 ExtendedFactorTableItem[]
        console.log('[FactorTable] 中央係數庫 baseData 數量:', baseData.length, 'dataRefreshKey:', dataRefreshKey)
      } else if (selectedNodeType === 'global_search') {
        // 全庫搜尋：取得所有係數並應用篩選
        baseData = factorData.map(factor => ({
          id: factor.id,
          type: factor.type as 'emission_factor' | 'composite_factor',
          name: factor.name,
          value: factor.value,
          unit: factor.unit,
          year: factor.year,
          region: factor.region,
          method_gwp: factor.method_gwp,
          source_type: factor.source_type,
          source_ref: factor.source_ref,
          version: factor.version,
          data: factor,
          // 保留引用資訊和資料品質欄位
          usageText: factor.usageText,
          usage_info: factor.usage_info,
          data_quality: factor.data_quality,
          quality_score: factor.quality_score,
          validation_status: factor.validation_status,
          // 保留完整的排放係數分項資料（用於詳情頁面）
          co2_factor: factor.data?.co2_factor || factor.co2_factor,
          ch4_factor: factor.data?.ch4_factor || factor.ch4_factor,
          n2o_factor: factor.data?.n2o_factor || factor.n2o_factor,
          co2_unit: factor.data?.co2_unit || factor.co2_unit,
          ch4_unit: factor.data?.ch4_unit || factor.ch4_unit,
          n2o_unit: factor.data?.n2o_unit || factor.n2o_unit,
          // 保留完整的來源資訊（用於詳情頁面）
          source: factor.data?.source || factor.source,
          effective_date: factor.data?.effective_date || factor.effective_date,
          continent: factor.data?.continent || factor.continent,
          country: factor.data?.country || factor.country,
        }))

        // 應用進階篩選
        if (selectedRegions.length > 0) {
          baseData = baseData.filter(item => item.region && selectedRegions.includes(item.region))
        }
        if (selectedYears.length > 0) {
          baseData = baseData.filter(item => item.year && selectedYears.includes(item.year.toString()))
        }
        if (selectedUnits.length > 0) {
          baseData = baseData.filter(item => selectedUnits.includes(item.unit))
        }
        if (selectedMethods.length > 0) {
          baseData = baseData.filter(item => item.method_gwp && selectedMethods.includes(item.method_gwp))
        }
        if (selectedSourceTypes.length > 0) {
          baseData = baseData.filter(item => item.source_type && selectedSourceTypes.includes(item.source_type))
        }
      } else {
        // 其他節點：只使用統一資料管理的資料，不混合自建係數
        baseData = factorData.map(factor => ({
          id: factor.id,
          type: factor.type as 'emission_factor' | 'composite_factor',
          name: factor.name,
          value: factor.value,
          unit: factor.unit,
          year: factor.year,
          region: factor.region,
          method_gwp: factor.method_gwp,
          source_type: factor.source_type,
          source_ref: factor.source_ref,
          version: factor.version,
          data: factor,
        }))
        
        // 只有在 'general' 節點類型時才加入自建係數
        if (selectedNodeType === 'general') {
          const userDefinedItems = userDefinedFactors.map(factor => ({
            id: factor.id,
            type: factor.type || 'composite_factor' as 'emission_factor' | 'composite_factor',
            name: factor.name,
            value: factor.value,
            unit: factor.unit,
            year: factor.year,
            region: factor.region,
            method_gwp: factor.method_gwp,
            source_type: factor.source_type,
            source_ref: factor.source_ref,
            version: factor.version,
            data: factor,
            // 重要：複製同步相關欄位到頂層，以便刪除檢查和狀態顯示
            imported_to_central: factor.imported_to_central,
            central_library_id: factor.central_library_id,
            imported_at: factor.imported_at,
            last_synced_at: factor.last_synced_at,
            last_synced_version: factor.last_synced_version,
          }))
          
          baseData = [...baseData, ...userDefinedItems]
        }
      }
      
      // 如果沒有搜索詞，直接返回過濾後的數據
      if (!searchTerm) return baseData
      
      // 如果有搜索詞，在過濾後的數據中搜索
      return baseData.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        const basicMatch = item.name.toLowerCase().includes(searchLower) ||
                          item.unit.toLowerCase().includes(searchLower) ||
                          item.region?.toLowerCase().includes(searchLower)
        
        // 對於中央係數庫，也搜索引用資訊
        const usageMatch = selectedNodeType === 'favorites' && 
                          (item as any).usageText?.toLowerCase().includes(searchLower)
        
        return basicMatch || usageMatch
      })
    }
  }, [searchTerm, selectedNodeType, selectedNode, projectFactors, userDefinedFactors, datasetFactors, getFactorDataByType, selectedRegions, selectedYears, selectedUnits, selectedMethods, selectedSourceTypes, refreshKey, dataRefreshKey])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  // 檢測中央係數庫係數的更新狀態
  useEffect(() => {
    if (selectedNodeType === 'favorites' && !isCheckingUpdates) {
      const checkFactorUpdates = async () => {
        setIsCheckingUpdates(true)
        try {
          // 延遲檢查，避免影響初始載入
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // 獲取中央係數庫中所有係數的 ID
          const centralFactorIds = filteredData.map(factor => factor.id)
          
          if (centralFactorIds.length > 0) {
            console.log('[FactorTable] 開始檢測', centralFactorIds.length, '個中央係數庫係數的更新狀態')
            const updateResults = dataService.checkAllFactorsForUpdates(centralFactorIds)
            setFactorUpdates(updateResults)
            
            if (updateResults.size > 0) {
              console.log('[FactorTable] 發現', updateResults.size, '個係數有可用更新')
            }
          }
        } catch (error) {
          console.error('[FactorTable] 檢測係數更新失敗:', error)
        } finally {
          setIsCheckingUpdates(false)
        }
      }

      checkFactorUpdates()
    }
  }, [selectedNodeType, filteredData, isCheckingUpdates, dataService])

  // 處理個別係數更新對比
  const handleIndividualFactorUpdate = (factor: ExtendedFactorTableItem) => {
    setIndividualComparisonFactor(factor)
    setIsIndividualComparisonOpen(true)
  }

  // 處理個別係數更新成功
  const handleIndividualUpdateSuccess = () => {
    // 刷新中央係數庫
    onRefreshSelectedFactor?.()
    // 重新檢測更新狀態
    setIsCheckingUpdates(false)
    // 移除已更新係數的更新狀態
    if (individualComparisonFactor) {
      setFactorUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(individualComparisonFactor.id)
        return newMap
      })
    }
  }


  const handleRowClick = (factor: FactorTableItem) => {
    setSelectedFactor(factor)
    onFactorSelect?.(factor)
  }

  // 渲染同步狀態 Badge
  const renderSyncStatus = (factor: any) => {
    if (!factor.imported_to_central) {
      // 未匯入，顯示灰色 Badge
      return (
        <Badge colorScheme="gray" size="sm">
          未匯入
        </Badge>
      )
    }

    const needsSync = checkIfNeedsSync(factor)

    if (needsSync) {
      // 需要同步
      return (
        <Tooltip label="此係數已修改，需要同步到中央庫">
          <Badge colorScheme="orange" size="sm" display="flex" alignItems="center" gap={1}>
            <Icon as={WarningIcon} boxSize={3} />
            需同步
          </Badge>
        </Tooltip>
      )
    }

    // 已同步
    return (
      <Tooltip label={`已於 ${new Date(factor.imported_at).toLocaleString('zh-TW')} 匯入`}>
        <Badge colorScheme="green" size="sm" display="flex" alignItems="center" gap={1}>
          <Icon as={CheckIcon} boxSize={3} />
          已匯入
        </Badge>
      </Tooltip>
    )
  }

  // 組合係數操作處理函數
  const handleDeleteClick = (composite: any) => {
    // 檢查是否已匯入中央庫
    if (composite.imported_to_central) {
      // 已匯入：顯示阻止刪除對話框
      setBlockedFactor(composite)
      setBlockDeleteDialogOpen(true)
    } else {
      // 未匯入：呼叫父組件的刪除回調
      onDeleteFactor?.(composite)
    }
  }

  const handleImportedInfoClick = (factor: any) => {
    setSelectedImportedFactor(factor)
    setImportedInfoDialogOpen(true)
  }

  const handleNavigateToCentral = (factor: any) => {
    // 呼叫父組件的導航回調
    onNavigateToCentral?.(factor)
  }

  const handleSyncClick = (composite: any) => {
    // TODO: 打開同步確認對話框
    setSelectedComposite(composite)
    handleImportClick(composite) // 暫時使用匯入流程，後續會改為專門的同步流程
  }

  const handleImportClick = (composite: any) => {
    setSelectedComposite(composite)
    setImportModalOpen(true)
  }

  const handleImportConfirm = async (formData: any) => {
    if (!selectedComposite) return

    const result = await importCompositeToCentral(selectedComposite.id, formData, selectedComposite)
    if (result.success) {
      // Modal 內部已經處理了成功提示和關閉
      setImportModalOpen(false)
      setSelectedComposite(null)

      // 觸發重新渲染以顯示新匯入的係數
      setRefreshKey(prev => prev + 1)

      // 刷新當前選中係數的資料（如果父組件提供了此回調）
      onRefreshSelectedFactor?.()
    }
    // 錯誤處理在 Modal 內部完成
  }

  const handleEditClick = (_composite: any) => {
    // TODO: 整合編輯功能
    toast({
      title: '編輯功能',
      description: '編輯功能即將推出',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  // Mock 使用情況檢查
  const checkCompositeUsage = (_compositeId: number) => {
    return {
      usedInProjects: 0,
      usedInComposites: [],
      usedInDatasets: 0,
    }
  }

  // ===== 批次匯入處理函數 =====

  /**
   * 處理單個係數的批次選擇
   */
  const handleBatchSelect = useCallback((factorId: number) => {
    setBatchSelectedIds(prev => {
      if (prev.includes(factorId)) {
        return prev.filter(id => id !== factorId)
      } else {
        return [...prev, factorId]
      }
    })
  }, [])

  /**
   * 處理全選
   */
  const handleBatchSelectAll = useCallback(() => {
    if (batchSelectedIds.length === 0) {
      // 全選：只選擇未在中央庫的係數
      const selectableIds = paginatedData
        .filter(factor => !dataService.isStandardFactorInCentral(factor.id))
        .map(factor => factor.id)
      setBatchSelectedIds(selectableIds)
    } else {
      // 取消全選
      setBatchSelectedIds([])
    }
  }, [batchSelectedIds, paginatedData, dataService])

  /**
   * 取消所有選擇
   */
  const handleCancelBatchSelection = useCallback(() => {
    setBatchSelectedIds([])
  }, [])

  /**
   * 開啟批次匯入確認對話框
   */
  const handleOpenBatchImportDialog = useCallback(() => {
    setIsBatchImportDialogOpen(true)
  }, [])

  /**
   * 執行批次匯入
   */
  const handleBatchImport = useCallback(async () => {
    setIsBatchProcessing(true)

    try {
      const result = dataService.batchAddStandardFactorsToCentral(batchSelectedIds)

      if (result.success) {
        toast({
          title: '批次加入成功',
          description: `已成功將 ${result.successCount} 個係數加入中央庫`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: '批次加入完成',
          description: `成功 ${result.successCount} 個，失敗 ${result.failedCount} 個`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }

      // 清空選擇
      setBatchSelectedIds([])
      setIsBatchImportDialogOpen(false)

      // 刷新列表
      setRefreshKey(prev => prev + 1)

    } catch (error) {
      toast({
        title: '批次加入失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsBatchProcessing(false)
    }
  }, [batchSelectedIds, dataService, toast])

  // 計算選中的係數列表（用於對話框顯示）
  const selectedFactorsForBatch = useMemo(() => {
    return paginatedData.filter(factor => batchSelectedIds.includes(factor.id)) as FactorTableItem[]
  }, [batchSelectedIds, paginatedData])

  // 判斷是否全選（排除已在中央庫的係數）
  const isAllBatchSelected = useMemo(() => {
    const selectableFactors = paginatedData.filter(
      factor => !dataService.isStandardFactorInCentral(factor.id)
    )
    return selectableFactors.length > 0 &&
      selectableFactors.every(factor => batchSelectedIds.includes(factor.id))
  }, [batchSelectedIds, paginatedData, dataService])

  // 判斷是否部分選中
  const isIndeterminate = useMemo(() => {
    return batchSelectedIds.length > 0 && !isAllBatchSelected
  }, [batchSelectedIds, isAllBatchSelected])


  // 如果是 L2 專案概覽視圖，渲染專案概覽元件
  if (selectedNodeType === 'project_overview') {
    return (
      <ProjectOverviewView
        projectInfo={mockL2ProjectInfo}
        products={mockProjectProducts}
        onNavigateToProduct={onNavigateToProduct}
        onSyncL2Project={onSyncL2Project}
      />
    )
  }

  // 如果是 L1 盤查概覽視圖，渲染盤查概覽元件
  if (selectedNodeType === 'inventory_overview') {
    return (
      <OrganizationalInventoryOverview
        projectInfo={mockL1ProjectInfo}
        inventoryYears={mockInventoryYears}
        onNavigateToYear={onNavigateToYear}
        onSyncL1Project={onSyncL1Project}
      />
    )
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Toolbar */}
      <Flex p={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={4}>
        <Text fontWeight="medium" color="gray.700">
          {tableConfig.displayName}
        </Text>

        <InputGroup maxW="300px">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={tableConfig.searchPlaceholder}
            size="sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Spacer />

        {/* 全庫搜尋頁面顯示篩選按鈕 */}
        {selectedNodeType === 'global_search' && (
          <Button
            leftIcon={<SettingsIcon />}
            size="sm"
            variant={showFilters ? "solid" : "outline"}
            colorScheme={showFilters ? "blue" : "gray"}
            onClick={() => setShowFilters(!showFilters)}
          >
            篩選
          </Button>
        )}

        {/* 自建係數頁面顯示按鈕群組 */}
        {selectedNodeType === 'user_defined' && (
          <HStack spacing={2}>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={onOpenCustomFactor}
            >
              自訂係數
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="outline"
              size="sm"
              onClick={onOpenComposite}
            >
              自建組合係數
            </Button>
          </HStack>
        )}

        {/* 資料集頁面顯示按鈕群組 */}
        {selectedNodeType === 'dataset' && (
          <HStack spacing={2}>
            {/* 希達係數庫才顯示更新按鈕 */}
            {selectedNode?.id === 'global_search' && onUpdateDetected && (
              <UpdateFactorButton
                onUpdateDetected={onUpdateDetected}
              />
            )}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={onOpenGlobalSearch}
            >
              新增係數
            </Button>
          </HStack>
        )}

        <Text fontSize="sm" color="gray.500">
          共 {filteredData.length} 筆
        </Text>
      </Flex>

      {/* Product Carbon Footprint Summary Card */}
      {productSummary && (
        <Box px={4} pt={4}>
          <ProductCarbonFootprintCard
            summary={productSummary}
            onViewDetails={() => {
              console.log('查看詳細計算:', productSummary.productName)
              // TODO: 實作查看詳細計算功能
            }}
            onImportToCentral={async (formData) => {
              if (onImportProduct && productSummary.productId) {
                await onImportProduct(productSummary.productId, formData)
              }
            }}
          />
        </Box>
      )}

      {/* Global Search Filters Panel */}
      {selectedNodeType === 'global_search' && showFilters && globalSearchFacets && (
        <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
          <HStack spacing={4} align="start">
            <VStack align="start" spacing={2} flex="1">
              <Flex justify="space-between" w="100%">
                <Text fontSize="sm" fontWeight="medium">篩選條件</Text>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setSelectedRegions([])
                    setSelectedYears([])
                    setSelectedUnits([])
                    setSelectedMethods([])
                    setSelectedSourceTypes([])
                    setCurrentPage(1)
                  }}
                >
                  清除全部
                </Button>
              </Flex>

              <Accordion allowMultiple defaultIndex={[0, 1, 2]} w="100%">
                {/* Regions */}
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">地區</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} maxH="200px" overflow="auto">
                    <CheckboxGroup
                      value={selectedRegions}
                      onChange={(value) => {
                        setSelectedRegions(value as string[])
                        setCurrentPage(1)
                      }}
                    >
                      <VStack align="start" spacing={1}>
                        {globalSearchFacets.regions.map((region) => (
                          <Checkbox key={region} value={region} size="sm">
                            {region}
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </AccordionPanel>
                </AccordionItem>

                {/* Years */}
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">年份</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} maxH="200px" overflow="auto">
                    <CheckboxGroup
                      value={selectedYears}
                      onChange={(value) => {
                        setSelectedYears(value as string[])
                        setCurrentPage(1)
                      }}
                    >
                      <VStack align="start" spacing={1}>
                        {globalSearchFacets.years.map((year) => (
                          <Checkbox key={year} value={year.toString()} size="sm">
                            {year}
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </AccordionPanel>
                </AccordionItem>

                {/* Units */}
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">單位</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} maxH="200px" overflow="auto">
                    <CheckboxGroup
                      value={selectedUnits}
                      onChange={(value) => {
                        setSelectedUnits(value as string[])
                        setCurrentPage(1)
                      }}
                    >
                      <VStack align="start" spacing={1}>
                        {globalSearchFacets.units.map((unit) => (
                          <Checkbox key={unit} value={unit} size="sm">
                            {unit}
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </AccordionPanel>
                </AccordionItem>

                {/* Methods */}
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">方法學</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} maxH="200px" overflow="auto">
                    <CheckboxGroup
                      value={selectedMethods}
                      onChange={(value) => {
                        setSelectedMethods(value as string[])
                        setCurrentPage(1)
                      }}
                    >
                      <VStack align="start" spacing={1}>
                        {globalSearchFacets.methods.map((method) => (
                          <Checkbox key={method} value={method} size="sm">
                            {method}
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </AccordionPanel>
                </AccordionItem>

                {/* Source Types */}
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">來源類型</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0}>
                    <CheckboxGroup
                      value={selectedSourceTypes}
                      onChange={(value) => {
                        setSelectedSourceTypes(value as string[])
                        setCurrentPage(1)
                      }}
                    >
                      <VStack align="start" spacing={1}>
                        {globalSearchFacets.sourceTypes.map((type) => (
                          <Checkbox key={type.value} value={type.value} size="sm">
                            {type.label}
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </VStack>
          </HStack>
        </Box>
      )}

      {/* 批次操作欄（僅在希達係數且有選中時顯示） */}
      {selectedNodeType === 'dataset' && batchSelectedIds.length > 0 && (
        <Box
          p={4}
          bg="blue.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="blue.200"
          mb={2}
        >
          <HStack justify="space-between">
            {/* 左側：選擇資訊 */}
            <HStack spacing={3}>
              <Icon as={CheckIcon} color="blue.600" />
              <Text fontWeight="bold" color="blue.800">
                已選擇 {batchSelectedIds.length} 個係數
              </Text>
            </HStack>

            {/* 右側：操作按鈕 */}
            <HStack spacing={3}>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelBatchSelection}
              >
                取消選擇
              </Button>
              <Button
                size="sm"
                colorScheme="brand"
                leftIcon={<AddIcon />}
                onClick={handleOpenBatchImportDialog}
              >
                批次加入中央庫
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      {/* Table */}
      <Box flex="1" overflow="auto">
        {/* 資料集為空時的提示 */}
        {selectedNodeType === 'dataset' && filteredData.length === 0 ? (
          <VStack spacing={4} p={8} textAlign="center" color="gray.500">
            <Box fontSize="3xl">📁</Box>
            <Text fontSize="lg" fontWeight="medium">
              此資料集暫無係數
            </Text>
            <Text fontSize="sm">
              點擊「新增係數」從全庫搜尋中選擇係數加入此資料集
            </Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={onOpenGlobalSearch}
            >
              新增係數
            </Button>
          </VStack>
        ) : (
          <>
            <Table size="sm" variant="simple">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                {/* 希達係數：添加全選 Checkbox */}
                {selectedNodeType === 'dataset' && (
                  <Th width="50px" textAlign="center">
                    <Checkbox
                      isChecked={isAllBatchSelected}
                      isIndeterminate={isIndeterminate}
                      onChange={handleBatchSelectAll}
                      colorScheme="brand"
                    />
                  </Th>
                )}
                {renderTableHeader(tableConfig.columns)}
                {/* 自建係數添加狀態和操作列表頭 */}
                {selectedNodeType === 'user_defined' && (
                  <>
                    <Th width="120px" textAlign="center">狀態</Th>
                    <Th width="80px" textAlign="center">操作</Th>
                  </>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {selectedNodeType === 'user_defined' ? (
                // 自建係數：需要額外的操作列
                paginatedData.map(row => (
                  <Tr
                    key={row.id}
                    onClick={() => handleRowClick(row as FactorTableItem)}
                    cursor="pointer"
                    bg={selectedFactor?.id === row.id ? 'gray.50' : 'white'}
                    _hover={{ bg: selectedFactor?.id === row.id ? 'gray.50' : 'gray.25' }}
                  >
                    {tableConfig.columns.map((column) => {
                      const value = (row as any)[column.key]
                      return (
                        <Td key={`${row.id}-${column.key}`} py={4} isNumeric={column.isNumeric}>
                          {column.formatter ? column.formatter(value, row) : (
                            <Text fontSize="sm" fontWeight={column.key === 'name' ? 'medium' : 'normal'}>
                              {value || '-'}
                            </Text>
                          )}
                        </Td>
                      )
                    })}
                    {/* 狀態列 */}
                    <Td textAlign="center">
                      {renderSyncStatus((row as any).data || row)}
                    </Td>
                    {/* 操作列 */}
                    <Td textAlign="center" onClick={(e) => e.stopPropagation()}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<HamburgerIcon />}
                          size="sm"
                          variant="ghost"
                          aria-label="操作選單"
                        />
                        <MenuList>
                          {(() => {
                            const factor = (row as any).data || row
                            const needsSync = checkIfNeedsSync(factor)

                            if (!factor.imported_to_central) {
                              // 未匯入：顯示匯入選項
                              return (
                                <MenuItem
                                  icon={<ArrowUpIcon />}
                                  onClick={() => handleImportClick(factor)}
                                >
                                  匯入中央庫
                                </MenuItem>
                              )
                            } else if (needsSync) {
                              // 需要同步：顯示同步選項
                              return (
                                <MenuItem
                                  icon={<RepeatIcon />}
                                  onClick={() => handleSyncClick(factor)}
                                  color="blue.500"
                                >
                                  同步到中央庫
                                </MenuItem>
                              )
                            } else {
                              // 已同步：顯示已匯入（可點擊）
                              return (
                                <MenuItem
                                  icon={<CheckIcon />}
                                  color="green.600"
                                  onClick={() => handleImportedInfoClick(factor)}
                                >
                                  已匯入中央庫
                                </MenuItem>
                              )
                            }
                          })()}

                          {/* 編輯按鈕 */}
                          <MenuItem
                            icon={<EditIcon />}
                            onClick={() => {
                              const factor = (row as any).data || row

                              // 檢查是否已匯入中央庫
                              if (factor.imported_to_central) {
                                onBlockEdit?.(factor)
                                return
                              }

                              // 根據係數類型呼叫對應的編輯函數
                              if (factor.type === 'custom_factor') {
                                onEditCustomFactor?.(row)
                              } else {
                                onEditComposite?.(factor)
                              }
                            }}
                          >
                            Edit
                          </MenuItem>

                          {/* 刪除按鈕 - 已匯入的係數打開說明對話框 */}
                          {(() => {
                            const rowData = (row as any).data || row

                            return (
                              <MenuItem
                                icon={<DeleteIcon />}
                                onClick={() => handleDeleteClick(rowData)}
                                color="red.500"
                              >
                                Delete
                              </MenuItem>
                            )
                          })()}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : selectedNodeType === 'dataset' ? (
                // 希達係數（dataset）：添加 Checkbox 列
                paginatedData.map(row => {
                  const isInCentral = dataService.isStandardFactorInCentral(row.id)
                  const isSelected = batchSelectedIds.includes(row.id)

                  return (
                    <Tr
                      key={row.id}
                      onClick={() => handleRowClick(row as FactorTableItem)}
                      cursor="pointer"
                      bg={selectedFactor?.id === row.id ? 'gray.50' : 'white'}
                      _hover={{ bg: selectedFactor?.id === row.id ? 'gray.50' : 'gray.25' }}
                    >
                      {/* Checkbox 列 */}
                      <Td textAlign="center" onClick={(e) => e.stopPropagation()}>
                        {isInCentral ? (
                          <Tooltip label="此係數已在中央庫" placement="top">
                            <Box display="inline-block">
                              <Checkbox isDisabled={true} />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Checkbox
                            isChecked={isSelected}
                            onChange={() => handleBatchSelect(row.id)}
                            colorScheme="brand"
                          />
                        )}
                      </Td>
                      {/* 其他欄位 */}
                      {tableConfig.columns.map((column) => {
                        const value = (row as any)[column.key]
                        return (
                          <Td key={`${row.id}-${column.key}`} py={4} isNumeric={column.isNumeric}>
                            {column.formatter ? column.formatter(value, row) : (
                              <Text fontSize="sm" fontWeight={column.key === 'name' ? 'medium' : 'normal'}>
                                {value || '-'}
                              </Text>
                            )}
                          </Td>
                        )
                      })}
                    </Tr>
                  )
                })
              ) : selectedNodeType === 'favorites' ? (
                // 中央係數庫：添加更新狀態顯示
                paginatedData.map(row => {
                  const updateInfo = factorUpdates.get(row.id)
                  
                  return (
                    <Tr
                      key={row.id}
                      onClick={() => handleRowClick(row as FactorTableItem)}
                      cursor="pointer"
                      bg={selectedFactor?.id === row.id ? 'gray.50' : 'white'}
                      _hover={{ bg: selectedFactor?.id === row.id ? 'gray.50' : 'gray.25' }}
                    >
                      {tableConfig.columns.map((column) => {
                        const value = (row as any)[column.key]
                        return (
                          <Td key={`${row.id}-${column.key}`} py={4} isNumeric={column.isNumeric}>
                            {column.formatter ? column.formatter(value, row) : (
                              <HStack spacing={2}>
                                <Text fontSize="sm" fontWeight={column.key === 'name' ? 'medium' : 'normal'}>
                                  {value || '-'}
                                </Text>
                                {/* 在係數名稱欄位顯示更新圖示 */}
                                {column.key === 'name' && updateInfo && updateInfo.userAction === 'none' && (
                                  <UpdateStatusIcon
                                    updateInfo={updateInfo}
                                    onClick={() => handleIndividualFactorUpdate(row as ExtendedFactorTableItem)}
                                    size="sm"
                                  />
                                )}
                              </HStack>
                            )}
                          </Td>
                        )
                      })}
                    </Tr>
                  )
                })
              ) : (
                // 其他類型：使用原有的 renderTableRow
                paginatedData.map(row =>
                  renderTableRow(
                    tableConfig.columns,
                    row,
                    handleRowClick,
                    selectedFactor?.id === row.id
                  )
                )
              )}
            </Tbody>
          </Table>

            {paginatedData.length === 0 && renderEmptyState()}
          </>
        )}
      </Box>


      {/* 匯入中央庫 Modal */}
      {selectedComposite && (
        <ImportCompositeToCentralModal
          isOpen={importModalOpen}
          onClose={() => {
            setImportModalOpen(false)
            setSelectedComposite(null)
          }}
          compositeFactor={{
            id: selectedComposite.id,
            name: selectedComposite.name,
            description: selectedComposite.description,
            value: selectedComposite.value,
            unit: selectedComposite.unit,
            formulaType: selectedComposite.formulaType || 'weighted',
            components: selectedComposite.components || [],
            region: selectedComposite.region,
            // 支援兩種日期欄位：組合係數用 enabledDate，自訂係數用 effective_date
            enabledDate: selectedComposite.enabledDate || selectedComposite.effective_date,
          } as any}
          onConfirm={handleImportConfirm}
          onEditComposite={(factor) => {
            // 關閉匯入對話框
            setImportModalOpen(false)
            // 觸發編輯回調
            onEditComposite?.(factor)
          }}
        />
      )}

      {/* 已匯入係數資訊對話框 */}
      {selectedImportedFactor && (
        <ImportedFactorInfoDialog
          isOpen={importedInfoDialogOpen}
          onClose={() => {
            setImportedInfoDialogOpen(false)
            setSelectedImportedFactor(null)
          }}
          factor={selectedImportedFactor}
          onNavigateToCentral={handleNavigateToCentral}
        />
      )}

      {/* 阻止刪除已匯入係數的對話框 */}
      {blockedFactor && (
        <BlockDeleteImportedDialog
          isOpen={blockDeleteDialogOpen}
          onClose={() => {
            setBlockDeleteDialogOpen(false)
            setBlockedFactor(null)
          }}
          factor={blockedFactor}
          onNavigateToCentral={handleNavigateToCentral}
        />
      )}

      {/* 批次匯入確認對話框 */}
      <BatchImportConfirmDialog
        isOpen={isBatchImportDialogOpen}
        onClose={() => setIsBatchImportDialogOpen(false)}
        selectedFactors={selectedFactorsForBatch}
        onConfirm={handleBatchImport}
        isProcessing={isBatchProcessing}
      />

      {/* Resource_8 係數更新通知 - 只在中央係數庫顯示 */}
      {selectedNodeType === 'favorites' && showUpdateNotification && updateResult && (
        <Box position="fixed" top="80px" right="20px" zIndex={1000} maxW="500px">
          <RelatedFactorUpdateNotification
            updateResult={updateResult}
            onViewComparison={handleViewComparison}
            onDismiss={onDismissNotification}
          />
        </Box>
      )}

      {/* 係數對比模態框 */}
      {updateResult && (
        <RelatedFactorComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          relatedFactors={updateResult.relatedFactors}
          onImportSuccess={() => {
            // 觸發中央係數庫刷新
            if (onNavigateToCentral) {
              // 透過回調通知父組件需要刷新
              onNavigateToCentral({ refreshCentral: true })
            }
            // 關閉通知和模態框
            if (onDismissNotification) {
              onDismissNotification()
            }
            setIsComparisonModalOpen(false)
          }}
        />
      )}

      {/* 個別係數對比彈窗 */}
      {individualComparisonFactor && (
        <IndividualFactorComparisonModal
          isOpen={isIndividualComparisonOpen}
          onClose={() => {
            setIsIndividualComparisonOpen(false)
            setIndividualComparisonFactor(null)
          }}
          currentFactor={individualComparisonFactor}
          updateInfo={factorUpdates.get(individualComparisonFactor.id)!}
          onUpdateSuccess={handleIndividualUpdateSuccess}
        />
      )}

      {/* Pagination */}
      <Flex p={4} borderTop="1px solid" borderColor="gray.200" align="center" justify="space-between">
        <HStack spacing={4}>
          {/* 翻頁控制按鈕 */}
          <HStack spacing={1}>
            <IconButton
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              aria-label="First page"
            />
            <IconButton
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
            />
            {/* 頁碼按鈕 */}
            {[...Array(Math.min(10, totalPages))].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? "solid" : "ghost"}
                  colorScheme={currentPage === pageNum ? "gray" : "gray"}
                  bg={currentPage === pageNum ? "gray.800" : "transparent"}
                  color={currentPage === pageNum ? "white" : "gray.600"}
                  onClick={() => setCurrentPage(pageNum)}
                  minW="32px"
                >
                  {pageNum}
                </Button>
              );
            })}
            <IconButton
              icon={<ChevronRightIcon />}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next page"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              aria-label="Last page"
            />
          </HStack>
        </HStack>

        <HStack>
          <Text fontSize="sm" color="gray.600">
            前往頁數
          </Text>
          <Input
            size="sm"
            w="60px"
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value) || 1;
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
          />
          <Text fontSize="sm" color="gray.600">
            →
          </Text>
          <Text fontSize="sm" color="gray.600">
            每頁顯示
          </Text>
          <Select
            size="sm"
            w="60px"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
          <Text fontSize="sm" color="gray.600">
            {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}-{Math.min(currentPage * pageSize, filteredData.length)} / {filteredData.length}
          </Text>
        </HStack>
      </Flex>
    </Box>
  )
}