'use client'

import { useState, useEffect } from 'react'
import { FactorTableItem, SearchFilters, PaginationParams } from '@/types/types'
import { emissionFactorToTableItem, compositeFactorToTableItem } from '@/lib/utils'
import { apiClient } from '@/lib/apiClient'
import { useMockData } from '@/hooks/useMockData'

interface UseFactorsOptions {
  collectionId?: string
  projectId?: number
  emissionSourceId?: number
  nodeId?: string // 新增：樹狀節點ID
  filters?: Partial<SearchFilters>
  refreshKey?: number // 新增：用於強制刷新的 key
}

export function useFactors(options: UseFactorsOptions = {}) {
  const [factors, setFactors] = useState<FactorTableItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 使用統一的資料管理
  const mockData = useMockData()

  // Mock data for demonstration
  const mockFactors: FactorTableItem[] = [
    {
      id: 1,
      type: 'emission_factor',
      name: '天然氣燃燒 - 工業用',
      value: 2.0322,
      unit: 'kg CO2e/m³',
      year: 2023,
      region: 'Taiwan',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'EPA 2023',
      version: '2.1',
      data: {
        id: 1,
        source: 'Taiwan - EPA 2023',
        name: '天然氣燃燒 - 工業用',
        effective_date: '2023-01-01',
        continent: '亞洲',
        country: '台灣',
        region: 'Taiwan',
        co2_factor: 2.0322,
        co2_unit: 'kg CO2/m³',
        ch4_factor: 0.000032,
        ch4_unit: 'kg CH4/m³',
        n2o_factor: 0.0000064,
        n2o_unit: 'kg N2O/m³',
        value: 2.0322,
        unit: 'kg CO2e/m³',
        year: 2023,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: 'EPA 2023',
        version: '2.1',
        description: '工業用天然氣燃燒產生的溫室氣體排放係數',
        created_at: '2023-12-01T08:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      }
    },
    {
      id: 2,
      type: 'emission_factor',
      name: '電力網格 - 台灣電力公司',
      value: 0.509,
      unit: 'kg CO2e/kWh',
      year: 2023,
      region: 'Taiwan',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'TPC 2023',
      version: '1.0',
      data: {
        id: 2,
        source: 'Taiwan - TPC 2023',
        name: '電力網格 - 台灣電力公司',
        effective_date: '2023-01-01',
        continent: '亞洲',
        country: '台灣',
        region: 'Taiwan',
        co2_factor: 0.509,
        co2_unit: 'kg CO2/kWh',
        ch4_factor: 0.0000087,
        ch4_unit: 'kg CH4/kWh',
        n2o_factor: 0.0000017,
        n2o_unit: 'kg N2O/kWh',
        value: 0.509,
        unit: 'kg CO2e/kWh',
        year: 2023,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: 'TPC 2023',
        version: '1.0',
        description: '台灣電力公司電力網格排放係數',
        created_at: '2023-11-01T08:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }
    },
    {
      id: 3,
      type: 'composite_factor',
      name: '鋼材生產組合係數',
      value: 1.85,
      unit: 'kg CO2e/kg',
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      data: {
        id: 3,
        name: '鋼材生產組合係數',
        formula_type: 'weighted' as const,
        computed_value: 1.85,
        unit: 'kg CO2e/kg',
        description: '鋼材生產過程的組合排放係數',
        created_by: 'user',
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-10T08:00:00Z',
        components: [],
      }
    },
  ]

  const loadFactors = async (params: {
    page?: number
    pageSize?: number
    filters?: Partial<SearchFilters>
  } = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const currentPage = params.page || page
      const currentPageSize = params.pageSize || pageSize
      
      // In a real app, this would call the actual API
      // const response = await apiClient.getEmissionFactors({
      //   page: currentPage,
      //   pageSize: currentPageSize,
      //   filters: { ...options.filters, ...params.filters }
      // })
      
      // Mock implementation
      setTimeout(() => {
        let filteredFactors: FactorTableItem[] = []
        
        // 優先檢查是否為專案節點
        if (options.nodeId) {
          // 使用專案資料
          filteredFactors = mockData.getProjectDataByNodeId(options.nodeId)
        } else if (options.collectionId) {
          // 使用集合過濾
          switch (options.collectionId) {
            case 'favorites':
              filteredFactors = mockData.getCentralLibraryFactors()
              break
            case 'user_defined':
              filteredFactors = mockData.getUserDefinedFactors()
              break
            case 'pact':
              filteredFactors = mockData.getPactFactors()
              break
            case 'supplier':
              filteredFactors = mockData.getSupplierFactors()
              break
            default:
              filteredFactors = [...mockFactors]
          }
        } else {
          // 預設顯示mock資料
          filteredFactors = [...mockFactors]
        }
        
        // Apply keyword filter
        const keyword = params.filters?.keyword || options.filters?.keyword
        if (keyword) {
          const lowerKeyword = keyword.toLowerCase()
          filteredFactors = filteredFactors.filter(factor =>
            factor.name.toLowerCase().includes(lowerKeyword) ||
            factor.unit.toLowerCase().includes(lowerKeyword) ||
            factor.region?.toLowerCase().includes(lowerKeyword)
          )
        }
        
        setTotal(filteredFactors.length)
        
        // Apply pagination
        const startIndex = (currentPage - 1) * currentPageSize
        const paginatedFactors = filteredFactors.slice(startIndex, startIndex + currentPageSize)
        
        setFactors(paginatedFactors)
        setPage(currentPage)
        setPageSize(currentPageSize)
        setIsLoading(false)
      }, 300)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load factors')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFactors()
  }, [options.collectionId, options.projectId, options.emissionSourceId, options.nodeId, options.refreshKey])

  const refreshFactors = () => {
    loadFactors({ page: 1 })
  }

  const searchFactors = (filters: Partial<SearchFilters>) => {
    loadFactors({ page: 1, filters })
  }

  const changePage = (newPage: number) => {
    loadFactors({ page: newPage })
  }

  const changePageSize = (newPageSize: number) => {
    loadFactors({ page: 1, pageSize: newPageSize })
  }

  return {
    factors,
    isLoading,
    error,
    total,
    page,
    pageSize,
    refreshFactors,
    searchFactors,
    changePage,
    changePageSize,
  }
}