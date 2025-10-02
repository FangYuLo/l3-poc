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
import { L1ProjectInfo, InventoryYearItem } from '@/types/types'

interface OrganizationalInventoryOverviewProps {
  projectInfo: L1ProjectInfo
  inventoryYears: InventoryYearItem[]
  onNavigateToYear?: (yearId: string) => void
  onSyncL1Project?: () => Promise<void>
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
  imported: '✅已匯入',
  not_imported: '⚪未匯入',
  pending: '⏳處理中',
}

export default function OrganizationalInventoryOverview({
  projectInfo,
  inventoryYears,
  onNavigateToYear,
  onSyncL1Project,
}: OrganizationalInventoryOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'imported' | 'not_imported'>('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const toast = useToast()

  // 篩選年度
  const filteredYears = useMemo(() => {
    return inventoryYears.filter((year) => {
      // 搜尋過濾
      const matchesSearch =
        year.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        year.year.toString().includes(searchTerm)

      // 狀態過濾
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'imported' && year.centralLibStatus === 'imported') ||
        (filterStatus === 'not_imported' && year.centralLibStatus === 'not_imported')

      return matchesSearch && matchesStatus
    })
  }, [inventoryYears, searchTerm, filterStatus])

  // 計算統計
  const importedCount = inventoryYears.filter((y) => y.centralLibStatus === 'imported').length
  const totalScope1 = inventoryYears.reduce((sum, y) => sum + y.scope1Count, 0)
  const totalScope2 = inventoryYears.reduce((sum, y) => sum + y.scope2Count, 0)
  const totalScope3 = inventoryYears.reduce((sum, y) => sum + y.scope3Count, 0)

  // 處理同步
  const handleSync = async () => {
    if (!onSyncL1Project) return

    setIsSyncing(true)
    try {
      await onSyncL1Project()
      toast({
        title: '同步完成',
        description: `✅ 已更新 ${projectInfo.inventoryYearCount} 個年度盤查，共 ${projectInfo.totalScopeCount} 個排放源`,
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
              <Badge colorScheme="green">{projectInfo.version}</Badge>
            </VStack>

            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                已匯入中央庫
              </Text>
              <Text fontWeight="medium">
                {importedCount} / {inventoryYears.length} 年度
              </Text>
            </VStack>

            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                排放源統計
              </Text>
              <Text fontWeight="medium" fontSize="sm">
                Scope 1: {totalScope1} | Scope 2: {totalScope2} | Scope 3: {totalScope3}
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
              手動同步 L1 專案
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* 年度盤查統整表 */}
      <Box flex="1" overflow="auto" bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
        {/* 工具列 */}
        <Flex p={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={4} wrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            年度盤查統整表
          </Text>

          <InputGroup maxW="300px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="搜尋年度..."
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
            共 {filteredYears.length} 個年度
          </Text>
        </Flex>

        {/* 表格內容 */}
        <Box overflow="auto">
          <Table size="sm" variant="simple">
            <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
              <Tr>
                <Th width="12%">年度</Th>
                <Th width="18%">總排放量</Th>
                <Th width="15%">組織盤查邊界</Th>
                <Th width="18%">排放源統計</Th>
                <Th width="12%">專案狀態</Th>
                <Th width="13%">中央庫狀態</Th>
                <Th width="12%">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredYears.map((year) => (
                <Tr key={year.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text fontWeight="bold" fontSize="md">
                      {year.year}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {year.name}
                    </Text>
                  </Td>
                  <Td>
                    {year.totalEmission !== null ? (
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" color="green.600">
                          {year.totalEmission.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {year.unit}
                        </Text>
                      </VStack>
                    ) : (
                      <Text color="gray.400">--</Text>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {year.organizationalBoundary}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.600">
                        Scope 1: {year.scope1Count}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Scope 2: {year.scope2Count}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Scope 3: {year.scope3Count}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={projectStatusColors[year.projectStatus]} size="sm">
                      {projectStatusText[year.projectStatus]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={centralLibStatusColors[year.centralLibStatus]} size="sm">
                      {centralLibStatusText[year.centralLibStatus]}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => onNavigateToYear?.(year.id)}
                    >
                      查看
                    </Button>
                  </Td>
                </Tr>
              ))}

              {/* 空狀態 */}
              {filteredYears.length === 0 && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">沒有符合條件的年度盤查</Text>
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
