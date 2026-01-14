'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Card,
  CardBody,
  Button,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { FiFolder, FiUsers, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useMockData } from '@/hooks/useMockData'
import {
  SupplierSyncStatus,
  SupplierReviewStatus,
  L3ImportStatus,
  SupplierListItem,
} from '@/types/types'
import SupplierTable from './SupplierTable'
import NewSyncSection from './NewSyncSection'
import SyncNotificationPanel from './SyncNotificationPanel'

interface SupplierFolderPageProps {
  onSupplierSelect?: (supplierId: string) => void
}

export default function SupplierFolderPage({ onSupplierSelect }: SupplierFolderPageProps) {
  const {
    getSupplierFolderSummary,
    getSupplierListItems,
    getUnreadSyncRecords,
    getNewSyncSuppliers,
  } = useMockData()

  // 狀態管理
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterSyncStatus, setFilterSyncStatus] = useState<string>('all')
  const [filterL3Status, setFilterL3Status] = useState<string>('all')
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  // 取得資料
  const summary = getSupplierFolderSummary()
  const supplierList = getSupplierListItems()
  const unreadRecords = getUnreadSyncRecords()
  const newSyncSuppliers = getNewSyncSuppliers()

  // 顏色設定
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const statBg = useColorModeValue('gray.50', 'gray.700')

  // 篩選供應商列表
  const filteredSuppliers = useMemo(() => {
    let result = supplierList

    // 關鍵字搜尋
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(
        s =>
          s.company_name.toLowerCase().includes(keyword) ||
          s.vendor_code.toLowerCase().includes(keyword)
      )
    }

    // 區域篩選
    if (filterRegion !== 'all') {
      result = result.filter(s => s.region === filterRegion)
    }

    // 年度篩選
    if (filterYear !== 'all') {
      result = result.filter(s => s.latest_year === parseInt(filterYear))
    }

    // 同步狀態篩選
    if (filterSyncStatus !== 'all') {
      if (filterSyncStatus === 'new') {
        result = result.filter(s => s.has_new_sync)
      } else {
        result = result.filter(s => !s.has_new_sync)
      }
    }

    // L3 狀態篩選
    if (filterL3Status !== 'all') {
      result = result.filter(s => s.l3_status === filterL3Status)
    }

    return result
  }, [supplierList, searchKeyword, filterRegion, filterYear, filterSyncStatus, filterL3Status])

  // 取得不重複的區域列表
  const regions = useMemo(() => {
    return Array.from(new Set(supplierList.map(s => s.region)))
  }, [supplierList])

  // 取得不重複的年度列表
  const years = useMemo(() => {
    return Array.from(new Set(supplierList.map(s => s.latest_year))).sort((a, b) => b - a)
  }, [supplierList])

  return (
    <Box p={6} h="100%" overflow="auto">
      {/* 頁面標題 */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Icon as={FiFolder} boxSize={6} color="blue.500" />
          <Text fontSize="2xl" fontWeight="bold">
            L4 - 供應商係數資料夾
          </Text>
        </HStack>

        {/* 新資料通知徽章 */}
        {unreadRecords.length > 0 && (
          <Button
            variant="outline"
            colorScheme="red"
            size="sm"
            leftIcon={<Badge colorScheme="red" borderRadius="full" px={2}>{summary.new_sync_count}</Badge>}
            onClick={() => setShowNotificationPanel(true)}
          >
            個新供應商資料待查看
          </Button>
        )}
      </Flex>

      {/* 搜尋與篩選列 */}
      <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody py={4}>
          <Flex gap={4} flexWrap="wrap">
            {/* 搜尋框 */}
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="搜尋供應商/產品/料號"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
            </InputGroup>

            {/* 篩選器 */}
            <Select
              maxW="120px"
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
            >
              <option value="all">區域</option>
              {regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>

            <Select
              maxW="120px"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
            >
              <option value="all">年度</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>

            <Select
              maxW="140px"
              value={filterSyncStatus}
              onChange={e => setFilterSyncStatus(e.target.value)}
            >
              <option value="all">同步狀態</option>
              <option value="new">新同步</option>
              <option value="processed">已處理</option>
            </Select>

            <Select
              maxW="140px"
              value={filterL3Status}
              onChange={e => setFilterL3Status(e.target.value)}
            >
              <option value="all">L3狀態</option>
              <option value="all_imported">全部已匯入</option>
              <option value="partial">部分匯入</option>
              <option value="none">未匯入</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* 最新同步資料區塊 */}
      {newSyncSuppliers.length > 0 && (
        <NewSyncSection
          suppliers={newSyncSuppliers}
          onViewAll={() => setShowNotificationPanel(true)}
          onSupplierClick={onSupplierSelect}
        />
      )}

      {/* 所有供應商列表 */}
      <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            所有供應商
          </Text>
          <SupplierTable
            suppliers={filteredSuppliers}
            onSupplierSelect={onSupplierSelect}
          />
        </CardBody>
      </Card>

      {/* 統計摘要 */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            統計摘要
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>
                <HStack>
                  <Icon as={FiUsers} />
                  <Text>總供應商數</Text>
                </HStack>
              </StatLabel>
              <StatNumber color="blue.500">{summary.total_suppliers}</StatNumber>
            </Stat>

            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>
                <HStack>
                  <Icon as={FiPackage} />
                  <Text>總產品數</Text>
                </HStack>
              </StatLabel>
              <StatNumber color="purple.500">{summary.total_products}</StatNumber>
            </Stat>

            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>
                <HStack>
                  <Icon as={FiCheckCircle} />
                  <Text>已匯入L3</Text>
                </HStack>
              </StatLabel>
              <StatNumber color="green.500">{summary.imported_to_l3}</StatNumber>
            </Stat>

            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>
                <HStack>
                  <Icon as={FiClock} />
                  <Text>待處理</Text>
                </HStack>
              </StatLabel>
              <StatNumber color="orange.500">{summary.pending_review}</StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 同步通知面板 */}
      {showNotificationPanel && (
        <SyncNotificationPanel
          isOpen={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
          syncRecords={unreadRecords}
          onSupplierClick={onSupplierSelect}
        />
      )}
    </Box>
  )
}
