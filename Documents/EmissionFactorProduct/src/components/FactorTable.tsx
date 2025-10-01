'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
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
} from '@chakra-ui/react'
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
} from '@chakra-ui/icons'
import { useState, useMemo, useCallback } from 'react'
import { useMockData } from '@/hooks/useMockData'
import { useFactors } from '@/hooks/useFactors'
// 引入配置驅動系統
import { getTableConfig } from '@/config/tableColumns'
import { renderTableHeader, renderTableRow, renderEmptyState } from '@/utils/tableRenderer'
import { FactorTableItem } from '@/types/types'
import ProductCarbonFootprintCard from '@/components/ProductCarbonFootprintCard'
import ProjectOverviewView from '@/components/ProjectOverviewView'
import OrganizationalInventoryOverview from '@/components/OrganizationalInventoryOverview'
import { mockProductCarbonFootprintSummaries, mockL2ProjectInfo, mockProjectProducts, mockL1ProjectInfo, mockInventoryYears } from '@/data/mockProjectData'

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
  selectedNodeType?: 'general' | 'organizational_inventory' | 'product_carbon_footprint' | 'user_defined' | 'favorites' | 'pact' | 'supplier' | 'dataset' | 'project_overview' | 'inventory_overview' // 新增盤查概覽類型
  selectedNode?: TreeNodeProps | null // 新增：選中的節點資訊
  userDefinedFactors?: any[] // 自建係數數據
  onOpenComposite?: () => void // 新增開啟組合係數編輯器的回調
  datasetFactors?: FactorTableItem[] // 資料集包含的係數數據
  onOpenGlobalSearch?: () => void // 新增開啟全庫搜尋的回調
  onNavigateToProduct?: (productId: string) => void // 新增導航到產品的回調
  onSyncL2Project?: () => Promise<void> // 新增同步 L2 專案的回調
  onNavigateToYear?: (yearId: string) => void // 新增導航到年度盤查的回調
  onSyncL1Project?: () => Promise<void> // 新增同步 L1 專案的回調
  productSummaries?: any[] // 產品碳足跡摘要列表
  onImportProduct?: (productId: string, formData: any) => Promise<void> // 匯入產品到中央庫
}

export default function FactorTable({
  onFactorSelect,
  selectedNodeType = 'general',
  selectedNode = null,
  userDefinedFactors = [],
  onOpenComposite,
  datasetFactors = [],
  onOpenGlobalSearch,
  onNavigateToProduct,
  onSyncL2Project,
  onNavigateToYear,
  onSyncL1Project,
  productSummaries = [],
  onImportProduct
}: FactorTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedFactor, setSelectedFactor] = useState<FactorTableItem | null>(null)

  // 獲取表格配置
  const tableConfig = getTableConfig(selectedNodeType)

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
                  selectedNodeType === 'supplier' ? 'supplier' : undefined
  })
  

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
        return [] // 資料集係數由 filteredData 直接處理，避免重複
      default:
        return dataService.getAllFactorItems()
    }
  }, [selectedNodeType, dataService])

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
        }))
      } else if (selectedNodeType === 'dataset') {
        // 資料集節點：直接使用資料集係數
        baseData = datasetFactors
      } else if (selectedNodeType === 'favorites') {
        // 中央係數庫：直接使用擴展的係數資料，保留 projectUsage 和 usageText
        baseData = factorData as any[] // factorData 已經是 ExtendedFactorTableItem[]
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
  }, [searchTerm, selectedNodeType, selectedNode, projectFactors, userDefinedFactors, datasetFactors, getFactorDataByType])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)


  const handleRowClick = (factor: FactorTableItem) => {
    setSelectedFactor(factor)
    onFactorSelect?.(factor)
  }


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

        {/* 自建係數頁面顯示組合係數按鈕 */}
        {selectedNodeType === 'user_defined' && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={onOpenComposite}
          >
            自建組合係數
          </Button>
        )}

        {/* 資料集頁面顯示新增係數按鈕 */}
        {selectedNodeType === 'dataset' && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            variant="outline"
            size="sm"
            onClick={onOpenGlobalSearch}
          >
            新增係數
          </Button>
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
                {renderTableHeader(tableConfig.columns)}
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.map(row =>
                renderTableRow(
                  tableConfig.columns,
                  row,
                  handleRowClick,
                  selectedFactor?.id === row.id
                )
              )}
            </Tbody>
          </Table>

            {paginatedData.length === 0 && renderEmptyState()}
          </>
        )}
      </Box>

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