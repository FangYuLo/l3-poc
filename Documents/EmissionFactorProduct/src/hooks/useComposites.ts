'use client'

import { useState, useCallback } from 'react'
import { CompositeFactorComponent, CreateCompositeFactorForm, FormulaType, ImportCompositeToCentralFormData } from '@/types/types'
import { calculateCompositeValue, validateCompositeComponents } from '@/lib/utils'
import { apiClient } from '@/lib/apiClient'
import {
  addImportedCompositeToCentral,
  removeFromCentralLibrary,
  ExtendedFactorTableItem,
  updateUserDefinedCompositeFactor
} from './useMockData'

export function useComposites() {
  const [components, setComponents] = useState<CompositeFactorComponent[]>([])
  const [formulaType, setFormulaType] = useState<FormulaType>('weighted')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addComponent = useCallback((component: Omit<CompositeFactorComponent, 'id' | 'composite_id'>) => {
    const newComponent: CompositeFactorComponent = {
      ...component,
      id: Date.now(), // Mock ID generation
      composite_id: 0, // Will be set when saving
    }
    setComponents(prev => [...prev, newComponent])
  }, [])

  const removeComponent = useCallback((componentId: number) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId))
  }, [])

  const updateComponent = useCallback((componentId: number, updates: Partial<CompositeFactorComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, ...updates } : comp
    ))
  }, [])

  const updateWeight = useCallback((componentId: number, weight: number) => {
    updateComponent(componentId, { weight })
  }, [updateComponent])

  const clearComponents = useCallback(() => {
    setComponents([])
  }, [])

  // 版本號遞增函數（方案一：每次編輯都遞增）
  const incrementVersion = useCallback((currentVersion: string): string => {
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
  }, [])

  const computedValue = calculateCompositeValue(
    components.map(comp => ({
      ef: comp.emission_factor!,
      weight: comp.weight
    })),
    formulaType
  )

  const validation = validateCompositeComponents(
    components.map(comp => ({
      ef: comp.emission_factor!,
      weight: comp.weight
    })),
    'kg CO2e/kg' // Default target unit
  )

  const saveCompositeFactor = async (form: CreateCompositeFactorForm) => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would call the API
      // const response = await apiClient.createCompositeFactor(form)
      
      // Mock implementation
      const mockResponse = {
        success: true,
        data: {
          id: Date.now(),
          name: form.name,
          formula_type: form.formula_type,
          computed_value: computedValue,
          unit: form.unit,
          description: form.description,
          version: 'v1.0',  // 新建時固定為 v1.0
          created_by: 'current_user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          components: form.components.map((comp, index) => ({
            id: index + 1,
            composite_id: Date.now(),
            ef_id: comp.ef_id,
            weight: comp.weight,
          })),
        }
      }
      
      setTimeout(() => {
        setIsLoading(false)
        clearComponents()
      }, 1000)

      return mockResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save composite factor'
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const updateCompositeFactor = async (
    factorId: number,
    form: CreateCompositeFactorForm,
    currentVersion: string = 'v1.0'  // 接收當前版本號
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // 計算新版本號
      const newVersion = incrementVersion(currentVersion)

      // In a real app, this would call the API
      // const response = await apiClient.updateCompositeFactor(factorId, form)

      // Mock implementation
      const mockResponse = {
        success: true,
        data: {
          id: factorId,
          name: form.name,
          formula_type: form.formula_type,
          computed_value: computedValue,
          unit: form.unit,
          description: form.description,
          version: newVersion,  // 加入新版本號
          created_by: 'current_user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          components: form.components.map((comp, index) => ({
            id: index + 1,
            composite_id: factorId,
            ef_id: comp.ef_id,
            weight: comp.weight,
          })),
        }
      }
      
      setTimeout(() => {
        setIsLoading(false)
        clearComponents()
      }, 1000)

      return mockResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update composite factor'
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const deleteCompositeFactor = async (factorId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would call the API
      // const response = await apiClient.deleteCompositeFactor(factorId)
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResponse = {
        success: true,
        message: 'Composite factor deleted successfully'
      }

      setIsLoading(false)
      return mockResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete composite factor'
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const loadCompositeFactorForEdit = (factor: any) => {
    // 清空現有組件
    clearComponents()
    
    // 設置公式類型
    setFormulaType(factor.formula_type || 'weighted')
    
    // 載入組件（如果有的話）
    if (factor.components && factor.components.length > 0) {
      factor.components.forEach((comp: any) => {
        addComponent({
          ef_id: comp.ef_id,
          weight: comp.weight,
          emission_factor: comp.emission_factor || {
            id: comp.ef_id,
            name: `係數 ${comp.ef_id}`,
            value: comp.value || 0,
            unit: comp.unit || 'kg CO2e/kg'
          }
        })
      })
    }
  }

  const getTotalWeight = useCallback(() => {
    return components.reduce((sum, comp) => sum + comp.weight, 0)
  }, [components])

  const getWeightError = useCallback(() => {
    if (formulaType !== 'weighted') return null
    const total = getTotalWeight()
    return Math.abs(total - 1) > 0.001 ? `權重總和應為 1.0，目前為 ${total.toFixed(3)}` : null
  }, [formulaType, getTotalWeight])

  const canSave = useCallback((name: string) => {
    return (
      name.trim().length > 0 &&
      components.length > 0 &&
      !getWeightError() &&
      validation.isValid
    )
  }, [components.length, getWeightError, validation.isValid])

  const importCompositeToCentral = async (
    compositeId: number,
    formData: ImportCompositeToCentralFormData,
    compositeData?: any
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would call the API
      // const response = await apiClient.importCompositeToCentral(compositeId, formData)

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 如果提供了組合係數數據，將其添加到中央庫
      if (compositeData) {
        const currentTime = new Date().toISOString()
        const centralLibraryId = Date.now()

        const centralFactor: ExtendedFactorTableItem = {
          id: centralLibraryId, // 使用新的中央庫 ID，不要與自建係數 ID 衝突
          type: 'composite_factor',
          name: compositeData.name,
          value: compositeData.value,
          unit: compositeData.unit,
          year: compositeData.year,
          region: compositeData.region,
          method_gwp: formData.method_gwp,
          source_type: 'user_defined',
          source_ref: formData.version || compositeData.version,
          version: formData.version || compositeData.version,
          data: {
            ...compositeData,
            applicable_categories: formData.applicable_categories,
            applicable_products: formData.applicable_products,
            applicable_regions: formData.applicable_regions,
            notes: formData.notes,
            imported_at: currentTime,
          },
          projectUsage: [],
          usageText: '從自建組合係數匯入',
          // 新增同步追蹤欄位（中央庫係數專用）
          source_composite_id: compositeData.id,           // 來源自建係數 ID
          source_version: compositeData.version,           // 來源係數版本
          synced_at: currentTime,                          // 同步時間
          synced_version: compositeData.version,           // 已同步版本
          // 注意：中央庫係數不需要 imported_to_central，因為它已經在中央庫中
          imported_at: compositeData.imported_to_central ? compositeData.imported_at : currentTime, // 首次匯入時間
          last_synced_at: currentTime,                     // 最後同步時間
          last_synced_version: compositeData.version,      // 最後同步版本
          formula_type: compositeData.formula_type,        // 計算方法
          components: compositeData.components,            // 組成係數
        }

        addImportedCompositeToCentral(centralFactor)

        // 更新自建係數的同步信息
        const updatedCompositeData = {
          ...compositeData,
          imported_to_central: true,
          central_library_id: centralLibraryId,
          imported_at: compositeData.imported_to_central ? compositeData.imported_at : currentTime, // 保留首次匯入時間
          last_synced_at: currentTime,
          last_synced_version: compositeData.version || 'v1.0',
        }

        updateUserDefinedCompositeFactor(compositeId, updatedCompositeData)
        console.log('[importCompositeToCentral] 更新自建係數同步信息:', updatedCompositeData.name)
      }

      const mockResponse = {
        success: true,
        message: 'Composite factor imported to central library successfully',
        data: {
          central_factor_id: compositeData?.central_library_id || Date.now(),
          composite_id: compositeId,
          imported_at: new Date().toISOString(),
        }
      }

      setIsLoading(false)
      return mockResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import composite factor'
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const removeFromCentral = useCallback(async (
    factor: any
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would call the API
      // const response = await apiClient.removeCompositeFromCentral(factor.id)

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 執行移除操作（傳遞完整的 factor 對象）
      const result = removeFromCentralLibrary(factor)

      if (!result.success) {
        setIsLoading(false)
        return {
          success: false,
          error: result.error || '移除失敗'
        }
      }

      setIsLoading(false)
      return {
        success: true,
        message: '已成功從中央係數庫移除'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '移除失敗'
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [])

  return {
    // State
    components,
    formulaType,
    isLoading,
    error,
    computedValue,
    validation,

    // Actions
    addComponent,
    removeComponent,
    updateComponent,
    updateWeight,
    clearComponents,
    setFormulaType,
    saveCompositeFactor,
    updateCompositeFactor,
    deleteCompositeFactor,
    loadCompositeFactorForEdit,
    importCompositeToCentral,
    removeFromCentral,

    // Computed
    getTotalWeight,
    getWeightError,
    canSave,
  }
}