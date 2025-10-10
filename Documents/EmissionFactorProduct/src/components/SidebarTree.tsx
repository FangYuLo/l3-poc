'use client'

import {
  Box,
  Text,
  VStack,
  IconButton,
  Flex,
  Badge,
  Collapse,
} from '@chakra-ui/react'
import {
  ChevronRightIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'
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
  isContainerOnly?: boolean // 新增：標記為僅容器節點（不可選擇，僅展開/收起）
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
  isContainerOnly, // 新增參數
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  level = 0,
  selectedNodeId,
  expandedNodes
}: TreeNodeProps) {
  const hasChildren = children && children.length > 0
  const indent = level * 20

  // Custom SVG Icons matching the design style
  const FolderIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M2 3h4l1 2h7v8H2V3z"
      />
    </Icon>
  )

  const LightbulbIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M8 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11H6V9.5C4.8 8.8 4 7.5 4 6a4 4 0 0 1 4-4zM6 12h4v1H6v-1z"
      />
    </Icon>
  )

  const StarIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M8 1l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z"
      />
    </Icon>
  )

  const PersonIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 13a5 5 0 0 1 10 0"
      />
    </Icon>
  )

  const SearchIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 11l3 3"
      />
    </Icon>
  )

  const DocumentIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M3 2h6l4 4v8H3V2zM9 2v4h4"
      />
    </Icon>
  )

  const CubeIcon = () => (
    <Icon viewBox="0 0 16 16" boxSize={4} mr={2} color={isSelected ? "white" : "gray.600"}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M8 1l6 3v8l-6 3-6-3V4l6-3zM8 1v7M2 4l6 3M14 4l-6 3"
      />
    </Icon>
  )

  const getIcon = () => {
    switch (type) {
      case 'collection':
        if (name.includes('中央係數庫')) return <LightbulbIcon />
        if (name.includes('希達係數庫')) return <SearchIcon />
        if (name.includes('自建')) return <StarIcon />
        if (name.includes('供應商')) return <PersonIcon />
        if (name.includes('PACT')) return <FolderIcon />
        return <DocumentIcon />
      case 'project':
        return <DocumentIcon />
      case 'product':
        return <FolderIcon />
      case 'yearly_inventory':
        return <FolderIcon />
      case 'emission_source':
        return <FolderIcon />
      default:
        return null
    }
  }

  return (
    <Box>
      <Flex
        pl={indent + 'px'}
        pr={4}
        py={2.5}
        cursor="pointer"
        bg={isSelected ? 'gray.800' : 'transparent'}
        color={isSelected ? 'white' : 'gray.700'}
        _hover={{ bg: isSelected ? 'gray.800' : 'gray.100' }}
        borderRadius={isSelected ? 'md' : 'none'}
        mx={isSelected ? 3 : 0}
        onClick={() => {
          // 容器型節點：只切換展開狀態，不觸發選擇
          if (hasChildren && isContainerOnly) {
            onToggle?.(id)
          } else {
            // 其他節點：正常觸發選擇
            onSelect?.({ id, name, type, count, children, isContainerOnly })
          }
        }}
        align="center"
        minH="40px"
      >
        {hasChildren ? (
          <IconButton
            icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            size="xs"
            variant="ghost"
            color={isSelected ? 'white' : 'gray.500'}
            _hover={{ bg: 'transparent' }}
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.(id)
            }}
            aria-label="Toggle"
            mr={1}
          />
        ) : (
          <Box w={5} mr={1} />
        )}

        {getIcon()}

        <Text
          fontSize="sm"
          flex="1"
          fontWeight={isSelected ? 'medium' : 'normal'}
          color={
            (name === 'L2 - 產品碳足跡' || name === 'L1 - 組織碳盤查') && !isSelected
              ? 'black'
              : isSelected
              ? 'white'
              : 'gray.700'
          }
        >
          {name}
        </Text>

        {count !== undefined && (
          <Box
            bg={isSelected ? 'whiteAlpha.300' : 'gray.100'}
            px={2}
            py={1}
            borderRadius="full"
            minW="24px"
            textAlign="center"
          >
            <Text fontSize="xs" color={isSelected ? 'white' : 'gray.600'} fontWeight="medium">
              {count}
            </Text>
          </Box>
        )}
      </Flex>

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['factor_folders', 'projects', 'project_1', 'project_2']))
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
      id: 'factor_folders',
      name: '係數資料夾',
      type: 'collection',
      isExpanded: true,
      isContainerOnly: true, // 標記為僅容器節點
      children: [
        {
          id: 'favorites',
          name: '中央係數庫',
          type: 'collection',
          count: collectionCounts.favorites,
        },
        {
          id: 'global_search',
          name: '希達係數庫',
          type: 'collection',
          count: mockData.getAllFactorItems().length,
        },
        {
          id: 'user_defined',
          name: '自建係數',
          type: 'collection',
          count: userDefinedFactors.length,
        },
        // 插入資料集節點作為子節點
        ...datasetNodes,
      ],
    },
    {
      id: 'projects',
      name: '專案',
      type: 'collection',
      isExpanded: true,
      isContainerOnly: true, // 新增：標記為僅容器節點
      children: [
        {
          id: 'supplier',
          name: 'L4 - 供應商係數',
          type: 'collection',
          count: collectionCounts.supplier,
        },
        {
          id: 'project_1',
          name: 'L2 - 產品碳足跡',
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
          name: 'L1 - 組織碳盤查',
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
    <Box h="100%" overflow="auto" bg="gray.50">
      {/* Header */}
      <Flex justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="gray.200">
        <Text fontSize="sm" fontWeight="medium" color="gray.800">
          係數管理
        </Text>
        <Box
          as="span"
          fontSize="lg"
          cursor="pointer"
          color="gray.600"
          onClick={() => setIsDatasetModalOpen(true)}
        >
          +
        </Box>
      </Flex>

      {/* Tree */}
      <Box py={3}>
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