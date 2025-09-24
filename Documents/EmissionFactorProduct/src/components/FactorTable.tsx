'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleDownIcon,
  ExternalLinkIcon,
  StarIcon,
  EditIcon,
  AddIcon,
  DeleteIcon,
} from '@chakra-ui/icons'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { formatNumber } from '@/lib/utils'
import { useMockData, type ExtendedFactorTableItem } from '@/hooks/useMockData'
import { useFactors } from '@/hooks/useFactors'
import { 
  mockProductCarbonFootprintData, 
  mockOrganizationalInventoryData 
} from '@/data/mockProjectData'

interface FactorTableItem {
  id: number
  type: 'emission_factor' | 'composite_factor'
  name: string
  value: number
  unit: string
  year?: number
  region?: string
  method_gwp?: string
  source_type?: string
  source_ref?: string
  version: string
  data: any // 儲存完整的 EmissionFactor 或 CompositeFactor 資料
}

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
  selectedNodeType?: 'general' | 'organizational_inventory' | 'product_carbon_footprint' | 'user_defined' | 'favorites' | 'pact' | 'supplier' | 'dataset' // 新增資料集類型
  selectedNode?: TreeNodeProps | null // 新增：選中的節點資訊
  userDefinedFactors?: any[] // 自建係數數據
  onOpenComposite?: () => void // 新增開啟組合係數編輯器的回調
  datasetFactors?: FactorTableItem[] // 資料集包含的係數數據
  onOpenGlobalSearch?: () => void // 新增開啟全庫搜尋的回調
  onDeleteFactor?: (factor: FactorTableItem) => void // 新增刪除係數回調
}

export default function FactorTable({ 
  onFactorSelect, 
  selectedNodeType = 'general',
  selectedNode = null, 
  userDefinedFactors = [], 
  onOpenComposite,
  datasetFactors = [],
  onOpenGlobalSearch,
  onDeleteFactor
}: FactorTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedFactor, setSelectedFactor] = useState<FactorTableItem | null>(null)

  // 使用統一資料管理
  const dataService = useMockData()
  
  // 使用 useFactors hook 處理專案資料
  const { factors: projectFactors, isLoading: isLoadingFactors } = useFactors({
    nodeId: selectedNode?.id,
    collectionId: selectedNodeType === 'favorites' ? 'favorites' :
                  selectedNodeType === 'user_defined' ? 'user_defined' :
                  selectedNodeType === 'pact' ? 'pact' :
                  selectedNodeType === 'supplier' ? 'supplier' : undefined
  })
  
  // 排放計算參數誤差等級選項（來自圖片）
  const errorLevelOptions = [
    '自廠發展係數/質量平衡所得係數',
    '同製程/設備經驗係數',
    '製造廠提供係數',
    '區域排放係數',
    '國家排放係數',
    '國際排放係數'
  ]

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
        // 組織盤查資料：轉換 FactorTableItem 回 mockOrganizationalInventoryData 格式
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
            year: data.year
          }
        })
        
        if (!searchTerm) return orgData
        return orgData.filter(item =>
          item.emission_source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.emission_source_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.scope.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else if (selectedNodeType === 'product_carbon_footprint' || selectedNode.id.startsWith('product_') || selectedNode.id.startsWith('source_1_')) {
        // 產品碳足跡資料：轉換 FactorTableItem 回 mockProductCarbonFootprintData 格式
        const productData = projectFactors.map((factor: any) => {
          const data = factor.data
          return {
            id: data.id,
            stage: data.stage,
            item_name: data.item_name,
            quantity_spec: data.quantity_spec,
            additional_info: data.additional_info,
            factor_selection: data.factor_selection,
            error_level: data.error_level,
            product: data.product,
            year: data.year
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

  const getSourceTypeBadge = (sourceType?: string) => {
    const configs = {
      standard: { label: '標準', colorScheme: 'blue' },
      pact: { label: 'PACT', colorScheme: 'green' },
      supplier: { label: '供應商', colorScheme: 'purple' },
      user_defined: { label: '自建', colorScheme: 'orange' },
    }
    
    const config = configs[sourceType as keyof typeof configs] || { label: '未知', colorScheme: 'gray' }
    return (
      <Badge size="sm" colorScheme={config.colorScheme}>
        {config.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    if (type === 'composite_factor') {
      return <EditIcon color="orange.500" />
    }
    return null
  }

  const handleRowClick = (factor: FactorTableItem) => {
    setSelectedFactor(factor)
    onFactorSelect?.(factor)
  }

  const handleErrorLevelChange = (itemId: number, newErrorLevel: string) => {
    // 這裡可以添加更新資料的邏輯，目前只是 console.log 作為示範
    console.log(`Item ${itemId} error level changed to: ${newErrorLevel}`)
    // 在實際應用中，這裡會調用 API 來更新資料
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Toolbar */}
      <Flex p={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={4}>
        <Text fontWeight="medium" color="gray.700">
          {selectedNodeType === 'organizational_inventory' ? '排放源清單' : 
           selectedNodeType === 'product_carbon_footprint' ? '產品生命週期清單' : 
           selectedNodeType === 'user_defined' ? '自建係數' :
           selectedNodeType === 'favorites' ? '中央係數庫' :
           selectedNodeType === 'pact' ? 'PACT交換係數' :
           selectedNodeType === 'supplier' ? '供應商係數' :
           '係數列表'}
        </Text>
        
        <InputGroup maxW="300px">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={
              selectedNodeType === 'organizational_inventory' 
                ? "搜尋排放源名稱、類別或範疇..."
                : selectedNodeType === 'product_carbon_footprint'
                ? "搜尋項目名稱、階段或係數..."
                : "搜尋係數名稱、單位或地區..."
            }
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
            {selectedNodeType === 'organizational_inventory' ? (
              <Tr>
                <Th width="80px">範疇</Th>
                <Th width="150px">排放源類別</Th>
                <Th width="200px">排放源名稱</Th>
                <Th width="120px" isNumeric>活動數據</Th>
                <Th width="120px">活動數據單位</Th>
                <Th width="200px">係數選擇</Th>
                <Th width="100px">版本</Th>
                <Th width="150px">排放計算參數誤差等級</Th>
              </Tr>
            ) : selectedNodeType === 'product_carbon_footprint' ? (
              <Tr>
                <Th width="80px">階段</Th>
                <Th width="200px">項目名稱</Th>
                <Th width="150px">數量/規格</Th>
                <Th width="180px">補充資訊</Th>
                <Th width="200px">係數選擇(含版本)</Th>
                <Th width="150px">誤差等級</Th>
              </Tr>
            ) : (
              <Tr>
                <Th width="4"></Th>
                <Th width="250px">名稱</Th>
                <Th width="100px" isNumeric>值</Th>
                <Th width="80px">單位</Th>
                <Th width="70px">年份</Th>
                <Th width="70px">地區</Th>
                <Th width="70px">方法</Th>
                <Th width="70px">來源</Th>
                <Th width="70px">版本</Th>
                <Th width="200px">引用專案</Th>
                <Th width="60px"></Th>
              </Tr>
            )}
          </Thead>
          <Tbody>
            {selectedNodeType === 'organizational_inventory' ? (
              // 組織溫盤表格內容
              paginatedData.map((item: any) => (
                <Tr
                  key={item.id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => onFactorSelect?.(item)}
                >
                  <Td>
                    <Badge 
                      size="sm" 
                      colorScheme={
                        item.scope === 'Scope 1' ? 'red' : 
                        item.scope === 'Scope 2' ? 'blue' : 'green'
                      }
                    >
                      {item.scope}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{item.emission_source_category}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.emission_source_name}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm" fontFamily="mono">
                      {formatNumber(item.activity_data)}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{item.activity_data_unit}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="blue.600">
                      {item.factor_selection}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {item.version}
                    </Text>
                  </Td>
                  <Td>
                    <Select
                      size="sm"
                      value={item.error_level}
                      onChange={(e) => handleErrorLevelChange(item.id, e.target.value)}
                      fontSize="sm"
                      borderRadius="md"
                    >
                      {errorLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))
            ) : selectedNodeType === 'product_carbon_footprint' ? (
              // 產品碳足跡表格內容
              paginatedData.map((item: any) => (
                <Tr
                  key={item.id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => onFactorSelect?.(item)}
                >
                  <Td>
                    <Badge 
                      size="sm" 
                      colorScheme={
                        item.stage === '原物料' ? 'blue' : 
                        item.stage === '製造' ? 'green' :
                        item.stage === '配送' ? 'purple' :
                        item.stage === '使用' ? 'orange' :
                        item.stage === '廢棄' ? 'red' : 'gray'
                      }
                      variant="subtle"
                    >
                      {item.stage}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.item_name}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {item.quantity_spec}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {item.additional_info}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="blue.600">
                      {item.factor_selection}
                    </Text>
                  </Td>
                  <Td>
                    <Select
                      size="sm"
                      value={item.error_level}
                      onChange={(e) => handleErrorLevelChange(item.id, e.target.value)}
                      fontSize="sm"
                      borderRadius="md"
                    >
                      {errorLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))
            ) : (
              // 一般係數表格內容
              paginatedData.map((factor: any) => (
                <Tr
                  key={factor.id}
                  cursor="pointer"
                  bg={selectedFactor?.id === factor.id ? 'blue.50' : undefined}
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleRowClick(factor)}
                >
                  <Td>{getTypeIcon(factor.type)}</Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                      {factor.name}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm" fontFamily="mono">
                      {formatNumber(factor.value)}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{factor.unit}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{factor.year || '-'}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{factor.region || '-'}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{factor.method_gwp || '-'}</Text>
                  </Td>
                  <Td>{getSourceTypeBadge(factor.source_type)}</Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      v{factor.version}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {factor.usageText || '未被使用'}
                    </Text>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<TriangleDownIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem icon={<StarIcon />}>
                          加入常用
                        </MenuItem>
                        <MenuItem icon={<ExternalLinkIcon />}>
                          查看詳情
                        </MenuItem>
                        <MenuItem icon={<EditIcon />}>
                          引用到專案
                        </MenuItem>
                        {factor.source_type === 'user_defined' && onDeleteFactor && (
                          <MenuItem 
                            icon={<DeleteIcon />} 
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteFactor(factor)
                            }}
                          >
                            刪除係數
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
          </Table>

            {paginatedData.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">沒有找到符合條件的係數</Text>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Pagination */}
      <Flex p={4} borderTop="1px solid" borderColor="gray.200" align="center" gap={4}>
        <HStack>
          <Text fontSize="sm" color="gray.600">
            每頁顯示
          </Text>
          <Select
            size="sm"
            w="80px"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
          <Text fontSize="sm" color="gray.600">
            筆
          </Text>
        </HStack>

        <Spacer />

        <HStack>
          <Text fontSize="sm" color="gray.600">
            第 {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} 筆，
            共 {filteredData.length} 筆
          </Text>
        </HStack>

        <HStack>
          <IconButton
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="outline"
            isDisabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            aria-label="Previous page"
          />
          
          <Text fontSize="sm" px={3}>
            {currentPage} / {totalPages}
          </Text>
          
          <IconButton
            icon={<ChevronRightIcon />}
            size="sm"
            variant="outline"
            isDisabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            aria-label="Next page"
          />
        </HStack>
      </Flex>
    </Box>
  )
}