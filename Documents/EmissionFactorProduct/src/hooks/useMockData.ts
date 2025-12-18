import { useMemo } from 'react'
import {
  EmissionFactor,
  CompositeFactor,
  FactorTableItem,
  SourceType,
  DataQuality,
  FactorUsageInfo,
  ProjectReference,
  CustomFactor
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

// 個別係數更新資訊
export interface FactorUpdateInfo {
  hasUpdate: boolean                  // 是否有可用更新
  updateType: 'major' | 'minor' | 'patch' // 更新類型
  newFactorId: number                 // 新版本係數的 ID
  newVersion: string                  // 新版本號
  currentVersion: string              // 當前版本號
  updateReason: string                // 更新原因說明
  riskLevel: 'high' | 'medium' | 'low' // 更新風險等級
  changePercentage?: number           // 數值變化百分比
  lastChecked: string                 // 最後檢查時間
  userAction: 'none' | 'viewed' | 'dismissed' | 'updated' // 用戶操作狀態
  publisherInfo?: {                   // 釋出單位資訊
    name: string
    databaseEvolution: string
  }
}

// 擴展 FactorTableItem 以包含引用資訊
export interface ExtendedFactorTableItem extends FactorTableItem {
  projectUsage?: ProjectUsage[]
  usageText?: string
  // 同步追蹤欄位（用於從自建係數匯入到中央庫的係數）
  source_composite_id?: number        // 來源自建係數 ID
  source_version?: string             // 來源係數版本
  synced_at?: string                  // 同步時間
  synced_version?: string             // 已同步版本
  imported_to_central?: boolean       // 標記為已匯入中央庫
  imported_at?: string                // 首次匯入時間
  last_synced_at?: string             // 最後同步時間
  last_synced_version?: string        // 最後同步版本
  formula_type?: 'weighted' | 'sum'   // 計算方法
  components?: any[]                  // 組成係數
  // 個別係數更新狀態
  updateInfo?: FactorUpdateInfo       // 更新狀態資訊
}

// 全局存儲匯入到中央庫的組合係數
let importedCompositeFactors: ExtendedFactorTableItem[] = []

// 全局存儲從中央庫移除的係數 ID 列表
let removedFromCentralIds: Set<number> = new Set()

// 全局存儲手動加入中央庫的希達係數 ID 列表
let addedToCentralIds: Set<number> = new Set()

// 自訂係數儲存（全局變數）
let customFactors: CustomFactor[] = []

/**
 * 添加匯入的組合係數到中央庫
 */
export function addImportedCompositeToCentral(factor: ExtendedFactorTableItem) {
  // 檢查是否已存在（避免重複匯入）
  const exists = importedCompositeFactors.some(f => f.id === factor.id)
  if (!exists) {
    importedCompositeFactors.push(factor)
  }
}

/**
 * 取得所有匯入的組合係數
 */
export function getImportedCompositeFactors(): ExtendedFactorTableItem[] {
  return importedCompositeFactors
}

/**
 * 將希達係數（標準排放係數）加入中央庫
 * 與自建係數不同，希達係數資料完整，無需彈出表單，直接加入即可
 */
export function addStandardFactorToCentral(factorId: number): {
  success: boolean
  message: string
  error?: string
} {
  try {
    console.log('[addStandardFactorToCentral] 將希達係數加入中央庫, factorId:', factorId)

    // 檢查係數是否已在中央庫
    if (addedToCentralIds.has(factorId) && !removedFromCentralIds.has(factorId)) {
      return {
        success: true,
        message: '此係數已在中央係數庫中'
      }
    }

    // 從移除列表中移除（如果存在）
    if (removedFromCentralIds.has(factorId)) {
      removedFromCentralIds.delete(factorId)
      console.log('[addStandardFactorToCentral] 從移除列表中移除係數ID:', factorId)
    }

    // 加入到中央庫列表
    addedToCentralIds.add(factorId)
    console.log('[addStandardFactorToCentral] 將係數ID加入中央庫:', factorId)
    console.log('[addStandardFactorToCentral] 當前中央庫係數IDs:', Array.from(addedToCentralIds))

    return {
      success: true,
      message: '已成功加入中央係數庫'
    }
  } catch (error) {
    console.error('[addStandardFactorToCentral] 加入失敗:', error)
    return {
      success: false,
      message: '加入中央係數庫失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }
  }
}

/**
 * 檢查希達係數是否已在中央庫
 * @param factorId 係數 ID
 * @returns true: 已在中央庫, false: 未在中央庫
 */
export function isStandardFactorInCentral(factorId: number): boolean {
  // 在手動加入列表中，且未被移除
  return addedToCentralIds.has(factorId) && !removedFromCentralIds.has(factorId)
}

/**
 * 批次檢查係數是否在中央庫
 * @param factorIds 係數 ID 列表
 * @returns Map<factorId, isInCentral>
 */
export function batchCheckFactorsInCentral(
  factorIds: number[]
): Map<number, boolean> {
  const result = new Map<number, boolean>()
  factorIds.forEach(id => {
    result.set(id, isStandardFactorInCentral(id))
  })
  return result
}

/**
 * 批次加入希達係數到中央庫
 * @param factorIds 係數 ID 列表
 * @returns 批次加入結果
 */
export function batchAddStandardFactorsToCentral(
  factorIds: number[]
): {
  success: boolean
  successCount: number
  failedCount: number
  errors: Array<{ factorId: number; error: string }>
} {
  const errors: Array<{ factorId: number; error: string }> = []
  let successCount = 0
  let failedCount = 0

  console.log('[batchAddStandardFactorsToCentral] 開始批次加入，數量:', factorIds.length)

  factorIds.forEach(factorId => {
    try {
      // 檢查係數是否已在中央庫
      if (addedToCentralIds.has(factorId) && !removedFromCentralIds.has(factorId)) {
        console.log('[batchAddStandardFactorsToCentral] 係數已在中央庫，跳過:', factorId)
        successCount++
        return
      }

      // 從移除列表中移除（如果存在）
      if (removedFromCentralIds.has(factorId)) {
        removedFromCentralIds.delete(factorId)
        console.log('[batchAddStandardFactorsToCentral] 從移除列表中移除係數ID:', factorId)
      }

      // 加入到中央庫列表
      addedToCentralIds.add(factorId)
      console.log('[batchAddStandardFactorsToCentral] 將係數ID加入中央庫:', factorId)
      successCount++
    } catch (error) {
      console.error('[batchAddStandardFactorsToCentral] 加入失敗:', factorId, error)
      errors.push({
        factorId,
        error: error instanceof Error ? error.message : '未知錯誤'
      })
      failedCount++
    }
  })

  console.log('[batchAddStandardFactorsToCentral] 批次加入完成:', {
    total: factorIds.length,
    success: successCount,
    failed: failedCount,
    currentRemovedIds: Array.from(removedFromCentralIds)
  })

  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    errors
  }
}

/**
 * 從中央庫移除係數（支持所有類型）
 */
export function removeFromCentralLibrary(
  factor: any
): {
  success: boolean
  sourceCompositeId?: number
  error?: string
} {
  try {
    console.log('[removeFromCentralLibrary] 開始移除係數:', {
      id: factor.id,
      name: factor.name,
      type: factor.type,
      source_composite_id: factor.source_composite_id,
      source_type: factor.source_type
    })

    // 情況 1: 從自建係數匯入的組合係數（在 importedCompositeFactors 中）
    if (factor.source_composite_id) {
      const sourceCompositeId = factor.source_composite_id
      const index = importedCompositeFactors.findIndex(f => f.id === factor.id)

      // 從中央庫陣列中移除（如果找到）
      if (index !== -1) {
        const centralFactor = importedCompositeFactors[index]
        importedCompositeFactors.splice(index, 1)
        console.log('[useMockData] 從中央庫移除組合係數:', centralFactor.name, '剩餘:', importedCompositeFactors.length)
      } else {
        console.log('[useMockData] 在 importedCompositeFactors 中找不到係數 ID:', factor.id, '但仍會更新自建係數狀態')
      }

      // 標記為已移除（雙重保障）
      removedFromCentralIds.add(factor.id)
      console.log('[useMockData] 將係數ID加入已移除列表:', factor.id)

      // 更新對應的自建係數狀態（無論是否在 importedCompositeFactors 中找到）
      console.log('[useMockData] 嘗試更新自建係數狀態，sourceCompositeId:', sourceCompositeId)
      
      // 先嘗試組合係數
      const sourceCompositeFactor = getUserDefinedCompositeFactorById(sourceCompositeId)
      if (sourceCompositeFactor) {
        console.log('[useMockData] 找到組合係數:', sourceCompositeFactor.name, '當前 imported_to_central:', sourceCompositeFactor.imported_to_central)
        updateUserDefinedCompositeFactor(sourceCompositeId, {
          ...sourceCompositeFactor,
          imported_to_central: false,
          central_library_id: undefined,
        })
        console.log('[useMockData] 更新組合係數狀態完成:', sourceCompositeFactor.name, 'imported_to_central = false')
      } else {
        // 嘗試自訂係數
        const sourceCustomFactor = getCustomFactorById(sourceCompositeId)
        if (sourceCustomFactor) {
          console.log('[useMockData] 找到自訂係數:', sourceCustomFactor.name, '當前 imported_to_central:', sourceCustomFactor.imported_to_central)
          updateCustomFactor(sourceCompositeId, {
            imported_to_central: false,
            central_library_id: undefined,
          })
          console.log('[useMockData] 更新自訂係數狀態完成:', sourceCustomFactor.name, 'imported_to_central = false')
        } else {
          console.log('[useMockData] 找不到自建係數（組合或自訂），sourceCompositeId:', sourceCompositeId)
        }
      }

      return {
        success: true,
        sourceCompositeId
      }
    }

    // 情況 2: 其他類型的係數（標準排放係數、產品碳足跡係數等）
    // 這些係數由專案使用或其他方式加入中央庫，移除它們只是從視圖中移除
    // 實際數據仍然存在，只是不再顯示在中央庫中
    console.log('[useMockData] 從中央庫移除其他類型係數:', factor.name, 'ID:', factor.id, 'Type:', factor.type)

    // 從手動加入列表中移除（如果存在）
    if (addedToCentralIds.has(factor.id)) {
      addedToCentralIds.delete(factor.id)
      console.log('[useMockData] 從手動加入列表中移除係數ID:', factor.id)
    }

    // 標記為已從中央庫移除
    removedFromCentralIds.add(factor.id)
    console.log('[useMockData] 已移除係數列表:', Array.from(removedFromCentralIds))

    return {
      success: true,
      error: undefined
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '移除失敗'
    }
  }
}

/**
 * 從中央庫移除匯入的組合係數（向後兼容）
 * @deprecated 使用 removeFromCentralLibrary 代替
 */
export function removeImportedCompositeFromCentral(
  centralFactorId: number
): {
  success: boolean
  sourceCompositeId?: number
  error?: string
} {
  // 轉發到新函數
  return removeFromCentralLibrary({ id: centralFactorId })
}

// 版本歷史記錄介面
export interface VersionHistoryEntry {
  version: string          // 版本號 (v1.0, v1.1, etc.)
  date: string            // 更新日期 ISO 8601 格式
  isCurrent: boolean      // 是否為當前版本
  changes?: string        // 變更摘要（選填）
  value?: number          // 該版本的計算值
  components?: any[]      // 該版本的組成係數快照
}

// 自建組合係數介面（帶同步追蹤）
export interface UserDefinedCompositeFactor {
  id: number
  name: string
  value: number
  unit: string
  type: 'composite_factor' | 'formula_factor'
  formulaType?: 'weighted' | 'sum'
  components?: any[]
  // 同步追蹤欄位
  imported_to_central: boolean      // 是否已匯入中央庫
  central_library_id?: number       // 中央庫中的 ID
  imported_at?: string              // 首次匯入時間
  last_synced_at?: string           // 最後同步時間
  version: string                   // 當前版本號（格式：v1.0, v1.1, v2.0）
  last_synced_version?: string      // 中央庫的版本號（格式：v1.0, v1.1, v2.0）
  version_history?: VersionHistoryEntry[]  // 版本歷史記錄
  // 其他欄位
  [key: string]: any
}

// 全局存儲自建組合係數
let userDefinedCompositeFactors: UserDefinedCompositeFactor[] = []

/**
 * 添加自建組合係數
 */
export function addUserDefinedCompositeFactor(factor: any) {
  const currentTime = new Date().toISOString()
  const version = factor.version || 'v1.0'

  const newFactor: UserDefinedCompositeFactor = {
    ...factor,
    imported_to_central: false,
    version,
    // 初始化版本歷史
    version_history: [
      {
        version,
        date: currentTime,
        isCurrent: true,
        changes: '首次建立',
        value: factor.value || factor.computed_value,
        components: factor.components ? JSON.parse(JSON.stringify(factor.components)) : []
      }
    ]
  }
  userDefinedCompositeFactors.push(newFactor)
  console.log('[useMockData] 添加自建組合係數:', newFactor.name, '版本:', newFactor.version, '目前總數:', userDefinedCompositeFactors.length)
}

/**
 * 更新自建組合係數
 */
export function updateUserDefinedCompositeFactor(id: number, factor: any) {
  const index = userDefinedCompositeFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    const oldFactor = userDefinedCompositeFactors[index]
    userDefinedCompositeFactors[index] = factor
    console.log('[updateUserDefinedCompositeFactor] 更新自建組合係數:', factor.name, {
      '更新前 imported_to_central': oldFactor.imported_to_central,
      '更新後 imported_to_central': factor.imported_to_central,
      '更新前 central_library_id': oldFactor.central_library_id,
      '更新後 central_library_id': factor.central_library_id
    })
    console.log('[updateUserDefinedCompositeFactor] 當前陣列中的係數:', userDefinedCompositeFactors[index].imported_to_central)
  } else {
    console.log('[updateUserDefinedCompositeFactor] 找不到 ID 為', id, '的係數')
  }
}

/**
 * 檢查係數是否可以刪除
 */
export function canDeleteCompositeFactor(factor: UserDefinedCompositeFactor): {
  canDelete: boolean
  reason?: string
  needAction?: 'remove_from_central'
} {
  // 檢查是否已匯入中央庫
  if (factor.imported_to_central) {
    return {
      canDelete: false,
      reason: '此係數已匯入中央庫，請先從中央庫移除後再刪除',
      needAction: 'remove_from_central'
    }
  }

  // 可以刪除
  return {
    canDelete: true
  }
}

/**
 * 刪除自建組合係數
 */
export function deleteUserDefinedCompositeFactor(id: number) {
  const index = userDefinedCompositeFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    const deleted = userDefinedCompositeFactors.splice(index, 1)
    console.log('[useMockData] 刪除自建組合係數:', deleted[0]?.name, '剩餘總數:', userDefinedCompositeFactors.length)
    return true
  }
  return false
}

/**
 * 刪除自建組合係數（帶保護檢查）
 */
export function deleteUserDefinedCompositeFactorSafe(id: number): {
  success: boolean
  error?: string
  reason?: string
} {
  const factor = getUserDefinedCompositeFactorById(id)

  if (!factor) {
    return {
      success: false,
      error: '找不到指定的係數'
    }
  }

  // 檢查是否可以刪除
  const checkResult = canDeleteCompositeFactor(factor)

  if (!checkResult.canDelete) {
    return {
      success: false,
      reason: checkResult.reason,
      error: 'blocked_by_import'
    }
  }

  // 執行刪除
  const deleted = deleteUserDefinedCompositeFactor(id)

  return {
    success: deleted
  }
}

/**
 * 取得所有自建組合係數
 */
export function getUserDefinedCompositeFactors(): any[] {
  console.log('[getUserDefinedCompositeFactors] 返回自建係數數量:', userDefinedCompositeFactors.length)
  if (userDefinedCompositeFactors.length > 0) {
    console.log('[getUserDefinedCompositeFactors] 第一個係數狀態:', {
      id: userDefinedCompositeFactors[0].id,
      name: userDefinedCompositeFactors[0].name,
      imported_to_central: userDefinedCompositeFactors[0].imported_to_central,
      central_library_id: userDefinedCompositeFactors[0].central_library_id
    })
  }
  return userDefinedCompositeFactors
}

/**
 * 根據 ID 取得自建組合係數
 */
export function getUserDefinedCompositeFactorById(id: number): UserDefinedCompositeFactor | undefined {
  return userDefinedCompositeFactors.find(f => f.id === id)
}

// ==================== 自訂係數管理函數 ====================

/**
 * 新增自訂係數
 */
export function addCustomFactor(factor: CustomFactor) {
  customFactors.push(factor)
  console.log('[addCustomFactor] 新增自訂係數:', factor.name)
}

/**
 * 更新自訂係數
 */
export function updateCustomFactor(id: number, updates: Partial<CustomFactor>) {
  const index = customFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    customFactors[index] = {
      ...customFactors[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    console.log('[updateCustomFactor] 更新自訂係數:', customFactors[index].name)
    return customFactors[index]
  }
  return null
}

/**
 * 檢查自訂係數是否可以刪除
 */
export function canDeleteCustomFactor(factor: CustomFactor): {
  canDelete: boolean
  reason?: string
} {
  // 檢查是否已匯入中央庫
  if (factor.imported_to_central) {
    return {
      canDelete: false,
      reason: '此係數已匯入中央庫，請先從中央庫移除後再刪除'
    }
  }

  return { canDelete: true }
}

/**
 * 安全刪除自訂係數（含保護機制）
 */
export function deleteCustomFactorSafe(id: number): {
  success: boolean
  error?: string
  reason?: string
} {
  const factor = customFactors.find(f => f.id === id)
  if (!factor) {
    return {
      success: false,
      error: 'factor_not_found',
      reason: '找不到指定的自訂係數'
    }
  }

  const checkResult = canDeleteCustomFactor(factor)
  if (!checkResult.canDelete) {
    return {
      success: false,
      reason: checkResult.reason,
      error: 'blocked_by_import'
    }
  }

  // 執行刪除
  const deleted = deleteCustomFactor(id)
  return {
    success: deleted,
    reason: deleted ? undefined : '刪除失敗'
  }
}

/**
 * 刪除自訂係數（內部使用）
 */
export function deleteCustomFactor(id: number) {
  const index = customFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    const deleted = customFactors.splice(index, 1)[0]
    console.log('[deleteCustomFactor] 刪除自訂係數:', deleted.name)
    return true
  }
  return false
}

/**
 * 取得所有自訂係數
 */
export function getCustomFactors(): CustomFactor[] {
  return customFactors
}

/**
 * 根據 ID 取得自訂係數
 */
export function getCustomFactorById(id: number): CustomFactor | undefined {
  return customFactors.find(f => f.id === id)
}

/**
 * 將自訂係數轉換為 FactorTableItem 格式
 */
function convertCustomFactorToTableItem(factor: CustomFactor): FactorTableItem {
  // 取得第一個 GHG 作為主要顯示值
  const firstGHG = factor.selected_ghgs[0]
  const ghgKey = firstGHG.toLowerCase()
  const mainValue = factor[`${ghgKey}_factor` as keyof CustomFactor] as number || 0
  const mainUnit = factor[`${ghgKey}_unit` as keyof CustomFactor] as string || ''

  return {
    id: factor.id,
    type: 'custom_factor' as const,
    name: factor.name,
    value: mainValue,
    unit: mainUnit,
    year: new Date(factor.effective_date).getFullYear(),
    region: factor.region,
    method_gwp: factor.method_gwp,
    source_type: 'user_defined' as const,
    source_ref: factor.source,
    version: factor.version,
    data: factor,
    effective_date: factor.effective_date, // 重要：複製 effective_date 到頂層
    imported_to_central: factor.imported_to_central,
    central_library_id: factor.central_library_id,
    imported_at: factor.imported_at,
  }
}

/**
 * 將自訂係數匯入中央庫
 */
export function importCustomFactorToCentral(
  factorId: number, 
  importData: {
    factor_name: string
    description: string
    factor_value: number
    unit: string
    isic_categories: string[]
    geographic_scope: string
    lifecycle_stages: string[]
    data_quality: 'Secondary' | 'Primary'
    valid_from?: string
    composition_notes?: string
    system_boundary_detail?: string
  }
): { success: boolean, message: string, centralLibraryId?: string } {
  try {
    console.log('[importCustomFactorToCentral] 匯入自訂係數到中央庫, factorId:', factorId)
    
    // 找到目標自訂係數
    const factor = customFactors.find(f => f.id === factorId)
    if (!factor) {
      return {
        success: false,
        message: '找不到指定的自訂係數'
      }
    }

    // 檢查是否已匯入
    if (factor.imported_to_central) {
      return {
        success: false,
        message: '此係數已經匯入中央庫'
      }
    }

    // 生成中央庫 ID
    const centralLibraryId = Date.now() + factorId  // 使用數字格式
    
    // 更新自訂係數的匯入狀態
    const updatedFactor = updateCustomFactor(factorId, {
      imported_to_central: true,
      central_library_id: centralLibraryId,
      imported_at: new Date().toISOString()
    })

    if (!updatedFactor) {
      return {
        success: false,
        message: '更新自訂係數狀態失敗'
      }
    }

    // 將自訂係數轉換為中央庫格式並加入匯入列表
    const centralFactor: ExtendedFactorTableItem = {
      ...convertCustomFactorToTableItem(updatedFactor),
      // 新增中央庫相關資訊
      central_library_id: centralLibraryId,
      imported_to_central: true,
      imported_at: updatedFactor.imported_at,
      source_composite_id: factorId, // 記錄來源自訂係數 ID
      source_version: updatedFactor.version,
    } as ExtendedFactorTableItem & {
      // 中央庫的額外資訊（不在型別中但實際存在）
      isic_categories: string[]
      geographic_scope: string
      lifecycle_stages: string[]
      data_quality: string
      composition_notes?: string
      system_boundary_detail?: string
    }
    
    // 加入額外資訊
    ;(centralFactor as any).isic_categories = importData.isic_categories
    ;(centralFactor as any).geographic_scope = importData.geographic_scope
    ;(centralFactor as any).lifecycle_stages = importData.lifecycle_stages
    ;(centralFactor as any).data_quality = importData.data_quality
    ;(centralFactor as any).composition_notes = importData.composition_notes
    ;(centralFactor as any).system_boundary_detail = importData.system_boundary_detail

    // 加入中央庫匯入列表
    addImportedCompositeToCentral(centralFactor)

    return {
      success: true,
      message: `自訂係數「${factor.name}」已成功匯入中央庫`,
      centralLibraryId: centralLibraryId.toString()  // 回傳字串格式供顯示
    }
  } catch (error) {
    console.error('[importCustomFactorToCentral] 匯入失敗:', error)
    return {
      success: false,
      message: '匯入過程發生錯誤'
    }
  }
}

/**
 * 取得所有自建係數（組合係數 + 自訂係數）
 */
export function getAllUserDefinedFactors() {
  const compositeFactors = getUserDefinedCompositeFactors()
  const custom = getCustomFactors()

  return [
    ...compositeFactors,
    ...custom.map(convertCustomFactorToTableItem)
  ]
}

/**
 * 版本號比較函數
 * @returns 0: 相等, >0: v1 > v2, <0: v1 < v2
 */
export function compareVersions(v1: string, v2: string): number {
  // 解析版本號 "v1.2" → [1, 2]
  const parse = (v: string): [number, number] => {
    const match = v.match(/^v?(\d+)\.(\d+)$/)
    if (!match) return [1, 0]  // 預設為 v1.0
    return [parseInt(match[1]), parseInt(match[2])]
  }

  const [major1, minor1] = parse(v1)
  const [major2, minor2] = parse(v2)

  if (major1 !== major2) return major1 - major2
  return minor1 - minor2
}

/**
 * 同步狀態類型
 */
export type SyncStatus =
  | 'not_imported'      // 尚未匯入
  | 'synced'            // 已同步
  | 'needs_sync'        // 需要同步
  | 'sync_error'        // 同步錯誤

/**
 * 取得係數同步狀態
 */
export function getSyncStatus(factor: UserDefinedCompositeFactor): SyncStatus {
  // 未匯入
  if (!factor.imported_to_central) {
    return 'not_imported'
  }

  // 檢查版本號
  const currentVersion = factor.version || 'v1.0'
  const syncedVersion = factor.last_synced_version || 'v1.0'

  // 版本號比較
  if (compareVersions(currentVersion, syncedVersion) > 0) {
    return 'needs_sync'  // 當前版本 > 已同步版本
  }

  return 'synced'  // 已同步
}

/**
 * 檢查係數是否需要同步（向後兼容）
 */
export function checkIfNeedsSync(factor: UserDefinedCompositeFactor): boolean {
  return getSyncStatus(factor) === 'needs_sync'
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

  // 不使用 useMemo，每次都動態計算以確保能讀取最新的自建係數狀態
  const allCompositeFactorItems = getUserDefinedCompositeFactors().map(convertCompositeToTableItem)

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

  // 計算係數使用情況（每次都重新計算以確保資料最新）
  const factorUsageMap = calculateFactorUsage()

  // 中央係數庫資料（不使用 useMemo 以確保能讀取新增的係數）
  const centralLibraryFactors = (): ExtendedFactorTableItem[] => {
    console.log('[getCentralLibraryFactors] 開始獲取中央庫係數...')
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

    // 加入匯入的組合係數
    const importedComposites = getImportedCompositeFactors()

    // 加入手動從希達係數庫加入的標準係數
    const manuallyAddedFactors = allEmissionFactorItems
      .filter(item => addedToCentralIds.has(item.id))
      .map(item => ({
        ...item,
        projectUsage: usageMap.get(item.id) || [],
        usageText: usageMap.get(item.id)?.length
          ? formatProjectUsage(usageMap.get(item.id) || [])
          : '未被引用'
      }))

    // 合併五種係數（去重）
    const allCentralItemsMap = new Map<number, ExtendedFactorTableItem>()

    // 先加入使用過的係數
    usedFactorItems.forEach(item => allCentralItemsMap.set(item.id, item))

    // 再加入產品碳足跡係數（來自 mockProductFootprintFactors）
    productFootprintItems.forEach(item => allCentralItemsMap.set(item.id, item))

    // 加入匯入的產品碳足跡係數（新增的）
    importedProductFactors.forEach(item => allCentralItemsMap.set(item.id, item))

    // 加入匯入的組合係數
    importedComposites.forEach(item => allCentralItemsMap.set(item.id, item))

    // 加入手動添加的希達係數
    manuallyAddedFactors.forEach(item => allCentralItemsMap.set(item.id, item))

    console.log('[getCentralLibraryFactors] 匯入的組合係數數量:', importedComposites.length)
    console.log('[getCentralLibraryFactors] 已移除的係數IDs:', Array.from(removedFromCentralIds))

    // 過濾掉已從中央庫移除的係數
    const allCentralItems = Array.from(allCentralItemsMap.values())
      .filter(item => {
        const shouldRemove = removedFromCentralIds.has(item.id)
        if (shouldRemove) {
          console.log('[getCentralLibraryFactors] 過濾掉係數:', item.id, item.name)
        }
        return !shouldRemove
      })

    console.log('[getCentralLibraryFactors] 最終中央庫係數數量:', allCentralItems.length)

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
    getCentralLibraryFactors: (): ExtendedFactorTableItem[] => centralLibraryFactors(),

    // === 批次匯入功能 ===

    /**
     * 檢查希達係數是否已在中央庫
     */
    isStandardFactorInCentral,

    /**
     * 批次檢查係數是否在中央庫
     */
    batchCheckFactorsInCentral,

    /**
     * 批次加入希達係數到中央庫
     */
    batchAddStandardFactorsToCentral,

    /**
     * 加入希達係數到中央庫
     */
    addStandardFactorToCentral,

    // === Resource_8 係數更新相關功能 ===

    /**
     * 檢測新係數的母資料源關聯
     */
    detectRelatedFactors: (newFactors: EmissionFactor[]): RelatedFactorInfo[] => {
      return detectRelatedFactors(newFactors)
    },

    /**
     * 取得所有新增係數
     */
    getNewResource8Factors: (): EmissionFactor[] => {
      return getNewResource8Factors()
    },

    /**
     * 模擬更新係數庫
     */
    simulateUpdateFactorDatabase: (): UpdateResult => {
      return simulateUpdateFactorDatabase()
    },

    /**
     * 真實匯入相關係數到中央係數庫
     */
    importRelatedFactorsToCentral: (factorIds: number[]) => {
      return importRelatedFactorsToCentral(factorIds)
    },

    // === 個別係數更新檢測功能 ===

    /**
     * 檢測單一係數是否有可用更新
     */
    checkIndividualFactorUpdate: (factorId: number): FactorUpdateInfo | null => {
      return checkIndividualFactorUpdate(factorId)
    },

    /**
     * 批次檢測係數更新狀態
     */
    checkAllFactorsForUpdates: (factorIds: number[]): Map<number, FactorUpdateInfo> => {
      return checkAllFactorsForUpdates(factorIds)
    }
  }
}

// ============================================================================
// Resource_8 係數更新相關功能
// ============================================================================

/**
 * 新係數關聯資訊
 */
export interface RelatedFactorInfo {
  newFactorId: number
  newFactorName: string
  newFactorSource: string
  relatedFactorId: number
  relatedFactorName: string
  relatedFactorSource: string
  relationshipType: 'parent_source' | 'source_family'
  
  // 母資料源詳細資訊
  motherSourceInfo: {
    name: string
    value: number
    unit: string
    version: string
    year: number
    database: string  // Resource_1
    source_ref: string
  }
  
  // 新資料源詳細資訊
  newSourceInfo: {
    name: string
    value: number
    unit: string
    version: string
    year: number
    database: string  // Resource_8
    source_ref: string
  }
  
  // 釋出單位資訊
  publisher: {
    name: string
    databaseEvolution: string  // "Resource_1 → Resource_8"
  }
  
  // 保留原有對比數據（簡化版）
  comparisonData: {
    newValue: number
    oldValue: number
    unit: string
  }
}

/**
 * 更新結果
 */
export interface UpdateResult {
  totalNewFactors: number
  relatedFactorsCount: number
  unrelatedFactorsCount: number
  relatedFactors: RelatedFactorInfo[]
}

/**
 * 檢測新係數的母資料源關聯
 * 只返回有關聯關係的新係數
 */
export function detectRelatedFactors(newFactors: EmissionFactor[]): RelatedFactorInfo[] {
  const existingFactors = getAllEmissionFactors()
  const relatedFactors: RelatedFactorInfo[] = []

  // 釋出單位映射
  const publisherMap: Record<string, { name: string, databaseEvolution: string }> = {
    'Taiwan-EPA-Electricity': { 
      name: '台灣環保署', 
      databaseEvolution: 'Resource_1 → Resource_8' 
    },
    'USA-EPA-Electricity': { 
      name: '美國EPA', 
      databaseEvolution: 'Resource_1 → Resource_8' 
    },
    'China-NDRC-Electricity': { 
      name: '中國國家發改委', 
      databaseEvolution: 'Resource_1 → Resource_8' 
    }
  }

  newFactors.forEach(newFactor => {
    // 檢查母資料源關聯 (parent_source)
    if (newFactor.parent_source) {
      const parentFactor = existingFactors.find(f => f.source_ref === newFactor.parent_source)
      if (parentFactor) {
        const publisher = publisherMap[newFactor.source_family || ''] || {
          name: '未知釋出單位',
          databaseEvolution: 'Resource_1 → Resource_8'
        }

        relatedFactors.push({
          newFactorId: newFactor.id,
          newFactorName: newFactor.name,
          newFactorSource: newFactor.source,
          relatedFactorId: parentFactor.id,
          relatedFactorName: parentFactor.name,
          relatedFactorSource: parentFactor.source,
          relationshipType: 'parent_source',
          
          // 母資料源詳細資訊
          motherSourceInfo: {
            name: parentFactor.name,
            value: parentFactor.value,
            unit: parentFactor.unit,
            version: parentFactor.version,
            year: parentFactor.year || new Date(parentFactor.effective_date).getFullYear(),
            database: 'Resource_1',
            source_ref: parentFactor.source_ref || ''
          },
          
          // 新資料源詳細資訊
          newSourceInfo: {
            name: newFactor.name,
            value: newFactor.value,
            unit: newFactor.unit,
            version: newFactor.version,
            year: newFactor.year || new Date(newFactor.effective_date).getFullYear(),
            database: 'Resource_8',
            source_ref: newFactor.source_ref || ''
          },
          
          // 釋出單位資訊
          publisher,
          
          // 簡化的對比數據
          comparisonData: {
            newValue: newFactor.value,
            oldValue: parentFactor.value,
            unit: newFactor.unit
          }
        })
      }
    }

    // 檢查資料源家族關聯 (source_family)
    if (newFactor.source_family && !newFactor.parent_source) {
      const familyFactors = existingFactors.filter(f => 
        f.source_family === newFactor.source_family && 
        f.id !== newFactor.id &&
        f.version_sequence && newFactor.version_sequence &&
        f.version_sequence < newFactor.version_sequence
      )

      // 找到版本序列最高的相關係數
      const latestFamilyFactor = familyFactors.reduce((latest, current) => {
        return (current.version_sequence || 0) > (latest.version_sequence || 0) ? current : latest
      }, familyFactors[0])

      if (latestFamilyFactor) {
        const publisher = publisherMap[newFactor.source_family || ''] || {
          name: '未知釋出單位',
          databaseEvolution: 'Resource_1 → Resource_8'
        }

        relatedFactors.push({
          newFactorId: newFactor.id,
          newFactorName: newFactor.name,
          newFactorSource: newFactor.source,
          relatedFactorId: latestFamilyFactor.id,
          relatedFactorName: latestFamilyFactor.name,
          relatedFactorSource: latestFamilyFactor.source,
          relationshipType: 'source_family',
          
          // 母資料源詳細資訊
          motherSourceInfo: {
            name: latestFamilyFactor.name,
            value: latestFamilyFactor.value,
            unit: latestFamilyFactor.unit,
            version: latestFamilyFactor.version,
            year: latestFamilyFactor.year || new Date(latestFamilyFactor.effective_date).getFullYear(),
            database: 'Resource_1',
            source_ref: latestFamilyFactor.source_ref || ''
          },
          
          // 新資料源詳細資訊
          newSourceInfo: {
            name: newFactor.name,
            value: newFactor.value,
            unit: newFactor.unit,
            version: newFactor.version,
            year: newFactor.year || new Date(newFactor.effective_date).getFullYear(),
            database: 'Resource_8',
            source_ref: newFactor.source_ref || ''
          },
          
          // 釋出單位資訊
          publisher,
          
          // 簡化的對比數據
          comparisonData: {
            newValue: newFactor.value,
            oldValue: latestFamilyFactor.value,
            unit: newFactor.unit
          }
        })
      }
    }
  })

  return relatedFactors
}

/**
 * 取得所有新增的 Resource_8 係數
 */
export function getNewResource8Factors(): EmissionFactor[] {
  const allFactors = getAllEmissionFactors()
  return allFactors.filter(factor => 
    factor.source.startsWith('Resource_8') && 
    factor.id >= 101  // Resource_8 係數的 ID 從 101 開始
  )
}

/**
 * 真實匯入相關係數到中央係數庫
 */
export function importRelatedFactorsToCentral(factorIds: number[]): {
  success: boolean
  importedCount: number
  message: string
} {
  try {
    // 檢查哪些係數尚未在中央庫中（使用 addedToCentralIds 而不是 favoriteFactorIds）
    const newFactorIds = factorIds.filter(id => !addedToCentralIds.has(id) || removedFromCentralIds.has(id))
    
    if (newFactorIds.length === 0) {
      return {
        success: true,
        importedCount: 0,
        message: '所選係數已在中央係數庫中'
      }
    }
    
    // 將新係數ID加入中央係數庫（使用 addedToCentralIds）
    newFactorIds.forEach(id => {
      addedToCentralIds.add(id)
      // 從移除列表中移除（如果之前被移除過）
      if (removedFromCentralIds.has(id)) {
        removedFromCentralIds.delete(id)
      }
    })
    
    console.log('[importRelatedFactorsToCentral] 新增係數ID到中央庫:', newFactorIds)
    console.log('[importRelatedFactorsToCentral] 中央庫現有係數數量:', addedToCentralIds.size)
    
    return {
      success: true,
      importedCount: newFactorIds.length,
      message: `成功匯入 ${newFactorIds.length} 筆係數到中央庫`
    }
  } catch (error) {
    console.error('[importRelatedFactorsToCentral] 匯入失敗:', error)
    return {
      success: false,
      importedCount: 0,
      message: '匯入過程中發生錯誤'
    }
  }
}

/**
 * 模擬更新係數庫操作
 */
export function simulateUpdateFactorDatabase(): UpdateResult {
  const newFactors = getNewResource8Factors()
  const relatedFactors = detectRelatedFactors(newFactors)
  
  console.log('[simulateUpdateFactorDatabase] 發現新係數:', newFactors.length, '筆')
  console.log('[simulateUpdateFactorDatabase] 具有關聯性新係數:', relatedFactors.length, '筆')
  
  return {
    totalNewFactors: newFactors.length,
    relatedFactorsCount: relatedFactors.length,
    unrelatedFactorsCount: newFactors.length - relatedFactors.length,
    relatedFactors
  }
}

// ============================================================================
// 個別係數更新檢測功能
// ============================================================================

/**
 * 檢測單一係數是否有可用更新
 * @param factorId 要檢測的係數 ID
 * @returns 更新資訊，如果沒有更新則返回 null
 */
export function checkIndividualFactorUpdate(factorId: number): FactorUpdateInfo | null {
  try {
    const allFactors = getAllEmissionFactors()
    const currentFactor = allFactors.find(f => f.id === factorId)
    
    if (!currentFactor) {
      console.log('[checkIndividualFactorUpdate] 找不到係數 ID:', factorId)
      return null
    }
    
    // 檢查是否有對應的新版本係數
    const newFactors = getNewResource8Factors()
    let updateCandidate: EmissionFactor | null = null
    
    // 1. 優先檢查母資料源關聯 (parent_source)
    if (currentFactor.source_ref) {
      updateCandidate = newFactors.find(newFactor => 
        newFactor.parent_source === currentFactor.source_ref
      ) || null
    }
    
    // 2. 如果沒有找到，檢查資料源家族關聯 (source_family)
    if (!updateCandidate && currentFactor.source_family) {
      const familyCandidates = newFactors.filter(newFactor =>
        newFactor.source_family === currentFactor.source_family &&
        newFactor.version_sequence && currentFactor.version_sequence &&
        newFactor.version_sequence > currentFactor.version_sequence
      )
      
      // 選擇版本序列最新的候選項
      if (familyCandidates.length > 0) {
        updateCandidate = familyCandidates.reduce((latest, current) => 
          (current.version_sequence || 0) > (latest.version_sequence || 0) ? current : latest
        )
      }
    }
    
    if (!updateCandidate) {
      return null
    }
    
    // 計算更新資訊
    const changePercentage = calculateChangePercentage(currentFactor.value, updateCandidate.value)
    const updateType = determineUpdateType(changePercentage, currentFactor.version, updateCandidate.version)
    const riskLevel = assessUpdateRisk(updateType, changePercentage)
    
    // 釋出單位映射
    const publisherMap: Record<string, { name: string, databaseEvolution: string }> = {
      'Taiwan-EPA-Electricity': { 
        name: '台灣環保署', 
        databaseEvolution: 'Resource_1 → Resource_8' 
      },
      'USA-EPA-Electricity': { 
        name: '美國EPA', 
        databaseEvolution: 'Resource_1 → Resource_8' 
      },
      'China-NDRC-Electricity': { 
        name: '中國國家發改委', 
        databaseEvolution: 'Resource_1 → Resource_8' 
      }
    }
    
    const publisherInfo = publisherMap[updateCandidate.source_family || ''] || {
      name: '未知釋出單位',
      databaseEvolution: 'Resource_1 → Resource_8'
    }
    
    const updateInfo: FactorUpdateInfo = {
      hasUpdate: true,
      updateType,
      newFactorId: updateCandidate.id,
      newVersion: updateCandidate.version,
      currentVersion: currentFactor.version,
      updateReason: generateUpdateReason(updateType, changePercentage),
      riskLevel,
      changePercentage,
      lastChecked: new Date().toISOString(),
      userAction: 'none',
      publisherInfo
    }
    
    console.log('[checkIndividualFactorUpdate] 發現係數更新:', {
      factorId,
      factorName: currentFactor.name,
      updateType,
      changePercentage: changePercentage.toFixed(2) + '%'
    })
    
    return updateInfo
    
  } catch (error) {
    console.error('[checkIndividualFactorUpdate] 檢測失敗:', error)
    return null
  }
}

/**
 * 批次檢測係數更新狀態
 * @param factorIds 要檢測的係數 ID 列表
 * @returns 係數 ID 到更新資訊的映射
 */
export function checkAllFactorsForUpdates(factorIds: number[]): Map<number, FactorUpdateInfo> {
  const updateMap = new Map<number, FactorUpdateInfo>()
  
  console.log('[checkAllFactorsForUpdates] 開始檢測', factorIds.length, '個係數的更新狀態')
  
  factorIds.forEach(factorId => {
    const updateInfo = checkIndividualFactorUpdate(factorId)
    if (updateInfo) {
      updateMap.set(factorId, updateInfo)
    }
  })
  
  console.log('[checkAllFactorsForUpdates] 發現', updateMap.size, '個係數有可用更新')
  
  return updateMap
}

/**
 * 計算數值變化百分比
 */
function calculateChangePercentage(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * 判斷更新類型
 */
function determineUpdateType(
  changePercentage: number, 
  _currentVersion: string, 
  _newVersion: string
): 'major' | 'minor' | 'patch' {
  // 根據變化幅度判斷更新類型（未來可結合版本號邏輯）
  const absChange = Math.abs(changePercentage)
  
  if (absChange > 20) {
    return 'major'  // 變化超過 20% 視為重大更新
  } else if (absChange > 5) {
    return 'minor'  // 變化 5-20% 視為小版本更新
  } else {
    return 'patch'  // 變化小於 5% 視為修補更新
  }
}

/**
 * 評估更新風險等級
 */
function assessUpdateRisk(
  updateType: 'major' | 'minor' | 'patch', 
  changePercentage: number
): 'high' | 'medium' | 'low' {
  const absChange = Math.abs(changePercentage)
  
  if (updateType === 'major' || absChange > 15) {
    return 'high'
  } else if (updateType === 'minor' || absChange > 5) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * 生成更新原因說明
 */
function generateUpdateReason(updateType: 'major' | 'minor' | 'patch', changePercentage: number): string {
  const absChange = Math.abs(changePercentage)
  const direction = changePercentage > 0 ? '上升' : '下降'
  
  const reasons = {
    major: `排放係數${direction} ${absChange.toFixed(1)}%，建議評估對計算結果的影響`,
    minor: `排放係數${direction} ${absChange.toFixed(1)}%，係數輕微調整`,
    patch: `排放係數${direction} ${absChange.toFixed(1)}%，技術性修正`
  }
  
  return reasons[updateType]
}