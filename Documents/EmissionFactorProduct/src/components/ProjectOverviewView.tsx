'use client'

import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Divider,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { L2ProjectInfo, ProjectProductItem } from '@/types/types'

interface ProjectOverviewViewProps {
  projectInfo: L2ProjectInfo
  products: ProjectProductItem[]
  onNavigateToProduct?: (productId: string) => void
  onSyncL2Project?: () => Promise<void>
}

// 狀態顏色映射
const projectStatusColors: Record<string, string> = {
  locked: 'gray',
  unlocked: 'yellow',
  verified: 'green',
  draft: 'orange',
}

const centralLibStatusColors: Record<string, string> = {
  imported: 'green',
  not_imported: 'gray',
  pending: 'yellow',
}

// 狀態文字映射
const projectStatusText: Record<string, string> = {
  locked: '🔒 已鎖定',
  unlocked: '🔓 未鎖定',
  verified: '✓ 已驗證',
  draft: '📝 草稿',
}

const centralLibStatusText: Record<string, string> = {
  imported: '✅ 已匯入',
  not_imported: '⚪ 未匯入',
  pending: '⏳ 處理中',
}

export default function ProjectOverviewView({
  projectInfo,
  products,
  onNavigateToProduct,
  onSyncL2Project,
}: ProjectOverviewViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'imported' | 'not_imported'>('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const toast = useToast()

  // 篩選產品
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 搜尋過濾
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())

      // 狀態過濾
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'imported' && product.centralLibStatus === 'imported') ||
        (filterStatus === 'not_imported' && product.centralLibStatus === 'not_imported')

      return matchesSearch && matchesStatus
    })
  }, [products, searchTerm, filterStatus])

  // 分組產品
  const internalProducts = filteredProducts.filter((p) => p.type === 'product')
  const pactProducts = filteredProducts.filter((p) => p.type === 'pact')

  // 計算統計
  const importedCount = products.filter((p) => p.centralLibStatus === 'imported').length
  const internalImportedCount = products.filter(
    (p) => p.type === 'product' && p.centralLibStatus === 'imported'
  ).length
  const pactImportedCount = products.filter(
    (p) => p.type === 'pact' && p.centralLibStatus === 'imported'
  ).length

  // 處理同步
  const handleSync = async () => {
    if (!onSyncL2Project) return

    setIsSyncing(true)
    try {
      await onSyncL2Project()
      toast({
        title: '同步完成',
        description: `✅ 已更新 ${projectInfo.productCount} 個產品和 ${projectInfo.pactProductCount} 個 PACT 產品`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: '同步失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" p={6}>
      {/* 專案資訊卡片 */}
      <Box
        bg="gray.50"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        p={6}
        mb={6}
      >
        <VStack align="stretch" spacing={4}>
          <Flex justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold" color="black">
               {projectInfo.projectName}
            </Text>
            <Badge colorScheme={projectStatusColors[projectInfo.status]} fontSize="md" px={3} py={1}>
              {projectStatusText[projectInfo.status]}
            </Badge>
          </Flex>

          <Divider />

          <Flex gap={8} wrap="wrap">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                最後匯入時間
              </Text>
              <Text fontWeight="medium">{projectInfo.lastImportDate}</Text>
            </VStack>

            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                目前版本
              </Text>
              <Badge colorScheme="blue">{projectInfo.version}</Badge>
            </VStack>

            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                已匯入中央庫
              </Text>
              <Text fontWeight="medium">
                {importedCount} / {products.length} 項
                <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                  (產品: {internalImportedCount}/{projectInfo.productCount}, PACT:{' '}
                  {pactImportedCount}/{projectInfo.pactProductCount})
                </Text>
              </Text>
            </VStack>
          </Flex>

          <Box>
            <Button
              leftIcon={isSyncing ? <Spinner size="sm" /> : <RepeatIcon />}
              bg="black"
              color="white"
              _hover={{ bg: 'gray.800' }}
              _active={{ bg: 'gray.900' }}
              onClick={handleSync}
              isLoading={isSyncing}
              loadingText="同步中"
            >
              手動同步 L2 專案
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* 產品統整表 */}
      <Box flex="1" overflow="auto" bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
        {/* 工具列 */}
        <Flex p={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={4} wrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            產品統整表
          </Text>

          <InputGroup maxW="300px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="搜尋產品名稱..."
              size="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            size="sm"
            maxW="200px"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">全部狀態</option>
            <option value="imported">已匯入</option>
            <option value="not_imported">未匯入</option>
          </Select>

          <Text fontSize="sm" color="gray.500" ml="auto">
            共 {filteredProducts.length} 項
          </Text>
        </Flex>

        {/* 表格內容 */}
        <Box overflow="auto">
          <Table size="sm" variant="simple">
            <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
              <Tr>
                <Th width="35%">產品名稱</Th>
                <Th width="20%">碳足跡</Th>
                <Th width="15%">專案狀態</Th>
                <Th width="15%">中央庫狀態</Th>
                <Th width="15%">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* 內部產品 */}
              {internalProducts.length > 0 && (
                <>
                  <Tr bg="blue.50">
                    <Td colSpan={5} fontWeight="bold" color="blue.700">
                      📱 內部產品 ({internalProducts.length})
                    </Td>
                  </Tr>
                  {internalProducts.map((product) => (
                    <Tr key={product.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{product.name}</Td>
                      <Td>
                        {product.carbonFootprint ? (
                          <Text fontWeight="medium">
                            {product.carbonFootprint.toFixed(1)} {product.unit}
                          </Text>
                        ) : (
                          <Text color="gray.400">--</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={projectStatusColors[product.projectStatus]}>
                          {projectStatusText[product.projectStatus]}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={centralLibStatusColors[product.centralLibStatus]}>
                          {centralLibStatusText[product.centralLibStatus]}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => onNavigateToProduct?.(product.id)}
                        >
                          查看
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </>
              )}

              {/* PACT 產品 */}
              {pactProducts.length > 0 && (
                <>
                  <Tr bg="green.50">
                    <Td colSpan={5} fontWeight="bold" color="green.700">
                      🔗 PACT 交換產品 ({pactProducts.length})
                    </Td>
                  </Tr>
                  {pactProducts.map((product) => (
                    <Tr key={product.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{product.name}</Td>
                      <Td>
                        {product.carbonFootprint ? (
                          <Text fontWeight="medium">
                            {product.carbonFootprint.toFixed(1)} {product.unit}
                          </Text>
                        ) : (
                          <Text color="gray.400">--</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={projectStatusColors[product.projectStatus]}>
                          {projectStatusText[product.projectStatus]}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={centralLibStatusColors[product.centralLibStatus]}>
                          {centralLibStatusText[product.centralLibStatus]}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => onNavigateToProduct?.(product.id)}
                        >
                          查看
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </>
              )}

              {/* 空狀態 */}
              {filteredProducts.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.500">沒有符合條件的產品</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  )
}
