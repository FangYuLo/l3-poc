'use client'

import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import SidebarTree from '@/components/SidebarTree'
import FactorTable from '@/components/FactorTable'
import FactorDetail from '@/components/FactorDetail'
import GlobalSearchModal from '@/components/GlobalSearchModal'
import CompositeEditorDrawer from '@/components/CompositeEditorDrawer'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Dataset } from '@/types/types'

// 定義節點類型介面
interface TreeNodeProps {
  id: string
  name: string
  type: 'collection' | 'project' | 'emission_source' | 'product' | 'yearly_inventory'
  count?: number
  children?: TreeNodeProps[]
}

export default function HomePage() {
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure()
  const { isOpen: isCompositeOpen, onOpen: onCompositeOpen, onClose: onCompositeClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  // 新增選中節點狀態
  const [selectedNode, setSelectedNode] = useState<TreeNodeProps | null>(null)
  // 新增選中係數狀態
  const [selectedFactor, setSelectedFactor] = useState<any | null>(null)
  // 自建係數狀態管理
  const [userDefinedFactors, setUserDefinedFactors] = useState<any[]>([])
  
  // 資料集狀態管理
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null)
  
  // Global Search Modal 狀態
  const [globalSearchMode, setGlobalSearchMode] = useState<'search' | 'add_to_dataset'>('search')
  
  // 刪除相關狀態
  const [factorToDelete, setFactorToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // 處理開啟全庫搜尋（用於資料集）
  const handleOpenGlobalSearchForDataset = () => {
    if (currentDataset) {
      setGlobalSearchMode('add_to_dataset')
      onSearchOpen()
    }
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
  const getTableNodeType = (node: TreeNodeProps | null): 'general' | 'organizational_inventory' | 'product_carbon_footprint' | 'user_defined' | 'favorites' | 'pact' | 'supplier' | 'dataset' => {
    if (!node) return 'general'
    
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
      {/* Top Toolbar */}
      <Flex
        h="60px"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        align="center"
        px={6}
        shadow="sm"
      >
        {/* Left: System Title + Current Project */}
        <Flex align="center" gap={4}>
          <Text fontSize="lg" fontWeight="bold" color="brand.600">
            Emission Factor Management
          </Text>
          <Text color="gray.400">|</Text>
          <Text fontSize="md" color="gray.600">
            專案 A
          </Text>
        </Flex>

        <Spacer />

        {/* Center: Global Search */}
        <Button
          leftIcon={<SearchIcon />}
          colorScheme="brand"
          variant="outline"
          onClick={onSearchOpen}
          size="sm"
        >
          全庫搜尋 🌍
        </Button>

        <Spacer />

        {/* Right: User Menu */}
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="ghost">
            使用者
          </MenuButton>
          <MenuList>
            <MenuItem>個人設定</MenuItem>
            <MenuItem>系統偏好</MenuItem>
            <Divider />
            <MenuItem>登出</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Main Layout */}
      <Flex h="calc(100vh - 60px)">
        {/* Left Sidebar */}
        <Box 
          w="280px" 
          bg="sidebar.bg" 
          borderRight="1px solid" 
          borderColor="sidebar.border"
          overflow="auto"
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
        <Box flex="1" bg="white" overflow="auto">
          <FactorTable 
            selectedNodeType={getTableNodeType(selectedNode)}
            selectedNode={selectedNode}
            onFactorSelect={handleFactorSelect}
            userDefinedFactors={userDefinedFactors}
            onOpenComposite={onCompositeOpen}
            datasetFactors={getDatasetFactors()}
            onOpenGlobalSearch={handleOpenGlobalSearchForDataset}
            onDeleteFactor={handleDeleteFactorRequest}
          />
        </Box>

        {/* Right Panel */}
        <Box 
          w="420px" 
          bg="gray.50" 
          borderLeft="1px solid" 
          borderColor="gray.200" 
          overflow="auto"
        >
          <FactorDetail 
            selectedFactor={selectedFactor} 
            onEditFactor={handleEditFactor}
            isUserDefinedFactor={selectedFactor?.source_type === 'user_defined'}
          />
        </Box>
      </Flex>

      {/* Modals & Drawers */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => {
          onSearchClose()
          setGlobalSearchMode('search') // 重置模式
        }}
        onOpenComposite={onCompositeOpen}
        mode={globalSearchMode}
        targetDatasetId={currentDataset?.id}
        onAddToDataset={handleAddToDataset}
      />
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