'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Text,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  CheckboxGroup,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Spacer,
  Select,
} from '@chakra-ui/react'
import {
  SearchIcon,
  TriangleDownIcon,
  StarIcon,
  EditIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { formatNumber } from '@/lib/utils'
import { useMockData } from '@/hooks/useMockData'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenComposite: () => void
  mode?: 'search' | 'add_to_dataset' // 新增模式選項
  targetDatasetId?: string // 目標資料集ID
  onAddToDataset?: (factorId: number) => void // 加入資料集回調
}

interface SearchResult {
  id: number
  type: 'emission_factor' | 'composite_factor'
  name: string
  value: number
  unit: string
  year?: number
  region?: string
  method_gwp?: string
  source_type: string
  source_ref?: string
  version: string
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onOpenComposite,
  mode = 'search',
  onAddToDataset
}: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [showFilters, setShowFilters] = useState(false)

  // Search filters
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([])

  // 使用統一資料管理
  const dataService = useMockData()
  
  // 取得所有係數資料並轉換為搜尋結果格式
  const allFactorResults: SearchResult[] = useMemo(() => {
    return dataService.getAllFactorItems().map(factor => ({
      id: factor.id,
      type: factor.type as 'emission_factor' | 'composite_factor',
      name: factor.name,
      value: factor.value,
      unit: factor.unit,
      year: factor.year,
      region: factor.region,
      method_gwp: factor.method_gwp,
      source_type: factor.source_type || 'standard',
      source_ref: factor.source_ref,
      version: factor.version,
    }))
  }, [dataService])

  // 動態生成篩選選項
  const facets = useMemo(() => {
    const regionSet = new Set<string>()
    const yearSet = new Set<number>()
    const unitSet = new Set<string>()
    const methodSet = new Set<string>()
    
    allFactorResults.forEach(r => {
      if (r.region) regionSet.add(r.region)
      if (r.year) yearSet.add(r.year)
      unitSet.add(r.unit)
      if (r.method_gwp) methodSet.add(r.method_gwp)
    })
    
    return {
      regions: Array.from(regionSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
      units: Array.from(unitSet).sort(),
      methods: Array.from(methodSet).sort(),
      sourceTypes: [
        { value: 'standard', label: '標準資料庫' },
        { value: 'pact', label: 'PACT交換' },
        { value: 'supplier', label: '供應商係數' },
        { value: 'user_defined', label: '自建係數' },
      ],
    }
  }, [allFactorResults])

  const filteredResults = useMemo(() => {
    let results = allFactorResults

    if (searchTerm) {
      results = results.filter((item: SearchResult) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source_ref?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedRegions.length > 0) {
      results = results.filter((item: SearchResult) => item.region && selectedRegions.includes(item.region))
    }

    if (selectedYears.length > 0) {
      results = results.filter((item: SearchResult) => item.year && selectedYears.includes(item.year.toString()))
    }

    if (selectedUnits.length > 0) {
      results = results.filter((item: SearchResult) => selectedUnits.includes(item.unit))
    }

    if (selectedMethods.length > 0) {
      results = results.filter((item: SearchResult) => item.method_gwp && selectedMethods.includes(item.method_gwp))
    }

    if (selectedSourceTypes.length > 0) {
      results = results.filter((item: SearchResult) => selectedSourceTypes.includes(item.source_type))
    }

    return results
  }, [searchTerm, selectedRegions, selectedYears, selectedUnits, selectedMethods, selectedSourceTypes, allFactorResults])

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredResults.slice(startIndex, startIndex + pageSize)
  }, [filteredResults, currentPage, pageSize])

  const totalPages = Math.ceil(filteredResults.length / pageSize)

  const getSourceTypeBadge = (sourceType: string) => {
    const configs = {
      standard: { label: '標準', colorScheme: 'blue' },
      pact: { label: 'PACT', colorScheme: 'green' },
      supplier: { label: '供應商', colorScheme: 'purple' },
      user_defined: { label: '自建', colorScheme: 'orange' },
    }
    
    const config = configs[sourceType as keyof typeof configs] || { label: '未知', colorScheme: 'gray' }
    return (
      <Badge size="sm" colorScheme={config.colorScheme}>
        {config.label}
      </Badge>
    )
  }

  const handleAddToFavorites = (result: SearchResult) => {
    console.log('Add to favorites:', result)
    // 實際實作會呼叫 API
  }

  const handleAddToProject = (result: SearchResult) => {
    console.log('Add to project:', result)
    // 實際實作會開啟專案選擇對話框
  }

  const handleAddToComposite = (result: SearchResult) => {
    console.log('Add to composite:', result)
    onOpenComposite()
    // 實際實作會將係數加入組合編輯器
  }

  const clearAllFilters = () => {
    setSelectedRegions([])
    setSelectedYears([])
    setSelectedUnits([])
    setSelectedMethods([])
    setSelectedSourceTypes([])
    setCurrentPage(1)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="85vh" maxW="95vw" w="95vw">
        <ModalHeader>
          <Flex align="center" justify="space-between">
            <Text>
              {mode === 'add_to_dataset' ? '選擇係數加入資料集' : '全庫搜尋'} - {allFactorResults.length.toLocaleString()} 筆係數資料
            </Text>
            <HStack spacing={2}>
              <Button
                leftIcon={<SettingsIcon />}
                size="sm"
                variant={showFilters ? "solid" : "outline"}
                colorScheme={showFilters ? "blue" : "gray"}
                onClick={() => setShowFilters(!showFilters)}
              >
                篩選
              </Button>
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch" h="calc(85vh - 120px)">
            {/* Search Input */}
            <InputGroup>
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="搜尋關鍵字..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <HStack spacing={6} align="start" flex="1" overflow="hidden">
              {/* Left Panel - Collapsible Filters */}
              {showFilters && (
                <Box w="300px" h="100%" overflow="auto" borderRight="1px solid" borderColor="gray.200" pr={4}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">篩選條件</Text>
                      <Button size="xs" variant="ghost" onClick={clearAllFilters}>
                        清除全部
                      </Button>
                    </HStack>

                    {/* Filters */}
                    <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
                  {/* Regions */}
                  <AccordionItem>
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="medium">地區</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0}>
                      <CheckboxGroup
                        value={selectedRegions}
                        onChange={(value) => setSelectedRegions(value as string[])}
                      >
                        <VStack align="start" spacing={1}>
                          {facets.regions.map((region) => (
                            <Checkbox key={region} value={region} size="sm">
                              {region}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Years */}
                  <AccordionItem>
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="medium">年份</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0}>
                      <CheckboxGroup
                        value={selectedYears}
                        onChange={(value) => setSelectedYears(value as string[])}
                      >
                        <VStack align="start" spacing={1}>
                          {facets.years.map((year) => (
                            <Checkbox key={year} value={year.toString()} size="sm">
                              {year}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Units */}
                  <AccordionItem>
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="medium">單位</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0}>
                      <CheckboxGroup
                        value={selectedUnits}
                        onChange={(value) => setSelectedUnits(value as string[])}
                      >
                        <VStack align="start" spacing={1}>
                          {facets.units.map((unit) => (
                            <Checkbox key={unit} value={unit} size="sm">
                              {unit}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Methods */}
                  <AccordionItem>
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="medium">方法學</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0}>
                      <CheckboxGroup
                        value={selectedMethods}
                        onChange={(value) => setSelectedMethods(value as string[])}
                      >
                        <VStack align="start" spacing={1}>
                          {facets.methods.map((method) => (
                            <Checkbox key={method} value={method} size="sm">
                              {method}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Source Types */}
                  <AccordionItem>
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="medium">來源類型</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0}>
                      <CheckboxGroup
                        value={selectedSourceTypes}
                        onChange={(value) => setSelectedSourceTypes(value as string[])}
                      >
                        <VStack align="start" spacing={1}>
                          {facets.sourceTypes.map((type) => (
                            <Checkbox key={type.value} value={type.value} size="sm">
                              {type.label}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </AccordionPanel>
                  </AccordionItem>
                    </Accordion>
                  </VStack>
                </Box>
              )}

              {/* Right Panel - Results */}
              <Box flex="1" h="100%" overflow="hidden" minW="0">
              <VStack spacing={4} align="stretch" h="100%">
                {/* Results Header */}
                <Flex align="center" gap={4}>
                  <Text fontSize="sm" color="gray.600">
                    找到 {filteredResults.length} 筆結果
                  </Text>
                  <Spacer />
                  <HStack>
                    <Text fontSize="sm">每頁</Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </Select>
                  </HStack>
                </Flex>

                {/* Results Table */}
                <Box flex="1" overflow="auto" borderRadius="md" border="1px solid" borderColor="gray.200" minH="0" maxW="100%">
                  <Table size="sm" layout="fixed" w="100%">
                    <Thead position="sticky" top={0} bg="white">
                      <Tr>
                        <Th width="30%">名稱</Th>
                        <Th width="12%" isNumeric>值</Th>
                        <Th width="12%">單位</Th>
                        <Th width="8%">年份</Th>
                        <Th width="12%">地區</Th>
                        <Th width="12%">來源</Th>
                        <Th width="14%">操作</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedResults.map((result: SearchResult) => (
                        <Tr key={result.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                              {result.name}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontSize="sm" fontFamily="mono">
                              {formatNumber(result.value)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{result.unit}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{result.year || '-'}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{result.region || '-'}</Text>
                          </Td>
                          <Td>{getSourceTypeBadge(result.source_type)}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<TriangleDownIcon />}
                                size="xs"
                                variant="ghost"
                              />
                              <MenuList>
                                {mode === 'add_to_dataset' ? (
                                  <MenuItem
                                    icon={<EditIcon />}
                                    onClick={() => {
                                      onAddToDataset?.(result.id)
                                      onClose()
                                    }}
                                  >
                                    加入資料集
                                  </MenuItem>
                                ) : (
                                  <>
                                    <MenuItem
                                      icon={<StarIcon />}
                                      onClick={() => handleAddToFavorites(result)}
                                    >
                                      加入常用
                                    </MenuItem>
                                    <MenuItem
                                      icon={<EditIcon />}
                                      onClick={() => handleAddToProject(result)}
                                    >
                                      引用到專案
                                    </MenuItem>
                                    <MenuItem
                                      icon={<EditIcon />}
                                      onClick={() => handleAddToComposite(result)}
                                    >
                                      加入組合
                                    </MenuItem>
                                    <MenuItem icon={<ExternalLinkIcon />}>
                                      查看詳情
                                    </MenuItem>
                                  </>
                                )}
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  {paginatedResults.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">沒有找到符合條件的係數</Text>
                    </Box>
                  )}
                </Box>

                {/* Pagination */}
                <Flex justify="space-between" align="center" flexShrink={0} pt={2}>
                  <Text fontSize="sm" color="gray.600">
                    第 {Math.min((currentPage - 1) * pageSize + 1, filteredResults.length)} - {Math.min(currentPage * pageSize, filteredResults.length)} 筆，
                    共 {filteredResults.length} 筆
                  </Text>
                  
                  <HStack>
                    <IconButton
                      icon={<ChevronLeftIcon />}
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      aria-label="Previous page"
                    />
                    
                    <Text fontSize="sm" px={3}>
                      {currentPage} / {totalPages}
                    </Text>
                    
                    <IconButton
                      icon={<ChevronRightIcon />}
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      aria-label="Next page"
                    />
                  </HStack>
                </Flex>
              </VStack>
            </Box>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}