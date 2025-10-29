'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  Tabs,
  TabList,
  Tab,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Tooltip,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverHeader,
  CloseButton,
  Divider,
} from '@chakra-ui/react'
import {
  SearchIcon,
  CheckIcon,
  CloseIcon,
  SettingsIcon,
  ChevronDownIcon,
  InfoIcon,
} from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { formatNumber } from '@/lib/utils'
import EmissionFactorCards from './EmissionFactorCards'

interface FactorSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedFactors: UnifiedFactor[]) => void
  excludeIds?: number[]
  targetUnit?: string
  centralFactors?: UnifiedFactor[] // 中央係數庫資料
  globalFactors?: UnifiedFactor[] // 全庫搜尋資料
}

interface UnifiedFactor {
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
  source?: string
  version: string
  dataSource: 'local' | 'global'
  requires_gwp_conversion?: boolean  // 標記需要 GWP 轉換
  co2_factor?: number
  ch4_factor?: number
  n2o_factor?: number
  co2_unit?: string
  ch4_unit?: string
  n2o_unit?: string
  data_quality?: string
}

export default function FactorSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  excludeIds = [],
  targetUnit,
  centralFactors = [],
  globalFactors = []
}: FactorSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFactorIds, setSelectedFactorIds] = useState<number[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState(0) // 0: 中央係數庫, 1: 全庫搜尋, 2: 全部
  // 右側滑出詳情面板狀態
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [selectedDetailFactor, setSelectedDetailFactor] = useState<UnifiedFactor | null>(null)
  // 驗證錯誤狀態
  const [validationError, setValidationError] = useState<string>('')

  // 使用傳入的真實資料，如果沒有則使用預設 mock data
  const localFactorsMock: UnifiedFactor[] = [
    {
      id: 1,
      type: 'emission_factor',
      name: '英國-石油產品-Distillate Fuel Oil No. 1',
      value: 3.0209492544,
      unit: 'kg CO₂/L',
      year: 2024,
      region: '英國',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'GHG Emission Factors Hub 2024',
      version: '2024.1',
      dataSource: 'local',
    },
    {
      id: 2,
      type: 'emission_factor',
      name: '中國-煤炭油-原油-公升',
      value: 2.68,
      unit: 'kg CO₂/L',
      year: 2024,
      region: '中國',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: '中國 - 碳盤查實務指引',
      version: '2024.1',
      dataSource: 'local',
    },
    {
      id: 3,
      type: 'composite_factor',
      name: '鋼材生產組合係數',
      value: 1.85,
      unit: 'kg CO₂e/kg',
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      dataSource: 'local',
    },
    {
      id: 5,
      type: 'emission_factor',
      name: 'PACT-半導體晶片-Silicon Wafer',
      value: 0.45,
      unit: 'kg CO₂e/unit',
      year: 2024,
      region: '全球',
      method_gwp: 'GWP100',
      source_type: 'pact',
      source_ref: 'PACT Network 2024',
      version: 'PACT-2024.1',
      dataSource: 'local',
    },
    {
      id: 6,
      type: 'emission_factor',
      name: '台積電-12吋晶圓製程',
      value: 12.8,
      unit: 'kg CO₂e/wafer',
      year: 2024,
      region: '台灣',
      method_gwp: 'GWP100',
      source_type: 'supplier',
      source_ref: '台積電永續報告書 2024',
      version: 'TSMC-2024.1',
      dataSource: 'local',
    },
    {
      id: 7,
      type: 'composite_factor',
      name: '電動車電池組合係數',
      value: 85.2,
      unit: 'kg CO₂e/kWh',
      method_gwp: 'GWP100',
      source_type: 'user_defined',
      version: '1.0',
      dataSource: 'local',
    }
  ]

  // 全庫搜尋係數數據 mock data
  const globalFactorsMock: UnifiedFactor[] = [
    {
      id: 1001,
      type: 'emission_factor',
      name: '天然氣燃燒 - 工業用',
      value: 2.0322,
      unit: 'kg CO₂e/m³',
      year: 2023,
      region: '台灣',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'EPA 2023',
      version: '2.1',
      dataSource: 'global',
    },
    {
      id: 1002,
      type: 'emission_factor',
      name: '電力網格 - 中國華東',
      value: 0.7935,
      unit: 'kg CO₂e/kWh',
      year: 2023,
      region: '中國',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'NDRC 2023',
      version: '1.5',
      dataSource: 'global',
    },
    {
      id: 1003,
      type: 'emission_factor',
      name: '煤炭燃燒 - 發電廠',
      value: 0.9542,
      unit: 'kg CO₂e/kWh',
      year: 2022,
      region: '全球',
      method_gwp: 'GWP100',
      source_type: 'pact',
      source_ref: 'PACT Database',
      version: '2.0',
      dataSource: 'global',
    },
    {
      id: 1004,
      type: 'emission_factor',
      name: '汽油燃燒 - 車用',
      value: 2.392,
      unit: 'kg CO₂e/L',
      year: 2023,
      region: '美國',
      method_gwp: 'GWP100',
      source_type: 'standard',
      source_ref: 'EPA 2023',
      version: '2.3',
      dataSource: 'global',
    },
    {
      id: 1005,
      type: 'emission_factor',
      name: '鋼材生產 - 高爐',
      value: 2.1,
      unit: 'kg CO₂e/kg',
      year: 2023,
      region: '日本',
      method_gwp: 'GWP100',
      source_type: 'supplier',
      source_ref: 'JFE Steel 2023',
      version: '1.2',
      dataSource: 'global',
    }
  ]

  // 使用傳入的真實資料，若無則使用 mock data
  const localFactors = centralFactors.length > 0 ? centralFactors : localFactorsMock
  const globalFactorsData = globalFactors.length > 0 ? globalFactors : globalFactorsMock

  // 獲取當前標籤的數據
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 0: return localFactors
      case 1: return globalFactorsData
      default: return localFactors
    }
  }

  // 過濾後的數據
  const filteredFactors = useMemo(() => {
    let factors = getCurrentTabData()

    // 排除已選擇的係數
    factors = factors.filter(factor => !excludeIds.includes(factor.id))

    // 搜尋過濾
    if (searchTerm) {
      factors = factors.filter(factor =>
        factor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factor.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factor.region?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 地區過濾
    if (selectedRegions.length > 0) {
      factors = factors.filter(factor => factor.region && selectedRegions.includes(factor.region))
    }

    // 來源類型過濾
    if (selectedSourceTypes.length > 0) {
      factors = factors.filter(factor => selectedSourceTypes.includes(factor.source_type))
    }

    // 單位過濾
    if (selectedUnits.length > 0) {
      factors = factors.filter(factor => selectedUnits.includes(factor.unit))
    }

    return factors
  }, [searchTerm, selectedRegions, selectedSourceTypes, selectedUnits, activeTab, excludeIds])

  // 已選擇的係數 - 使用 Map 去重，避免重複顯示
  const selectedFactors = useMemo(() => {
    const factorMap = new Map<number, UnifiedFactor>()

    // 優先使用 local (中央係數庫) 版本
    localFactors.forEach(f => factorMap.set(f.id, f))

    // global (全庫搜尋) 只加入不存在的係數
    globalFactorsData.forEach(f => {
      if (!factorMap.has(f.id)) {
        factorMap.set(f.id, f)
      }
    })

    // 從去重後的 Map 中篩選出已選擇的係數
    const allFactors = Array.from(factorMap.values())
    return allFactors.filter(factor => selectedFactorIds.includes(factor.id))
  }, [selectedFactorIds, localFactors, globalFactorsData])

  // 篩選選項
  const filterOptions = useMemo(() => {
    const allFactors = getCurrentTabData()
    return {
      regions: Array.from(new Set(allFactors.map(f => f.region).filter(Boolean))),
      sourceTypes: [
        { value: 'standard', label: '標準資料庫' },
        { value: 'pact', label: 'PACT交換' },
        { value: 'supplier', label: '供應商係數' },
        { value: 'user_defined', label: '自建係數' },
      ],
      units: Array.from(new Set(allFactors.map(f => f.unit)))
    }
  }, [activeTab])

  // 處理係數選擇
  const handleFactorToggle = (factorId: number) => {
    setSelectedFactorIds(prev =>
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    )

    // 清除驗證錯誤
    if (validationError) {
      setValidationError('')
    }
  }

  // 處理打開詳情面板
  const handleOpenDetailPanel = (factor: UnifiedFactor) => {
    setSelectedDetailFactor(factor)
    setIsDetailPanelOpen(true)
  }

  // 處理關閉詳情面板
  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setSelectedDetailFactor(null)
  }

  // 移除已選係數
  const handleRemoveSelected = (factorId: number) => {
    setSelectedFactorIds(prev => prev.filter(id => id !== factorId))
  }

  // 清空所有選擇
  const handleClearAll = () => {
    setSelectedFactorIds([])
  }

  // 確認選擇
  const handleConfirm = () => {
    // 驗證是否至少選擇一個係數
    if (selectedFactors.length === 0) {
      setValidationError('請至少選擇一個係數')
      return
    }

    // 清除錯誤並執行確認
    setValidationError('')
    onConfirm(selectedFactors)
  }

  // 來源類型 Badge
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

  // 數據品質 Badge - 只顯示 PRIMARY 和 SECONDARY
  const getDataQualityBadge = (factor: UnifiedFactor) => {
    // 根據 dataSource 決定數據品質
    // local (中央係數庫) -> Primary
    // global (希達係數庫) -> Secondary
    const isPrimary = factor.dataSource === 'local'

    return (
      <Badge
        size="sm"
        colorScheme={isPrimary ? 'green' : 'yellow'}
        variant="solid"
      >
        {isPrimary ? 'PRIMARY' : 'SECONDARY'}
      </Badge>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" maxW="90vw" display="flex" flexDirection="column">
        <ModalHeader flexShrink={0}>選擇排放係數</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6} overflowY="auto" flex="1" minH={0}>
          <Tabs index={activeTab} onChange={setActiveTab}>
            {/* 標籤切換 */}
            <TabList>
              <Tab>中央係數庫 ({localFactors.length})</Tab>
              <Tab>希達係數庫 ({globalFactorsData.length})</Tab>
            </TabList>

          <VStack spacing={4} align="stretch" mt={4}>

            {/* 搜尋和篩選區 */}
            <Box py={4} flexShrink={0}>
              <HStack spacing={3}>
                <InputGroup flex={1}>
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="搜尋係數名稱、單位或地區..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {/* 篩選器 Popover */}
                <Popover placement="bottom-start">
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<SettingsIcon />}
                      rightIcon={<ChevronDownIcon />}
                    >
                      篩選
                      {(selectedSourceTypes.length > 0 || selectedRegions.length > 0 || selectedUnits.length > 0) && (
                        <Badge ml={2} colorScheme="blue" borderRadius="full">
                          {selectedSourceTypes.length + selectedRegions.length + selectedUnits.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent w="320px">
                    <PopoverArrow />
                    <PopoverHeader fontWeight="semibold" border="0" pb={2}>
                      進階篩選
                    </PopoverHeader>
                    <PopoverBody maxH="400px" overflowY="auto">
                      <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
                        {/* 來源類型篩選 */}
                        <AccordionItem border="none">
                          <AccordionButton px={0}>
                            <Box flex="1" textAlign="left">
                              <Text fontSize="sm" fontWeight="medium">來源類型</Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel px={0} pb={4}>
                            <CheckboxGroup
                              value={selectedSourceTypes}
                              onChange={(value) => setSelectedSourceTypes(value as string[])}
                            >
                              <VStack align="start" spacing={2}>
                                {filterOptions.sourceTypes.map((sourceType) => (
                                  <Checkbox key={sourceType.value} value={sourceType.value} size="sm">
                                    {sourceType.label}
                                  </Checkbox>
                                ))}
                              </VStack>
                            </CheckboxGroup>
                          </AccordionPanel>
                        </AccordionItem>

                        {/* 地區篩選 */}
                        <AccordionItem border="none">
                          <AccordionButton px={0}>
                            <Box flex="1" textAlign="left">
                              <Text fontSize="sm" fontWeight="medium">地區</Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel px={0} pb={4}>
                            <CheckboxGroup
                              value={selectedRegions}
                              onChange={(value) => setSelectedRegions(value as string[])}
                            >
                              <VStack align="start" spacing={2} maxH="200px" overflowY="auto">
                                {filterOptions.regions.map((region) => (
                                  <Checkbox key={region} value={region} size="sm">
                                    {region}
                                  </Checkbox>
                                ))}
                              </VStack>
                            </CheckboxGroup>
                          </AccordionPanel>
                        </AccordionItem>

                        {/* 單位篩選 */}
                        <AccordionItem border="none">
                          <AccordionButton px={0}>
                            <Box flex="1" textAlign="left">
                              <Text fontSize="sm" fontWeight="medium">單位</Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel px={0} pb={4}>
                            <CheckboxGroup
                              value={selectedUnits}
                              onChange={(value) => setSelectedUnits(value as string[])}
                            >
                              <VStack align="start" spacing={2} maxH="200px" overflowY="auto">
                                {filterOptions.units.map((unit) => (
                                  <Checkbox key={unit} value={unit} size="sm">
                                    {unit}
                                  </Checkbox>
                                ))}
                              </VStack>
                            </CheckboxGroup>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>

                <Button size="sm" variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedRegions([])
                  setSelectedSourceTypes([])
                  setSelectedUnits([])
                }}>
                  清除篩選
                </Button>
              </HStack>
            </Box>

            {/* 係數列表 - 全寬 */}
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                找到 {filteredFactors.length} 筆係數
              </Text>

              <Box border="1px solid" borderColor="gray.200" borderRadius="md">
                <Table size="sm" variant="simple">
                  <Thead position="sticky" top={0} bg="white" zIndex={1} boxShadow="sm">
                    <Tr>
                      <Th width="40px"></Th>
                      <Th width="35%">名稱</Th>
                      <Th width="18%" isNumeric>排放係數</Th>
                      <Th width="12%">國家/區域</Th>
                      <Th width="20%">係數來源</Th>
                      <Th width="15%">數據品質</Th>
                    </Tr>
                  </Thead>
                      <Tbody>
                        {filteredFactors.map((factor) => {
                          const isSelected = selectedFactorIds.includes(factor.id)

                          return (
                            <Tr
                              key={factor.id}
                              bg={isSelected ? 'blue.50' : 'transparent'}
                              _hover={{ bg: isSelected ? 'blue.100' : 'gray.50', cursor: 'pointer' }}
                              onClick={() => handleOpenDetailPanel(factor)}
                            >
                                <Td>
                                  <Checkbox
                                    isChecked={isSelected}
                                    onChange={() => handleFactorToggle(factor.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Td>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={1}>
                                      <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                                        {factor.name}
                                      </Text>
                                      {factor.requires_gwp_conversion && (
                                        <Tooltip
                                          label={`此係數包含多種氣體（CO₂${factor.ch4_factor ? ', CH₄' : ''}${factor.n2o_factor ? ', N₂O' : ''}），需選擇 GWP 版本轉換`}
                                          placement="top"
                                        >
                                          <Icon as={SettingsIcon} color="orange.500" boxSize={3} />
                                        </Tooltip>
                                      )}
                                    </HStack>
                                    <HStack spacing={1}>
                                      {factor.dataSource === 'global' && (
                                        <Badge size="xs" colorScheme="cyan">全庫</Badge>
                                      )}
                                      {factor.requires_gwp_conversion && (
                                        <Badge size="xs" colorScheme="orange">需GWP轉換</Badge>
                                      )}
                                    </HStack>
                                  </VStack>
                                </Td>
                                <Td isNumeric>
                                  <VStack align="end" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
                                      {formatNumber(factor.value)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {factor.unit}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">{factor.region || '台灣'}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" noOfLines={2}>
                                    {factor.source_ref || factor.source || 'ecoinvent'}
                                  </Text>
                                </Td>
                                <Td>
                                  {getDataQualityBadge(factor)}
                                </Td>
                              </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>

                {filteredFactors.length === 0 && (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Text>沒有找到符合條件的係數</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </VStack>
          </Tabs>
        </ModalBody>

        {/* 遮罩層 */}
        {isDetailPanelOpen && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.500"
            zIndex={100}
            onClick={handleCloseDetailPanel}
            cursor="pointer"
          />
        )}

        {/* 右側滑出詳情面板 */}
        {isDetailPanelOpen && selectedDetailFactor && (
          <Box
            position="absolute"
            top={0}
            right={0}
            w="420px"
            h="100%"
            bg="white"
            borderLeft="1px solid"
            borderColor="gray.200"
            overflow="auto"
            boxShadow="-2px 0 10px rgba(0,0,0,0.1)"
            zIndex={101}
            transform="translateX(0)"
            transition="transform 0.3s ease-in-out"
          >
            {/* 關閉按鈕 */}
            <CloseButton
              position="absolute"
              top={4}
              right={4}
              zIndex={102}
              onClick={handleCloseDetailPanel}
              size="lg"
              bg="gray.100"
              _hover={{ bg: "gray.200" }}
            />

            {/* 詳情內容 */}
            <VStack spacing={6} align="stretch" p={6} pt={16}>
              {/* 標題 */}
              <Box>
                <HStack spacing={2} mb={2}>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedDetailFactor.name}
                  </Text>
                  {selectedDetailFactor.requires_gwp_conversion && (
                    <Badge colorScheme="orange">需GWP轉換</Badge>
                  )}
                </HStack>
                <HStack spacing={2}>
                  {getSourceTypeBadge(selectedDetailFactor.source_type)}
                  {selectedDetailFactor.dataSource === 'global' && (
                    <Badge size="sm" colorScheme="cyan">全庫搜尋</Badge>
                  )}
                </HStack>
              </Box>

              <Divider />

              {/* 係數資訊區塊 */}
              <Box>
                <HStack mb={3}>
                  <Icon as={InfoIcon} color="blue.600" boxSize={4} />
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    係數資訊
                  </Text>
                </HStack>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={6}>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                          排放係數
                        </Text>
                        <Text fontSize="md" fontWeight="bold" fontFamily="mono">
                          {formatNumber(selectedDetailFactor.value)} {selectedDetailFactor.unit}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                          年份
                        </Text>
                        <Text fontSize="sm" color="gray.800">
                          {selectedDetailFactor.year || 2024}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack spacing={6}>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                          國家/區域
                        </Text>
                        <Text fontSize="sm" color="gray.800">
                          {selectedDetailFactor.region || '台灣'}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                          方法學
                        </Text>
                        <Text fontSize="sm" color="gray.800">
                          {selectedDetailFactor.method_gwp || 'GWP100'}
                        </Text>
                      </Box>
                    </HStack>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                        係數來源
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {selectedDetailFactor.source_ref || selectedDetailFactor.source || 'ecoinvent'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                        版本
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {selectedDetailFactor.version || 'v1.0'}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* 排放係數區塊 - 使用 EmissionFactorCards */}
              {(selectedDetailFactor.co2_factor || selectedDetailFactor.ch4_factor || selectedDetailFactor.n2o_factor) && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={InfoIcon} color="green.600" boxSize={4} />
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                      排放係數
                    </Text>
                  </HStack>
                  <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <EmissionFactorCards
                      co2_factor={selectedDetailFactor.co2_factor || selectedDetailFactor.value}
                      co2_unit={selectedDetailFactor.co2_unit || selectedDetailFactor.unit}
                      ch4_factor={selectedDetailFactor.ch4_factor}
                      ch4_unit={selectedDetailFactor.ch4_unit}
                      n2o_factor={selectedDetailFactor.n2o_factor}
                      n2o_unit={selectedDetailFactor.n2o_unit}
                    />
                  </Box>
                </Box>
              )}

              {/* 組合係數計算公式 */}
              {selectedDetailFactor.type === 'composite_factor' && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={InfoIcon} color="purple.600" boxSize={4} />
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                      計算公式
                    </Text>
                  </HStack>
                  <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="purple.200">
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">計算方式：</Text>
                        <Badge colorScheme="purple">組合計算</Badge>
                      </HStack>
                      <HStack justify="space-between" p={2} bg="purple.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="purple.800">結果：</Text>
                        <Text fontSize="lg" fontWeight="bold" fontFamily="mono" color="purple.700">
                          {formatNumber(selectedDetailFactor.value)} {selectedDetailFactor.unit}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        <ModalFooter flexShrink={0} flexDirection="column" alignItems="stretch" gap={3}>
          {/* 已選係數區域 */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                已選係數 ({selectedFactors.length})
              </Text>
              {selectedFactors.length > 0 && (
                <Button size="xs" variant="ghost" onClick={handleClearAll} colorScheme="red">
                  清空全部
                </Button>
              )}
            </HStack>

            {/* 橫向滾動的已選係數卡片 */}
            <Box
              overflowX="auto"
              css={{
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CBD5E0',
                  borderRadius: '3px',
                },
              }}
            >
              {selectedFactors.length > 0 ? (
                <HStack spacing={2} pb={2}>
                  {selectedFactors.map((factor) => (
                    <Card
                      key={factor.id}
                      size="sm"
                      minW="200px"
                      maxW="250px"
                      variant="outline"
                      bg="blue.50"
                      borderColor="blue.200"
                    >
                      <CardBody p={2}>
                        <HStack justify="space-between" spacing={2}>
                          <VStack align="start" spacing={0.5} flex={1} minW={0}>
                            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                              {factor.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600" fontFamily="mono">
                              {formatNumber(factor.value)} {factor.unit}
                            </Text>
                            <HStack spacing={1}>
                              {getSourceTypeBadge(factor.source_type)}
                              {factor.dataSource === 'global' && (
                                <Badge size="xs" colorScheme="cyan">全庫</Badge>
                              )}
                            </HStack>
                          </VStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            minW="auto"
                            h="auto"
                            p={1}
                            onClick={() => handleRemoveSelected(factor.id)}
                          >
                            <CloseIcon boxSize={2} />
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </HStack>
              ) : (
                <Box
                  textAlign="center"
                  py={3}
                  color="gray.400"
                  fontSize="sm"
                  border="2px dashed"
                  borderColor={validationError ? "red.300" : "transparent"}
                  borderRadius="md"
                >
                  尚未選擇係數
                </Box>
              )}
            </Box>

            {/* 驗證錯誤訊息 */}
            {validationError && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {validationError}
              </Text>
            )}
          </Box>

          <Divider />

          {/* 操作按鈕區域 */}
          <HStack w="100%" justify="space-between">
            <Box>
              {targetUnit && (
                <Alert status="info" size="sm" borderRadius="md" py={1}>
                  <AlertIcon />
                  <Text fontSize="xs">目標單位：{targetUnit}</Text>
                </Alert>
              )}
            </Box>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirm}
                leftIcon={<CheckIcon />}
              >
                確認加入 ({selectedFactors.length} 項)
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}