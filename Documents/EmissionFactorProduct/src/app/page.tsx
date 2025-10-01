'use client'

import {
  Box,
  Flex,
  Button,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Divider,
  Slide,
  CloseButton,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { ChevronDownIcon, BellIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import Image from 'next/image'
import SidebarTree from '@/components/SidebarTree'
import FactorTable from '@/components/FactorTable'
import FactorDetail from '@/components/FactorDetail'
import CompositeEditorDrawer from '@/components/CompositeEditorDrawer'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import ProductCarbonFootprintCard from '@/components/ProductCarbonFootprintCard'
import { Dataset, ImportToCentralFormData } from '@/types/types'
import {
  mockProductCarbonFootprintSummaries,
  handleImportProductToCentral
} from '@/data/mockProjectData'

// 定義節點類型介面
interface TreeNodeProps {
  id: string
  name: string
  type: 'collection' | 'project' | 'emission_source' | 'product' | 'yearly_inventory'
  count?: number
  children?: TreeNodeProps[]
  product_id?: string
}

export default function HomePage() {
  const { isOpen: isCompositeOpen, onOpen: onCompositeOpen, onClose: onCompositeClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  // 新增選中節點狀態（預設選中中央係數庫）
  const [selectedNode, setSelectedNode] = useState<TreeNodeProps | null>({
    id: 'favorites',
    name: '中央係數庫',
    type: 'collection'
  })
  // 新增選中係數狀態和詳情面板狀態
  const [selectedFactor, setSelectedFactor] = useState<any | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  // 自建係數狀態管理
  const [userDefinedFactors, setUserDefinedFactors] = useState<any[]>([])
  
  // 資料集狀態管理
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null)

  // 刪除相關狀態
  const [factorToDelete, setFactorToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 產品碳足跡相關狀態
  const [productSummaries, setProductSummaries] = useState(mockProductCarbonFootprintSummaries)

  // 中央係數庫更新觸發器（用於強制重新渲染）
  const [centralLibraryUpdateKey, setCentralLibraryUpdateKey] = useState(0)

  // 處理節點選擇
  const handleNodeSelect = (node: TreeNodeProps) => {
    console.log('選擇節點:', node.name, node.id)
    
    setSelectedNode(node)
    // 切換節點時清空選中的係數
    setSelectedFactor(null)
    
    // 如果選擇的是資料集，設置當前資料集
    if (node.id.startsWith('dataset_')) {
      const datasetId = node.id.replace('dataset_', '')
      const dataset = datasets.find(d => d.id === datasetId)
      console.log('選擇資料集:', dataset?.name, '包含係數:', dataset?.factorIds.length || 0)
      setCurrentDataset(dataset || null)
    } else {
      setCurrentDataset(null)
    }
  }

  // 處理係數選擇
  const handleFactorSelect = (factor: any) => {
    setSelectedFactor(factor)
    setIsDetailPanelOpen(true)
  }

  // 處理關閉詳情面板
  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setSelectedFactor(null)
  }

  // 處理新組合係數儲存
  const handleCompositeFactorSave = (compositeData: any) => {
    const newFactor = {
      id: Date.now(), // 生成唯一ID
      type: 'composite_factor',
      name: compositeData.name,
      value: compositeData.computed_value,
      unit: compositeData.unit,
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      created_at: new Date().toISOString(),
      ...compositeData
    }
    
    setUserDefinedFactors(prev => [...prev, newFactor])
    console.log('新增自建係數:', newFactor)
  }

  // 處理資料集創建
  const handleCreateDataset = (datasetData: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) => {
    const newDataset: Dataset = {
      id: Date.now().toString(), // 移除 dataset_ 前綴，因為 SidebarTree 會加上
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...datasetData
    }
    
    setDatasets(prev => [...prev, newDataset])
    console.log('新增資料集:', newDataset)
  }

  // 處理加入係數到資料集
  const handleAddToDataset = (factorId: number) => {
    if (!currentDataset) return
    
    // 檢查係數是否已存在，避免重複加入
    if (currentDataset.factorIds.includes(factorId)) {
      console.log('係數已存在於資料集中:', factorId)
      return
    }
    
    const updatedDataset = {
      ...currentDataset,
      factorIds: [...currentDataset.factorIds, factorId],
      updated_at: new Date().toISOString()
    }
    
    setDatasets(prev => 
      prev.map(dataset => 
        dataset.id === currentDataset.id ? updatedDataset : dataset
      )
    )
    setCurrentDataset(updatedDataset)
    console.log('係數已加入資料集:', factorId, updatedDataset.name)
  }

  // 處理開啟全庫搜尋（用於資料集）- 改為導航到全庫搜尋節點
  const handleOpenGlobalSearchForDataset = () => {
    setSelectedNode({
      id: 'global_search',
      name: '全庫搜尋',
      type: 'collection'
    })
  }

  // 處理編輯自建係數
  const handleEditFactor = (updatedFactor: any) => {
    setUserDefinedFactors(prev => 
      prev.map(factor => 
        factor.id === updatedFactor.id 
          ? { ...updatedFactor, updated_at: new Date().toISOString() }
          : factor
      )
    )
    
    // 如果當前選中的是被編輯的係數，更新選中狀態
    if (selectedFactor && selectedFactor.id === updatedFactor.id) {
      setSelectedFactor({ ...updatedFactor, updated_at: new Date().toISOString() })
    }
    
    console.log('編輯自建係數:', updatedFactor)
  }

  // 處理刪除自建係數請求
  const handleDeleteFactorRequest = (factor: any) => {
    setFactorToDelete(factor)
    onDeleteOpen()
  }

  // 檢查係數使用情況
  const getFactorUsageInfo = (factorId: number) => {
    // 檢查是否被其他組合係數使用
    const usedInComposites = userDefinedFactors
      .filter(f => f.type === 'composite_factor' && f.components?.some((c: any) => c.ef_id === factorId))
      .map(f => f.name)
    
    // 檢查是否在資料集中使用
    const usedInDatasets = datasets.filter(d => d.factorIds.includes(factorId)).length
    
    return {
      usedInProjects: 0, // 暫時沒有專案引用檢查
      usedInComposites,
      usedInDatasets
    }
  }

  // 處理產品碳足跡匯入中央庫
  const handleImportProduct = async (productId: string, formData: ImportToCentralFormData) => {
    try {
      const newFactor = handleImportProductToCentral(productId, formData)
      console.log('產品碳足跡已匯入中央庫:', newFactor)

      // 重新整理產品摘要列表以反映更新
      setProductSummaries([...mockProductCarbonFootprintSummaries])

      // 觸發中央係數庫重新渲染
      setCentralLibraryUpdateKey(prev => prev + 1)
    } catch (error) {
      console.error('匯入失敗:', error)
      throw error
    }
  }

  // 確認刪除自建係數
  const handleConfirmDeleteFactor = async () => {
    if (!factorToDelete) return
    
    try {
      setIsDeleting(true)
      
      // 模擬刪除 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 從狀態中移除係數
      setUserDefinedFactors(prev => prev.filter(f => f.id !== factorToDelete.id))
      
      // 如果當前選中的是被刪除的係數，清空選中狀態
      if (selectedFactor && selectedFactor.id === factorToDelete.id) {
        setSelectedFactor(null)
      }
      
      // 從資料集中移除該係數
      setDatasets(prev => 
        prev.map(dataset => ({
          ...dataset,
          factorIds: dataset.factorIds.filter(id => id !== factorToDelete.id),
          updated_at: new Date().toISOString()
        }))
      )
      
      console.log('刪除自建係數:', factorToDelete.name)
    } catch (error) {
      console.error('刪除係數失敗:', error)
    } finally {
      setIsDeleting(false)
      setFactorToDelete(null)
      onDeleteClose()
    }
  }

  // 判斷節點類型，決定要顯示哪種表格
  const getTableNodeType = (node: TreeNodeProps | null): 'general' | 'organizational_inventory' | 'product_carbon_footprint' | 'user_defined' | 'favorites' | 'pact' | 'supplier' | 'dataset' | 'project_overview' | 'inventory_overview' | 'global_search' => {
    if (!node) return 'general'

    // 如果是全庫搜尋節點
    if (node.id === 'global_search') {
      return 'global_search'
    }

    // 如果是 L2 專案根節點，顯示專案概覽
    if (node.id === 'project_1' && node.type === 'project') {
      return 'project_overview'
    }

    // 如果是 L1 專案根節點，顯示盤查概覽
    if (node.id === 'project_2' && node.type === 'project') {
      return 'inventory_overview'
    }

    // 如果是資料集節點，返回資料集類型
    if (node.id.startsWith('dataset_')) {
      return 'dataset'
    }

    // 如果是係數集合類型節點，返回對應的過濾類型
    if (node.type === 'collection') {
      switch (node.id) {
        case 'user_defined':
          return 'user_defined'
        case 'favorites':
          return 'favorites'
        case 'pact':
          return 'pact'
        case 'supplier':
          return 'supplier'
        default:
          break
      }
    }

    // 如果是「產品碳足跡」專案或其子節點，顯示產品碳足跡表格
    if (node.name.includes('產品碳足跡') || node.name.includes('碳足跡')) {
      return 'product_carbon_footprint'
    }

    // 檢查是否為產品節點或其排放源子節點（新的ID結構）
    if (node.id.startsWith('product_1_') || node.id.startsWith('source_1_')) {
      return 'product_carbon_footprint'
    }

    // 如果是「組織碳盤查」專案或其子節點，顯示組織溫盤表格
    if (node.name.includes('組織碳盤查') || node.name.includes('組織盤查')) {
      return 'organizational_inventory'
    }

    // 檢查是否為年度盤查節點或其排放源子節點（新的ID結構）
    if (node.id.startsWith('year_2_') || node.id.startsWith('source_2_')) {
      return 'organizational_inventory'
    }

    return 'general'
  }

  // 導航到產品節點
  const handleNavigateToProduct = (productId: string) => {
    console.log('導航到產品:', productId)

    // 根據產品 ID 找到對應的節點
    // 這裡需要在 SidebarTree 中找到對應節點並選中
    // 暫時只設置選中節點
    const productNode: TreeNodeProps = {
      id: productId,
      name: productId.includes('product_1_1') ? '產品A1 - 智慧型手機 (2024)' :
            productId.includes('product_1_2') ? '產品A2 - LED燈具 (2024)' :
            productId.includes('product_1_3') ? '產品A3 - 筆記型電腦 (2024)' :
            'PACT 產品',
      type: productId.startsWith('pact_') ? 'collection' : 'product',
      product_id: productId // 新增 product_id 以便傳遞給 table
    }

    setSelectedNode(productNode)
  }

  // 同步 L2 專案
  const handleSyncL2Project = async () => {
    console.log('開始同步 L2 專案...')

    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 在實際實作中，這裡會：
    // 1. 呼叫 API 獲取 L2 專案最新資料
    // 2. 更新本地專案資訊
    // 3. 更新產品列表
    // 4. 重新整理側邊欄計數

    console.log('同步完成!')
  }

  // 導航到年度盤查節點
  const handleNavigateToYear = (yearId: string) => {
    console.log('導航到年度盤查:', yearId)

    // 根據年度 ID 找到對應的節點
    const yearNode: TreeNodeProps = {
      id: yearId,
      name: yearId.includes('2024') ? '2024年度盤查' :
            yearId.includes('2023') ? '2023年度盤查' :
            yearId.includes('2022') ? '2022年度盤查' :
            '年度盤查',
      type: 'yearly_inventory'
    }

    setSelectedNode(yearNode)
  }

  // 同步 L1 專案
  const handleSyncL1Project = async () => {
    console.log('開始同步 L1 專案...')

    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 在實際實作中，這裡會：
    // 1. 呼叫 API 獲取 L1 專案最新資料
    // 2. 更新本地專案資訊
    // 3. 更新年度盤查列表
    // 4. 重新整理側邊欄計數

    console.log('同步完成!')
  }

  // 獲取資料集包含的係數數據
  const getDatasetFactors = () => {
    if (!currentDataset) return []
    
    // 這裡應該根據資料集中的 factorIds 來獲取實際的係數數據
    // 目前使用 mock 數據示例
    const factors = currentDataset.factorIds.map(id => ({
      id,
      type: 'emission_factor' as const,
      name: `係數 ${id}`,
      value: Math.random() * 10,
      unit: 'kg CO₂/單位',
      year: 2024,
      region: '台灣',
      source_type: 'standard' as const,
      method_gwp: 'GWP100',
      version: '1.0',
      data: { id, name: `係數 ${id}` }
    }))
    
    return factors
  }

  return (
    <Box h="100vh" bg="gray.50">
      {/* Top Navigation Bar */}
      <Flex
        h="48px"
        bg="#2c2f3e"
        align="center"
        px={3}
        gap={1}
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
      >
        {/* Logo */}
        <Flex align="center" mr={2}>
          <Image
            src="/logo.png"
            alt="CarbonM Logo"
            width={100}
            height={28}
            style={{ objectFit: 'contain' }}
          />
        </Flex>

        <Spacer />

        {/* Right Side Items */}
        <HStack spacing={1}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon boxSize={3} />}
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.100' }}
              size="sm"
              fontWeight="normal"
              fontSize="13px"
              h="32px"
              px={3}
            >
              Data Hub
            </MenuButton>
            <MenuList bg="white" minW="140px">
              <MenuItem fontSize="sm">Data Center</MenuItem>
              <MenuItem fontSize="sm">Factor Hub</MenuItem>
            </MenuList>
          </Menu>

          <Button
            variant="ghost"
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
            size="sm"
            fontWeight="normal"
            fontSize="13px"
            h="32px"
            px={3}
          >
            Reports
          </Button>

          <Button
            variant="ghost"
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
            size="sm"
            fontWeight="normal"
            fontSize="13px"
            h="32px"
            px={3}
          >
            Dashboard
          </Button>

          <Box w="1px" h="20px" bg="whiteAlpha.300" mx={1} />

          <IconButton
            icon={<BellIcon boxSize={4} />}
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            size="sm"
            aria-label="Notifications"
            position="relative"
            minW="32px"
            h="32px"
          />

          <IconButton
            icon={<Box />}
            variant="ghost"
            _hover={{ bg: 'whiteAlpha.100' }}
            size="sm"
            aria-label="Settings"
            minW="32px"
            h="32px"
          >
            <Box fontSize="16px">⚙️</Box>
          </IconButton>

          <Menu>
            <MenuButton
              as={IconButton}
              icon={
                <Box
                  bg="teal.500"
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="10px"
                  fontWeight="bold"
                  color="white"
                >
                  LZ
                </Box>
              }
              variant="ghost"
              _hover={{ bg: 'whiteAlpha.100' }}
              size="sm"
              aria-label="User menu"
              minW="32px"
              h="32px"
            />
            <MenuList bg="white">
              <MenuItem fontSize="sm">個人設定</MenuItem>
              <MenuItem fontSize="sm">系統偏好</MenuItem>
              <Divider />
              <MenuItem fontSize="sm">登出</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Main Layout */}
      <Box h="calc(100vh - 48px)" position="relative">
        <Flex h="100%">
          {/* Left Sidebar */}
          <Box
            w="280px"
            bg="sidebar.bg"
            borderRight="1px solid"
            borderColor="sidebar.border"
            overflow="auto"
            position="relative"
            zIndex={isDetailPanelOpen ? 0 : 1}
          >
            <SidebarTree
              onNodeSelect={handleNodeSelect}
              selectedNode={selectedNode}
              onCreateDataset={handleCreateDataset}
              datasets={datasets}
              userDefinedFactors={userDefinedFactors}
            />
          </Box>

          {/* Middle Panel */}
          <Box
            flex="1"
            bg="white"
            overflow="auto"
            position="relative"
            zIndex={isDetailPanelOpen ? 0 : 1}
          >
            <FactorTable
              key={centralLibraryUpdateKey}
              selectedNodeType={getTableNodeType(selectedNode)}
              selectedNode={selectedNode}
              onFactorSelect={handleFactorSelect}
              userDefinedFactors={userDefinedFactors}
              onOpenComposite={onCompositeOpen}
              datasetFactors={getDatasetFactors()}
              onOpenGlobalSearch={handleOpenGlobalSearchForDataset}
              onNavigateToProduct={handleNavigateToProduct}
              onSyncL2Project={handleSyncL2Project}
              onNavigateToYear={handleNavigateToYear}
              onSyncL1Project={handleSyncL1Project}
              productSummaries={productSummaries}
              onImportProduct={handleImportProduct}
            />
          </Box>
        </Flex>

        {/* Overlay Mask */}
        {isDetailPanelOpen && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.500"
            zIndex={10}
            onClick={handleCloseDetailPanel}
            cursor="pointer"
          />
        )}

        {/* Right Panel - Sliding Detail Panel */}
        {isDetailPanelOpen && (
          <Box
            position="absolute"
            top={0}
            right={0}
            w="420px"
            h="100%"
            bg="white"
            borderLeft="1px solid"
            borderColor="gray.200"
            overflow="auto"
            boxShadow="-2px 0 10px rgba(0,0,0,0.1)"
            zIndex={20}
            transform={isDetailPanelOpen ? "translateX(0)" : "translateX(100%)"}
            transition="transform 0.3s ease-in-out"
          >
            {/* Close Button */}
            <CloseButton
              position="absolute"
              top={4}
              right={4}
              zIndex={21}
              onClick={handleCloseDetailPanel}
              size="lg"
              bg="gray.100"
              _hover={{ bg: "gray.200" }}
            />

            {selectedFactor && (
              <FactorDetail
                selectedFactor={selectedFactor}
                onEditFactor={handleEditFactor}
                isUserDefinedFactor={selectedFactor?.source_type === 'user_defined'}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Modals & Drawers */}
      <CompositeEditorDrawer
        isOpen={isCompositeOpen}
        onClose={onCompositeClose}
        onSave={handleCompositeFactorSave}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDeleteFactor}
        factorName={factorToDelete?.name || ''}
        factorType={factorToDelete?.type || 'emission_factor'}
        usageInfo={factorToDelete ? getFactorUsageInfo(factorToDelete.id) : undefined}
        isLoading={isDeleting}
      />
    </Box>
  )
}