'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Flex,
  Badge,
  Collapse,
} from '@chakra-ui/react'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  AddIcon,
  EditIcon,
  StarIcon,
} from '@chakra-ui/icons'
import { useState } from 'react'
import { Dataset } from '@/types/types'
import DatasetNameModal from './DatasetNameModal'
import { useMockData } from '@/hooks/useMockData'

interface TreeNodeProps {
  id: string
  name: string
  type: 'collection' | 'project' | 'emission_source' | 'product' | 'yearly_inventory'
  count?: number
  children?: TreeNodeProps[]
  isSelected?: boolean
  isExpanded?: boolean
  onSelect?: (node: TreeNodeProps) => void
  onToggle?: (nodeId: string) => void
  level?: number
  selectedNodeId?: string
  expandedNodes?: Set<string>
}

function TreeNode({
  id,
  name,
  type,
  count,
  children,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  level = 0,
  selectedNodeId,
  expandedNodes
}: TreeNodeProps) {
  const hasChildren = children && children.length > 0
  const indent = level * 16

  const getIcon = () => {
    switch (type) {
      case 'collection':
        if (name.includes('中央係數庫')) return <StarIcon color="yellow.500" />
        if (name.includes('自建')) return <EditIcon color="blue.500" />
        return <Box w={4} h={4} bg="gray.400" borderRadius="sm" />
      case 'project':
        return <Box w={4} h={4} bg="brand.500" borderRadius="sm" />
      case 'product':
        return <Box w={4} h={4} bg="purple.500" borderRadius="sm" />
      case 'yearly_inventory':
        return <Box w={4} h={4} bg="orange.500" borderRadius="sm" />
      case 'emission_source':
        return <Box w={4} h={4} bg="green.500" borderRadius="sm" />
      default:
        return null
    }
  }

  return (
    <Box>
      <HStack
        pl={indent + 'px'}
        pr={3}
        py={2}
        cursor="pointer"
        bg={isSelected ? 'sidebar.selected' : 'transparent'}
        _hover={{ bg: 'sidebar.hover' }}
        borderRadius="md"
        mx={2}
        onClick={() => onSelect?.({ id, name, type, count, children })}
        spacing={2}
      >
        {hasChildren ? (
          <IconButton
            icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.(id)
            }}
            aria-label="Toggle"
          />
        ) : (
          <Box w={6} />
        )}

        {getIcon()}

        <Text fontSize="sm" flex="1" noOfLines={1}>
          {name}
        </Text>

        {count !== undefined && (
          <Badge size="sm" colorScheme="gray" variant="subtle">
            {count}
          </Badge>
        )}
      </HStack>

      {hasChildren && (
        <Collapse in={isExpanded}>
          <VStack spacing={0} align="stretch">
            {children?.map((child) => (
              <TreeNode
                key={child.id}
                {...child}
                isSelected={selectedNodeId === child.id}
                isExpanded={expandedNodes?.has(child.id)}
                onSelect={onSelect}
                onToggle={onToggle}
                level={level + 1}
                selectedNodeId={selectedNodeId}
                expandedNodes={expandedNodes}
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  )
}

interface SidebarTreeProps {
  onNodeSelect?: (node: TreeNodeProps) => void
  selectedNode?: TreeNodeProps | null
  onCreateDataset?: (datasetData: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) => void
  datasets?: Dataset[]
  userDefinedFactors?: any[] // 用戶自建係數列表
}

export default function SidebarTree({ 
  onNodeSelect, 
  selectedNode, 
  onCreateDataset,
  datasets = [],
  userDefinedFactors = []
}: SidebarTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['projects', 'project_1', 'project_2']))
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false)

  // 使用統一的資料管理
  const mockData = useMockData()
  const collectionCounts = mockData.getCollectionCounts()

  // 建立資料集節點
  const datasetNodes: TreeNodeProps[] = datasets.map(dataset => ({
    id: `dataset_${dataset.id}`,
    name: dataset.name,
    type: 'collection' as const,
    count: dataset.factorIds.length,
  }))

  // 樹狀資料 - 使用真實的係數數量
  const treeData: TreeNodeProps[] = [
    {
      id: 'favorites',
      name: '中央係數庫',
      type: 'collection',
      count: collectionCounts.favorites,
    },
    {
      id: 'user_defined',
      name: '自建係數',
      type: 'collection',
      count: userDefinedFactors.length,
    },
    // 直接插入資料集節點，不需要父層級
    ...datasetNodes,
    {
      id: 'projects',
      name: '專案',
      type: 'collection',
      isExpanded: true,
      children: [
        {
          id: 'supplier',
          name: '供應商係數',
          type: 'collection',
          count: collectionCounts.supplier,
        },
        {
          id: 'project_1',
          name: '專案 A - 產品碳足跡',
          type: 'project',
          count: 45,
          children: [
            {
              id: 'pact',
              name: 'PACT交換',
              type: 'collection',
              count: collectionCounts.pact,
            },
            {
              id: 'product_1_1',
              name: '產品A1 - 智慧型手機 (2024)',
              type: 'product',
              count: 15,
              children: [
                { id: 'source_1_1_1', name: '原物料採購', type: 'emission_source', count: 5 },
                { id: 'source_1_1_2', name: '製程加工', type: 'emission_source', count: 5 },
                { id: 'source_1_1_3', name: '包裝運輸', type: 'emission_source', count: 5 },
              ],
            },
            {
              id: 'product_1_2',
              name: '產品A2 - LED燈具 (2024)',
              type: 'product',
              count: 15,
              children: [
                { id: 'source_1_2_1', name: '原物料採購', type: 'emission_source', count: 5 },
                { id: 'source_1_2_2', name: '製程加工', type: 'emission_source', count: 5 },
                { id: 'source_1_2_3', name: '包裝運輸', type: 'emission_source', count: 5 },
              ],
            },
            {
              id: 'product_1_3',
              name: '產品A3 - 筆記型電腦 (2024)',
              type: 'product',
              count: 15,
              children: [
                { id: 'source_1_3_1', name: '原物料採購', type: 'emission_source', count: 5 },
                { id: 'source_1_3_2', name: '製程加工', type: 'emission_source', count: 5 },
                { id: 'source_1_3_3', name: '包裝運輸', type: 'emission_source', count: 5 },
              ],
            },
          ],
        },
        {
          id: 'project_2',
          name: '專案 B - 組織碳盤查',
          type: 'project',
          count: 54,
          children: [
            {
              id: 'year_2_2024',
              name: '2024年度盤查',
              type: 'yearly_inventory',
              count: 18,
              children: [
                { id: 'source_2_2024_1', name: 'Scope 1 直接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2024_2', name: 'Scope 2 間接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2024_3', name: 'Scope 3 其他間接', type: 'emission_source', count: 6 },
              ],
            },
            {
              id: 'year_2_2023',
              name: '2023年度盤查',
              type: 'yearly_inventory',
              count: 18,
              children: [
                { id: 'source_2_2023_1', name: 'Scope 1 直接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2023_2', name: 'Scope 2 間接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2023_3', name: 'Scope 3 其他間接', type: 'emission_source', count: 6 },
              ],
            },
            {
              id: 'year_2_2022',
              name: '2022年度盤查',
              type: 'yearly_inventory',
              count: 18,
              children: [
                { id: 'source_2_2022_1', name: 'Scope 1 直接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2022_2', name: 'Scope 2 間接排放', type: 'emission_source', count: 6 },
                { id: 'source_2_2022_3', name: 'Scope 3 其他間接', type: 'emission_source', count: 6 },
              ],
            },
          ],
        },
      ],
    },
  ]

  const handleNodeSelect = (node: TreeNodeProps) => {
    // 通知父組件節點被選中
    onNodeSelect?.(node)
    // 觸發載入該節點的係數資料
    console.log('Selected node:', node)
  }

  const handleNodeToggle = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleCreateDataset = (datasetData: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) => {
    onCreateDataset?.(datasetData)
  }

  const getExistingDatasetNames = () => {
    return datasets.map(dataset => dataset.name)
  }


  return (
    <Box h="100%" overflow="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="sidebar.border">
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          係數資料夾
        </Text>
        <IconButton
          icon={<AddIcon />}
          size="sm"
          variant="ghost"
          aria-label="新增資料集"
          onClick={() => setIsDatasetModalOpen(true)}
        />
      </Flex>

      {/* Tree */}
      <Box py={2}>
        {treeData.map((node) => (
          <TreeNode
            key={node.id}
            {...node}
            isSelected={selectedNode?.id === node.id}
            isExpanded={expandedNodes.has(node.id)}
            onSelect={handleNodeSelect}
            onToggle={handleNodeToggle}
            selectedNodeId={selectedNode?.id}
            expandedNodes={expandedNodes}
          />
        ))}
      </Box>

      {/* Footer Info */}
      <Box p={4} borderTop="1px solid" borderColor="sidebar.border" mt="auto">
        <Text fontSize="xs" color="gray.500">
          資料庫共收錄 89,432 筆係數
        </Text>
        <Text fontSize="xs" color="gray.500">
          最後更新: 2024-01-15
        </Text>
      </Box>

      {/* DatasetNameModal */}
      <DatasetNameModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onConfirm={handleCreateDataset}
        existingNames={getExistingDatasetNames()}
      />
    </Box>
  )
}