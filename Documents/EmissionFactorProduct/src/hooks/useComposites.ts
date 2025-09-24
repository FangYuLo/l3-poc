'use client'

import { useState, useCallback } from 'react'
import { CompositeFactorComponent, CreateCompositeFactorForm, FormulaType } from '@/types/types'
import { calculateCompositeValue, validateCompositeComponents } from '@/lib/utils'
import { apiClient } from '@/lib/apiClient'

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

  const updateCompositeFactor = async (factorId: number, form: CreateCompositeFactorForm) => {
    try {
      setIsLoading(true)
      setError(null)

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
    
    // Computed
    getTotalWeight,
    getWeightError,
    canSave,
  }
}