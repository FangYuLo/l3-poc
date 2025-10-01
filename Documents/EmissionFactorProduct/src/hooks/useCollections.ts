'use client'

import { useState, useEffect } from 'react'
import { Collection, TreeNode, ApiResponse } from '@/types/types'
import { apiClient } from '@/lib/apiClient'
import { COLLECTION_NAMES, COLLECTION_TYPES } from '@/lib/constants'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for now - in real app this would come from API
  const mockTreeData: TreeNode[] = [
    {
      id: 'favorites',
      name: '常用係數',
      type: 'collection',
      children: [],
    },
    {
      id: 'user_defined',
      name: '自建係數',
      type: 'collection',
      children: [],
    },
    {
      id: 'pact',
      name: 'PACT交換',
      type: 'collection',
      children: [],
    },
    {
      id: 'supplier',
      name: '供應商係數',
      type: 'collection',
      children: [],
    },
    {
      id: 'projects',
      name: '專案',
      type: 'collection',
      children: [
        {
          id: 'project_1',
          name: 'L2 - 產品碳足跡',
          type: 'project',
          project_id: 1,
          children: [
            {
              id: 'product_1_1',
              name: '產品A1 - 智慧型手機 (2024)',
              type: 'product',
              product_id: 1,
              year: 2024,
              children: [
                { id: 'source_1_1_1', name: '原物料採購', type: 'emission_source', emission_source_id: 1 },
                { id: 'source_1_1_2', name: '製程加工', type: 'emission_source', emission_source_id: 2 },
                { id: 'source_1_1_3', name: '包裝運輸', type: 'emission_source', emission_source_id: 3 },
              ],
            },
            {
              id: 'product_1_2',
              name: '產品A2 - LED燈具 (2024)',
              type: 'product',
              product_id: 2,
              year: 2024,
              children: [
                { id: 'source_1_2_1', name: '原物料採購', type: 'emission_source', emission_source_id: 7 },
                { id: 'source_1_2_2', name: '製程加工', type: 'emission_source', emission_source_id: 8 },
                { id: 'source_1_2_3', name: '包裝運輸', type: 'emission_source', emission_source_id: 9 },
              ],
            },
            {
              id: 'product_1_3',
              name: '產品A3 - 筆記型電腦 (2024)',
              type: 'product',
              product_id: 3,
              year: 2024,
              children: [
                { id: 'source_1_3_1', name: '原物料採購', type: 'emission_source', emission_source_id: 10 },
                { id: 'source_1_3_2', name: '製程加工', type: 'emission_source', emission_source_id: 11 },
                { id: 'source_1_3_3', name: '包裝運輸', type: 'emission_source', emission_source_id: 12 },
              ],
            },
          ],
        },
        {
          id: 'project_2',
          name: 'L1 - 組織碳盤查',
          type: 'project',
          project_id: 2,
          children: [
            {
              id: 'year_2_2024',
              name: '2024年度盤查',
              type: 'yearly_inventory',
              year: 2024,
              children: [
                { id: 'source_2_2024_1', name: 'Scope 1 直接排放', type: 'emission_source', emission_source_id: 13 },
                { id: 'source_2_2024_2', name: 'Scope 2 間接排放', type: 'emission_source', emission_source_id: 14 },
                { id: 'source_2_2024_3', name: 'Scope 3 其他間接', type: 'emission_source', emission_source_id: 15 },
              ],
            },
            {
              id: 'year_2_2023',
              name: '2023年度盤查',
              type: 'yearly_inventory',
              year: 2023,
              children: [
                { id: 'source_2_2023_1', name: 'Scope 1 直接排放', type: 'emission_source', emission_source_id: 16 },
                { id: 'source_2_2023_2', name: 'Scope 2 間接排放', type: 'emission_source', emission_source_id: 17 },
                { id: 'source_2_2023_3', name: 'Scope 3 其他間接', type: 'emission_source', emission_source_id: 18 },
              ],
            },
            {
              id: 'year_2_2022',
              name: '2022年度盤查',
              type: 'yearly_inventory',
              year: 2022,
              children: [
                { id: 'source_2_2022_1', name: 'Scope 1 直接排放', type: 'emission_source', emission_source_id: 19 },
                { id: 'source_2_2022_2', name: 'Scope 2 間接排放', type: 'emission_source', emission_source_id: 20 },
                { id: 'source_2_2022_3', name: 'Scope 3 其他間接', type: 'emission_source', emission_source_id: 21 },
              ],
            },
          ],
        },
      ],
    },
  ]

  const loadCollections = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // In a real app, this would fetch from API
      // const response = await apiClient.getCollections()
      // if (response.success) {
      //   setCollections(response.data)
      // }
      
      // For now, use mock data
      setTimeout(() => {
        setTreeData(mockTreeData)
        setIsLoading(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  const refreshCollections = () => {
    loadCollections()
  }

  return {
    collections,
    projects,
    treeData,
    isLoading,
    error,
    refreshCollections,
  }
}