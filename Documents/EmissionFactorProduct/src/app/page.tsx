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
import CustomFactorDrawer from '@/components/CustomFactorDrawer'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import ProductCarbonFootprintCard from '@/components/ProductCarbonFootprintCard'
import FactorSelectorModal from '@/components/FactorSelectorModal'
import FormulaBuilderModal from '@/components/formula-builder/FormulaBuilderModal'
import BlockDeleteImportedDialog from '@/components/BlockDeleteImportedDialog'
import BlockEditImportedDialog from '@/components/BlockEditImportedDialog'
import RemoveFromCentralDialog from '@/components/RemoveFromCentralDialog'
import ImportCompositeToCentralModal from '@/components/ImportCompositeToCentralModal'
import { SupplierFolderPage, SupplierDetailPage } from '@/components/SupplierFolder'
import { Dataset, ImportToCentralFormData, CustomFactor } from '@/types/types'
import {
  mockProductCarbonFootprintSummaries,
  handleImportProductToCentral
} from '@/data/mockProjectData'
import {
  useMockData,
  UpdateResult,
  RelatedFactorInfo,
  addUserDefinedCompositeFactor,
  updateUserDefinedCompositeFactor,
  deleteUserDefinedCompositeFactor,
  getUserDefinedCompositeFactors,
  getUserDefinedCompositeFactorById,
  canDeleteCompositeFactor,
  addStandardFactorToCentral,
  addCustomFactor,
  updateCustomFactor,
  getCustomFactorById,
  getAllUserDefinedFactors,
  importCustomFactorToCentral,
  deleteCustomFactorSafe,
  canDeleteCustomFactor,
} from '@/hooks/useMockData'
import { useComposites } from '@/hooks/useComposites'
import { useToast } from '@chakra-ui/react'

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
  const { isOpen: isCustomFactorOpen, onOpen: onCustomFactorOpen, onClose: onCustomFactorClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isFactorSelectorOpen, onOpen: onFactorSelectorOpen, onClose: onFactorSelectorClose } = useDisclosure()
  const { isOpen: isFormulaBuilderOpen, onOpen: onFormulaBuilderOpen, onClose: onFormulaBuilderClose } = useDisclosure()

  // 使用 mock data hook 獲取真實資料
  const mockData = useMockData()
  const toast = useToast()
  const { removeFromCentral, isLoading: compositeLoading } = useComposites()

  // 新增對話框狀態
  const [blockDeleteDialogOpen, setBlockDeleteDialogOpen] = useState(false)
  const [blockedFactor, setBlockedFactor] = useState<any | null>(null)
  const [blockEditDialogOpen, setBlockEditDialogOpen] = useState(false)
  const [blockedEditFactor, setBlockedEditFactor] = useState<any | null>(null)
  const [removeFromCentralDialogOpen, setRemoveFromCentralDialogOpen] = useState(false)
  const [factorToRemove, setFactorToRemove] = useState<any | null>(null)
  
  // 匯入中央庫對話框狀態
  const [importToCentralModalOpen, setImportToCentralModalOpen] = useState(false)
  const [factorToImport, setFactorToImport] = useState<any | null>(null)
  
  // 新增選中節點狀態（預設選中中央係數庫）
  const [selectedNode, setSelectedNode] = useState<TreeNodeProps | null>({
    id: 'favorites',
    name: '中央係數庫',
    type: 'collection'
  })

  // L4 供應商係數資料夾狀態
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)

  // 新增選中係數狀態和詳情面板狀態
  const [selectedFactor, setSelectedFactor] = useState<any | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  // 編輯中的組合係數
  const [editingComposite, setEditingComposite] = useState<any | null>(null)
  // 編輯中的自訂係數
  const [editingCustomFactor, setEditingCustomFactor] = useState<CustomFactor | null>(null)
  // 用於觸發重新渲染的狀態
  const [refreshKey, setRefreshKey] = useState(0)
  
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

  // Resource_8 係數更新通知狀態（全域管理）
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)

  // 處理節點選擇
  const handleNodeSelect = (node: TreeNodeProps) => {
    console.log('選擇節點:', node.name, node.id)

    setSelectedNode(node)
    // 切換節點時清空選中的係數
    setSelectedFactor(null)

    // 切換離開供應商節點時，重置供應商選擇
    if (node.id !== 'supplier') {
      setSelectedSupplierId(null)
    }

    // 如果選擇的是資料集，設置當前資料集
    if (node.id.startsWith('dataset_')) {
      const datasetId = node.id.replace('dataset_', '')
      const dataset = datasets.find(d => d.id === datasetId)
      console.log('選擇資料集:', dataset?.name, '包含係數:', dataset?.factorIds.length || 0)
      setCurrentDataset(dataset || null)
    } else {
      setCurrentDataset(null)
    }

    // 如果選擇的是自建係數節點或中央係數庫，觸發刷新以獲取最新數據
    if (node.id === 'user_defined' || node.id === 'favorites') {
      setRefreshKey(prev => prev + 1)
      console.log('[handleNodeSelect] 觸發數據刷新 - 節點:', node.name)
    }
  }

  // 處理係數選擇
  const handleFactorSelect = (factor: any) => {
    console.log('[handleFactorSelect] 選中係數:', factor)
    console.log('[handleFactorSelect] factor.type:', factor?.type)
    console.log('[handleFactorSelect] factor.data:', factor?.data)
    setSelectedFactor(factor)
    setIsDetailPanelOpen(true)
  }

  // 處理關閉詳情面板
  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setSelectedFactor(null)
  }

  // 版本號遞增函數（方案一：每次編輯都遞增）
  const incrementVersion = (currentVersion: string): string => {
    // 解析版本號 "v1.0" → [1, 0]
    const match = currentVersion.match(/^v?(\d+)\.(\d+)$/)
    if (!match) return 'v1.1' // 如果格式錯誤，預設返回 v1.1

    let major = parseInt(match[1])
    let minor = parseInt(match[2])

    // 小版本 +1
    minor += 1

    // 如果小版本達到 10，進位到大版本
    if (minor >= 10) {
      major += 1
      minor = 0
    }

    return `v${major}.${minor}`
  }

  // 生成變更摘要
  const generateChangeSummary = (oldFactor: any, newData: any): string => {
    const changes: string[] = []

    // 檢查名稱變更
    if (oldFactor.name !== newData.name) {
      changes.push('更新名稱')
    }

    // 檢查描述變更
    if (oldFactor.description !== newData.description) {
      changes.push('更新描述')
    }

    // 檢查組成係數數量變更
    const oldComponentCount = oldFactor.components?.length || 0
    const newComponentCount = newData.components?.length || 0
    if (oldComponentCount !== newComponentCount) {
      changes.push(`組成係數數量 ${oldComponentCount} → ${newComponentCount}`)
    }

    // 檢查權重變更
    const hasWeightChange = newData.components?.some((newComp: any, idx: number) => {
      const oldComp = oldFactor.components?.[idx]
      return oldComp && oldComp.weight !== newComp.weight
    })
    if (hasWeightChange) {
      changes.push('調整權重')
    }

    // 檢查計算方法變更
    if (oldFactor.formula_type !== newData.formula_type) {
      changes.push('變更計算方法')
    }

    return changes.length > 0 ? changes.join('、') : '更新係數'
  }

  // 處理新組合係數儲存或更新
  const handleCompositeFactorSave = (compositeData: any) => {
    if (compositeData.id) {
      // 更新模式
      const existingFactor = getUserDefinedCompositeFactorById(compositeData.id)

      if (!existingFactor) {
        console.error('[handleCompositeFactorSave] 找不到現有係數:', compositeData.id)
        return
      }

      const currentTime = new Date().toISOString()
      const newVersion = incrementVersion(String(existingFactor.version || 'v1.0'))
      const changeSummary = generateChangeSummary(existingFactor, compositeData)

      // 更新版本歷史：將舊版本標記為非當前
      const updatedHistory = (existingFactor.version_history || []).map(entry => ({
        ...entry,
        isCurrent: false
      }))

      // 加入新版本記錄
      updatedHistory.push({
        version: newVersion,
        date: currentTime,
        isCurrent: true,
        changes: changeSummary,
        value: compositeData.computed_value,
        components: compositeData.components ? JSON.parse(JSON.stringify(compositeData.components)) : []
      })

      const updatedFactor = {
        ...compositeData,
        type: 'composite_factor',
        value: compositeData.computed_value,
        source_type: 'user_defined',
        updated_at: currentTime,
        // 使用版本號遞增邏輯
        version: newVersion,
        version_history: updatedHistory,
        // 保留匯入信息，但不更新 last_synced_version（因為還沒同步）
        imported_to_central: existingFactor?.imported_to_central || false,
        central_library_id: existingFactor?.central_library_id,
        imported_at: existingFactor?.imported_at,
        last_synced_at: existingFactor?.last_synced_at,
        last_synced_version: existingFactor?.last_synced_version,
      }

      updateUserDefinedCompositeFactor(compositeData.id, updatedFactor)

      // 如果當前選中的是被編輯的係數，更新選中狀態
      if (selectedFactor && selectedFactor.id === compositeData.id) {
        setSelectedFactor(updatedFactor)
      }

      console.log('[handleCompositeFactorSave] 更新自建組合係數:', updatedFactor.name, updatedFactor.version, '變更:', changeSummary)
    } else {
      // 新增模式
      const newFactor = {
        id: Date.now(), // 生成唯一ID
        type: 'composite_factor',
        name: compositeData.name,
        value: compositeData.computed_value,
        unit: compositeData.unit,
        method_gwp: 'GWP100',
        source_type: 'user_defined',
        version: 'v1.0',  // 新建時固定為 v1.0
        created_at: new Date().toISOString(),
        ...compositeData
      }

      addUserDefinedCompositeFactor(newFactor)
      console.log('[handleCompositeFactorSave] 新增自建組合係數:', newFactor.name, newFactor.version)
    }

    // 清除編輯狀態
    setEditingComposite(null)
    // 觸發重新渲染
    setRefreshKey(prev => prev + 1)
  }

  // 處理自訂係數儲存
  const handleCustomFactorSave = (factor: CustomFactor) => {
    if (factor.id && getCustomFactorById(factor.id)) {
      // 更新現有係數
      updateCustomFactor(factor.id, factor)
      console.log('[handleCustomFactorSave] 更新自訂係數:', factor.name)
    } else {
      // 新增係數
      addCustomFactor(factor)
      console.log('[handleCustomFactorSave] 新增自訂係數:', factor.name)
    }

    // 觸發重新渲染
    setRefreshKey(prev => prev + 1)
    onCustomFactorClose()

    toast({
      title: '自訂係數已儲存',
      description: `係數「${factor.name}」已成功建立`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  // 處理編輯組合係數
  const handleCompositeFactorEdit = (factor: any) => {
    setEditingComposite(factor)
    onCompositeOpen()
  }

  // 處理編輯自訂係數
  const handleCustomFactorEdit = (factor: any) => {
    // 從 factor.data 取得實際的 CustomFactor 資料
    const customFactorData = factor.data?.data || factor.data || factor
    setEditingCustomFactor(customFactorData as CustomFactor)
    onCustomFactorOpen()
  }

  // 處理阻止編輯已匯入係數
  const handleBlockEdit = (factor: any) => {
    setBlockedEditFactor(factor)
    setBlockEditDialogOpen(true)
  }

  // 處理從匯入對話框返回編輯
  const handleEditCompositeFromImport = (factor: any) => {
    console.log('[handleEditCompositeFromImport] 從匯入對話框返回編輯係數:', factor.name)
    // 設置編輯中的組合係數
    setEditingComposite(factor)
    // 打開編輯面板
    onCompositeOpen()

    // 顯示友善提示
    toast({
      title: '請完善必要資訊',
      description: '填寫完成後保存，即可重新匯入中央庫',
      status: 'info',
      duration: 5000,
      isClosable: true,
    })
  }

  // 處理從中央庫移除請求
  const handleRemoveFromCentralRequest = (factor: any) => {
    setFactorToRemove(factor)
    setRemoveFromCentralDialogOpen(true)
  }

  // 確認從中央庫移除
  const handleRemoveFromCentralConfirm = async () => {
    if (!factorToRemove) return

    try {
      const result = await removeFromCentral(factorToRemove)

      if (result.success) {
        toast({
          title: '移除成功',
          description: '係數已從中央庫移除，自建係數已恢復為未匯入狀態',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // 關閉對話框和詳情面板
        setRemoveFromCentralDialogOpen(false)
        setIsDetailPanelOpen(false)
        setSelectedFactor(null)
        setFactorToRemove(null)

        // 刷新列表
        refreshSelectedFactor()
      } else {
        toast({
          title: '移除失敗',
          description: result.error || '未知錯誤',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: '移除失敗',
        description: '請稍後重試',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // 前往中央庫並選中係數
  const handleNavigateToCentral = (factor: any) => {
    // 檢查是否為刷新請求
    if (factor?.refreshCentral) {
      // 刷新中央係數庫
      setCentralLibraryUpdateKey(prev => prev + 1)
      console.log('[handleNavigateToCentral] 觸發中央係數庫刷新')
      return
    }

    // 關閉阻止刪除對話框
    setBlockDeleteDialogOpen(false)

    // 切換到中央係數庫
    setSelectedNode({
      id: 'favorites',
      name: '中央係數庫',
      type: 'collection'
    })

    // 尋找對應的中央庫係數並選中
    setTimeout(() => {
      const centralFactors = mockData.getCentralLibraryFactors()
      const centralFactor = centralFactors.find(
        f => f.source_composite_id === factor.id
      )

      if (centralFactor) {
        setSelectedFactor(centralFactor)
        setIsDetailPanelOpen(true)

        toast({
          title: '已切換到中央係數庫',
          description: '請點擊「從中央係數庫移除」按鈕來移除係數',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: '找不到對應的中央庫係數',
          description: '此係數可能尚未匯入中央庫',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
    }, 100) // 小延遲確保節點切換完成
  }

  // 處理匯入中央庫
  const handleImportToCentral = (factor: any) => {
    console.log('[handleImportToCentral] 匯入係數到中央庫:', factor.name, 'type:', factor.type)
    setFactorToImport(factor)
    setImportToCentralModalOpen(true)
  }

  // 處理匯入中央庫確認
  const handleImportToCentralConfirm = async (formData: any) => {
    if (!factorToImport) return

    try {
      let result
      
      // 根據係數類型選擇不同的匯入函數
      if (factorToImport.type === 'custom_factor') {
        // 自訂係數
        result = importCustomFactorToCentral(factorToImport.id, formData)
      } else {
        // 組合係數（使用原有的匯入函數）
        // TODO: 實作組合係數匯入邏輯
        result = { success: false, message: '組合係數匯入尚未實作' }
      }

      if (result.success) {
        toast({
          title: '匯入成功',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // 關閉對話框並清空狀態
        setImportToCentralModalOpen(false)
        setFactorToImport(null)
        
        // 刷新相關數據
        refreshSelectedFactor()
        
      } else {
        toast({
          title: '匯入失敗',
          description: result.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: '匯入失敗',
        description: '發生未知錯誤',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error('[handleImportToCentralConfirm] 錯誤:', error)
    }
  }

  // 希達係數加入中央庫（無需彈窗，直接加入）
  const handleAddStandardToCentral = (factor: any) => {
    console.log('[handleAddStandardToCentral] 希達係數加入中央庫:', factor.name, 'ID:', factor.id)

    try {
      const result = addStandardFactorToCentral(factor.id)

      if (result.success) {
        toast({
          title: '加入成功',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // 刷新中央庫列表
        setRefreshKey(prev => prev + 1)
      } else {
        toast({
          title: '加入失敗',
          description: result.error || '無法加入中央係數庫',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('[handleAddStandardToCentral] 發生錯誤:', error)
      toast({
        title: '加入失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // 刷新當前選中係數的資料
  const refreshSelectedFactor = () => {
    if (selectedFactor && selectedFactor.id) {
      // 如果是自建係數，重新獲取最新資料
      if (selectedFactor.source_type === 'user_defined') {
        const updatedFactor = getUserDefinedCompositeFactorById(selectedFactor.id)
        if (updatedFactor) {
          console.log('[refreshSelectedFactor] 更新選中係數資料:', updatedFactor.name, updatedFactor.imported_to_central)
          setSelectedFactor(updatedFactor)
        }
      }
      // 如果是從中央庫移除的係數，需要刷新對應的自建係數
      else if (selectedFactor.source_composite_id) {
        const sourceId = selectedFactor.source_composite_id
        const updatedFactor = getUserDefinedCompositeFactorById(sourceId)
        if (updatedFactor) {
          console.log('[refreshSelectedFactor] 從中央庫移除後更新自建係數:', updatedFactor.name, 'imported_to_central =', updatedFactor.imported_to_central)
          // 不需要 setSelectedFactor，因為我們要刷新的是自建係數列表
        }
      }
    }
    // 觸發全局刷新
    setRefreshKey(prev => prev + 1)
    // 觸發中央庫刷新（匯入組合係數後需要更新中央庫）
    setCentralLibraryUpdateKey(prev => prev + 1)
  }

  // 處理公式建構器儲存
  const handleFormulaBuilderSave = (factorData: any) => {
    const newFactor = {
      id: Date.now(),
      type: 'formula_factor',
      name: factorData.name,
      value: factorData.value,
      unit: factorData.unit,
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      created_at: new Date().toISOString(),
      formula: factorData.formula,
      evaluationSteps: factorData.evaluationSteps,
      description: factorData.description
    }

    addUserDefinedCompositeFactor(newFactor)
    console.log('新增視覺化公式係數:', newFactor)

    // 觸發重新渲染
    setRefreshKey(prev => prev + 1)
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

  // 處理係數更新檢測結果（從希達係數庫觸發，在中央係數庫顯示）
  const handleUpdateDetected = (result: UpdateResult) => {
    setUpdateResult(result)
    setShowUpdateNotification(true)
    
    // 自動切換到中央係數庫以顯示通知
    if (selectedNode?.id !== 'favorites') {
      setSelectedNode({
        id: 'favorites',
        name: '中央係數庫',
        type: 'collection'
      })
    }
  }

  // 關閉更新通知
  const handleDismissNotification = () => {
    setShowUpdateNotification(false)
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
  // 打開係數選擇器 Modal（用於資料集新增係數）
  const handleOpenFactorSelector = () => {
    onFactorSelectorOpen()
  }

  // 處理批次加入係數到資料集
  const handleBatchAddToDataset = (selectedFactors: any[]) => {
    if (!currentDataset) {
      console.warn('沒有選中的資料集')
      return
    }

    // 提取選中係數的 ID
    const newFactorIds = selectedFactors.map(f => f.id)

    // 過濾掉已存在的係數 ID
    const uniqueNewIds = newFactorIds.filter(id => !currentDataset.factorIds.includes(id))

    if (uniqueNewIds.length === 0) {
      console.log('所有選中的係數都已存在於資料集中')
      return
    }

    // 更新資料集
    const updatedDataset = {
      ...currentDataset,
      factorIds: [...currentDataset.factorIds, ...uniqueNewIds],
      updated_at: new Date().toISOString()
    }

    setDatasets(prev =>
      prev.map(dataset =>
        dataset.id === currentDataset.id ? updatedDataset : dataset
      )
    )
    setCurrentDataset(updatedDataset)

    console.log(`批次加入 ${uniqueNewIds.length} 個係數到資料集:`, updatedDataset.name)

    // 關閉 Modal
    onFactorSelectorClose()
  }

  // 處理編輯自建係數
  const handleEditFactor = (updatedFactor: any) => {
    const existingFactor = getUserDefinedCompositeFactorById(updatedFactor.id)

    const updatedFactorWithTimestamp = {
      ...updatedFactor,
      updated_at: new Date().toISOString(),
      // 版本號 +1（使用 incrementVersion 函數）
      version: existingFactor ? incrementVersion(existingFactor.version || 'v1.0') : 'v1.0',
      // 保留匯入信息，但不更新 last_synced_version（因為還沒同步）
      imported_to_central: existingFactor?.imported_to_central || false,
      central_library_id: existingFactor?.central_library_id,
      imported_at: existingFactor?.imported_at,
      last_synced_at: existingFactor?.last_synced_at,
      last_synced_version: existingFactor?.last_synced_version,
    }

    updateUserDefinedCompositeFactor(updatedFactor.id, updatedFactorWithTimestamp)

    // 如果當前選中的是被編輯的係數，更新選中狀態
    if (selectedFactor && selectedFactor.id === updatedFactor.id) {
      setSelectedFactor(updatedFactorWithTimestamp)
    }

    // 觸發重新渲染
    setRefreshKey(prev => prev + 1)

    console.log('[handleEditFactor] 編輯自建係數:', updatedFactorWithTimestamp.name, updatedFactorWithTimestamp.version)
  }

  // 處理刪除自建係數請求
  const handleDeleteFactorRequest = (factor: any) => {
    setFactorToDelete(factor)
    onDeleteOpen()
  }

  // 檢查係數使用情況
  const getFactorUsageInfo = (factorId: number) => {
    // 檢查是否被其他組合係數使用
    const userDefinedFactors = getUserDefinedCompositeFactors()
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

      // 從全局狀態中移除係數
      deleteUserDefinedCompositeFactor(factorToDelete.id)

      // 如果當前選中的是被刪除的係數，清空選中狀態
      if (selectedFactor && selectedFactor.id === factorToDelete.id) {
        setSelectedFactor(null)
      }

      // 觸發重新渲染
      setRefreshKey(prev => prev + 1)
      
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

    // 如果是希達係數庫節點（原 global_search），改為 dataset 類型以支援批次勾選
    if (node.id === 'global_search') {
      return 'dataset'
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

    // 從 mockData 獲取所有係數
    const allFactors = mockData.getAllFactorItems()

    // 根據資料集的 factorIds 篩選出對應的真實係數
    return allFactors.filter(factor =>
      currentDataset.factorIds.includes(factor.id)
    )
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
              userDefinedFactors={(() => {
                const factors = getAllUserDefinedFactors()
                console.log('[SidebarTree] 傳遞自建係數數量:', factors.length)
                return factors
              })()}
              onOpenFormulaBuilder={onFormulaBuilderOpen}
              onOpenComposite={onCompositeOpen}
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
            {/* L4 供應商係數資料夾 */}
            {selectedNode?.id === 'supplier' && !selectedSupplierId && (
              <SupplierFolderPage
                onSupplierSelect={(supplierId) => setSelectedSupplierId(supplierId)}
              />
            )}

            {/* L4 供應商詳情頁面 */}
            {selectedNode?.id === 'supplier' && selectedSupplierId && (
              <SupplierDetailPage
                supplierId={selectedSupplierId}
                onBack={() => setSelectedSupplierId(null)}
              />
            )}

            {/* 其他節點類型顯示 FactorTable */}
            {selectedNode?.id !== 'supplier' && (
              <FactorTable
                key={`${centralLibraryUpdateKey}-${refreshKey}`}
                selectedNodeType={getTableNodeType(selectedNode)}
                selectedNode={selectedNode}
                onFactorSelect={handleFactorSelect}
                userDefinedFactors={(() => {
                  const factors = getAllUserDefinedFactors()
                  console.log('[FactorTable] 傳遞自建係數數量:', factors.length, '節點類型:', getTableNodeType(selectedNode))
                  return factors
                })()}
                onOpenComposite={onCompositeOpen}
                onEditComposite={handleEditCompositeFromImport}
                onEditCustomFactor={handleCustomFactorEdit}
                onOpenCustomFactor={onCustomFactorOpen}
                onBlockEdit={handleBlockEdit}
                datasetFactors={getDatasetFactors()}
                onRefreshSelectedFactor={refreshSelectedFactor}
                onOpenGlobalSearch={handleOpenFactorSelector}
                onNavigateToProduct={handleNavigateToProduct}
                onSyncL2Project={handleSyncL2Project}
                dataRefreshKey={centralLibraryUpdateKey + refreshKey}
                onNavigateToYear={handleNavigateToYear}
                onSyncL1Project={handleSyncL1Project}
                productSummaries={productSummaries}
                onImportProduct={handleImportProduct}
                onDeleteFactor={handleDeleteFactorRequest}
                onNavigateToCentral={handleNavigateToCentral}
                onUpdateDetected={handleUpdateDetected}
                updateResult={updateResult}
                showUpdateNotification={showUpdateNotification}
                onDismissNotification={handleDismissNotification}
              />
            )}
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
                onEditComposite={handleCompositeFactorEdit}
                onEditCustomFactor={handleCustomFactorEdit}
                onBlockEdit={handleBlockEdit}
                isUserDefinedFactor={selectedNode?.id === 'user_defined'}
                isCentralLibrary={selectedNode?.id === 'favorites'}
                onRemoveFromCentral={handleRemoveFromCentralRequest}
                onImportToCentral={handleImportToCentral}
                onAddStandardToCentral={handleAddStandardToCentral}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Modals & Drawers */}
      <CompositeEditorDrawer
        isOpen={isCompositeOpen}
        onClose={() => {
          setEditingComposite(null)
          onCompositeClose()
        }}
        onSave={handleCompositeFactorSave}
        editingFactor={editingComposite}
      />

      {/* 自訂係數 Drawer */}
      <CustomFactorDrawer
        isOpen={isCustomFactorOpen}
        onClose={() => {
          setEditingCustomFactor(null)
          onCustomFactorClose()
        }}
        onSave={handleCustomFactorSave}
        editingFactor={editingCustomFactor}
        onImportToCenter={(factor) => {
          // 轉換為 FactorTableItem 格式
          const tableItem = {
            id: factor.id,
            type: 'custom_factor',
            name: factor.name,
            value: factor.co2_factor || 0,
            unit: factor.co2_unit || '',
            year: new Date(factor.effective_date).getFullYear(),
            region: factor.region,
            method_gwp: factor.method_gwp,
            source_type: 'user_defined',
            source_ref: factor.source,
            version: factor.version,
            data: factor,
            effective_date: factor.effective_date,
            imported_to_central: factor.imported_to_central,
            central_library_id: factor.central_library_id,
            imported_at: factor.imported_at,
          } as any
          handleImportToCentral(tableItem)
          onCustomFactorClose()  // 關閉 Drawer
        }}
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

      {/* Factor Selector Modal */}
      <FactorSelectorModal
        isOpen={isFactorSelectorOpen}
        onClose={onFactorSelectorClose}
        onConfirm={handleBatchAddToDataset}
        centralFactors={mockData.getCentralLibraryFactors().map(f => ({
          id: f.id,
          type: 'emission_factor' as const,
          name: f.name,
          value: f.value,
          unit: f.unit,
          year: f.year,
          region: f.region || '台灣',
          method_gwp: f.method_gwp || 'GWP100',
          source_type: f.source_type || 'standard',
          source_ref: f.source_ref || 'ecoinvent',
          version: f.version,
          dataSource: 'local' as const
        }))}
        globalFactors={mockData.getAllFactorItems().map(f => ({
          id: f.id,
          type: 'emission_factor' as const,
          name: f.name,
          value: f.value,
          unit: f.unit,
          year: f.year,
          region: f.region || '台灣',
          method_gwp: f.method_gwp || 'GWP100',
          source_type: f.source_type || 'standard',
          source_ref: f.source_ref || 'ecoinvent',
          version: f.version,
          dataSource: 'global' as const
        }))}
        excludeIds={currentDataset?.factorIds || []}
      />

      {/* Formula Builder Modal */}
      <FormulaBuilderModal
        isOpen={isFormulaBuilderOpen}
        onClose={onFormulaBuilderClose}
        onSave={handleFormulaBuilderSave}
      />

      {/* Block Delete Imported Dialog */}
      <BlockDeleteImportedDialog
        isOpen={blockDeleteDialogOpen}
        onClose={() => setBlockDeleteDialogOpen(false)}
        factor={blockedFactor}
        onNavigateToCentral={handleNavigateToCentral}
      />

      {/* Block Edit Imported Dialog */}
      <BlockEditImportedDialog
        isOpen={blockEditDialogOpen}
        onClose={() => {
          setBlockEditDialogOpen(false)
          setBlockedEditFactor(null)
        }}
        factor={blockedEditFactor}
        onNavigateToCentral={handleNavigateToCentral}
      />

      {/* Remove From Central Dialog */}
      <RemoveFromCentralDialog
        isOpen={removeFromCentralDialogOpen}
        onClose={() => setRemoveFromCentralDialogOpen(false)}
        factor={factorToRemove}
        onConfirm={handleRemoveFromCentralConfirm}
      />

      {/* Import To Central Modal */}
      <ImportCompositeToCentralModal
        isOpen={importToCentralModalOpen}
        onClose={() => {
          setImportToCentralModalOpen(false)
          setFactorToImport(null)
        }}
        compositeFactor={factorToImport || {} as any}
        onConfirm={handleImportToCentralConfirm}
        onEditComposite={(factor) => {
          setImportToCentralModalOpen(false)
          if ('selected_ghgs' in factor) {
            // 自訂係數
            handleCustomFactorEdit({ data: factor })
          } else {
            // 組合係數
            handleEditCompositeFromImport(factor)
          }
        }}
      />
    </Box>
  )
}