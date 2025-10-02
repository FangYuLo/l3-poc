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
  Flex,
  Spacer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import {
  SearchIcon,
  CheckIcon,
  CloseIcon,
} from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { formatNumber } from '@/lib/utils'

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
  version: string
  dataSource: 'local' | 'global'
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
      case 2: return [...localFactors, ...globalFactorsData]
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

  // 已選擇的係數
  const selectedFactors = useMemo(() => {
    const allFactors = [...localFactors, ...globalFactors]
    return allFactors.filter(factor => selectedFactorIds.includes(factor.id))
  }, [selectedFactorIds])

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

  // 單位相容性檢查
  const getUnitCompatibility = (unit: string) => {
    if (!targetUnit) return 'unknown'
    if (unit === targetUnit) return 'compatible'
    // 簡單的單位相容性檢查
    const normalize = (u: string) => u.toLowerCase().replace(/\s+/g, '')
    return normalize(unit) === normalize(targetUnit) ? 'compatible' : 'incompatible'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" maxW="90vw">
        <ModalHeader>選擇排放係數</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6} overflow="hidden">
          <VStack spacing={4} align="stretch" h="70vh">
            {/* 標籤切換 */}
            <Tabs index={activeTab} onChange={setActiveTab} display="flex" flexDirection="column" h="100%">
              <TabList>
                <Tab>中央係數庫 ({localFactors.length})</Tab>
                <Tab>全庫搜尋 ({globalFactorsData.length})</Tab>
                <Tab>全部 ({localFactors.length + globalFactorsData.length})</Tab>
              </TabList>

              {/* 搜尋和篩選區 */}
              <Box py={4} flexShrink={0}>
                <HStack spacing={4} mb={4}>
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
                  <Button size="sm" variant="outline" onClick={() => {
                    setSearchTerm('')
                    setSelectedRegions([])
                    setSelectedSourceTypes([])
                    setSelectedUnits([])
                  }}>
                    清除篩選
                  </Button>
                </HStack>

                {/* 快速篩選 */}
                <HStack spacing={4} wrap="wrap">
                  <Text fontSize="sm" fontWeight="medium">快速篩選：</Text>
                  <CheckboxGroup
                    value={selectedSourceTypes}
                    onChange={(value) => setSelectedSourceTypes(value as string[])}
                  >
                    <HStack wrap="wrap">
                      {filterOptions.sourceTypes.map((sourceType) => (
                        <Checkbox key={sourceType.value} value={sourceType.value} size="sm">
                          {sourceType.label}
                        </Checkbox>
                      ))}
                    </HStack>
                  </CheckboxGroup>
                </HStack>
              </Box>

              <HStack spacing={6} align="stretch" flex={1} overflow="hidden">
                {/* 左側：篩選面板 */}
                <Box w="250px" overflowY="auto" borderRight="1px solid" borderColor="gray.200" pr={4}>
                  <Accordion allowMultiple defaultIndex={[0, 1]}>
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
                          <VStack align="start" spacing={2} maxH="250px" overflowY="auto">
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
                          <VStack align="start" spacing={2} maxH="250px" overflowY="auto">
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
                </Box>

                {/* 中間：係數列表 */}
                <Box flex={1} overflowY="auto">
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    找到 {filteredFactors.length} 筆係數
                    {activeTab === 2 && ` (中央係數庫 ${localFactors.filter(f => !excludeIds.includes(f.id)).length} + 全庫 ${globalFactorsData.length})`}
                  </Text>
                  
                  <Table size="sm" variant="simple">
                    <Thead position="sticky" top={0} bg="white" zIndex={1}>
                      <Tr>
                        <Th width="40px"></Th>
                        <Th>係數名稱</Th>
                        <Th isNumeric>數值</Th>
                        <Th>單位</Th>
                        <Th>地區</Th>
                        <Th>來源</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredFactors.map((factor) => {
                        const isSelected = selectedFactorIds.includes(factor.id)
                        const unitCompatibility = getUnitCompatibility(factor.unit)
                        
                        return (
                          <Tr
                            key={factor.id}
                            bg={isSelected ? 'blue.50' : 'transparent'}
                            _hover={{ bg: isSelected ? 'blue.100' : 'gray.50' }}
                            cursor="pointer"
                            onClick={() => handleFactorToggle(factor.id)}
                          >
                            <Td>
                              <Checkbox
                                isChecked={isSelected}
                                onChange={() => handleFactorToggle(factor.id)}
                              />
                            </Td>
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">
                                {factor.name}
                              </Text>
                              {factor.dataSource === 'global' && (
                                <Badge size="xs" colorScheme="cyan" mt={1}>全庫</Badge>
                              )}
                            </Td>
                            <Td isNumeric>
                              <Text fontSize="sm" fontFamily="mono">
                                {formatNumber(factor.value)}
                              </Text>
                            </Td>
                            <Td>
                              <HStack>
                                <Text fontSize="sm">{factor.unit}</Text>
                                {targetUnit && unitCompatibility === 'incompatible' && (
                                  <Badge size="xs" colorScheme="red">不相容</Badge>
                                )}
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{factor.region || '-'}</Text>
                            </Td>
                            <Td>
                              {getSourceTypeBadge(factor.source_type)}
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

                {/* 右側：已選係數 */}
                <Box w="300px" overflowY="auto" borderLeft="1px solid" borderColor="gray.200" pl={4}>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="sm" fontWeight="medium">
                      已選係數 ({selectedFactors.length})
                    </Text>
                    {selectedFactors.length > 0 && (
                      <Button size="xs" variant="ghost" onClick={handleClearAll}>
                        清空全部
                      </Button>
                    )}
                  </HStack>

                  {selectedFactors.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {selectedFactors.map((factor) => (
                        <Card key={factor.id} size="sm">
                          <CardBody p={3}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontSize="xs" fontWeight="medium" noOfLines={2}>
                                  {factor.name}
                                </Text>
                                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                                  {formatNumber(factor.value)} {factor.unit}
                                </Text>
                                <HStack>
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
                                onClick={() => handleRemoveSelected(factor.id)}
                              >
                                <CloseIcon boxSize={2} />
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={8} color="gray.500">
                      <Text fontSize="sm">尚未選擇係數</Text>
                      <Text fontSize="xs" mt={1}>勾選左側列表中的係數</Text>
                    </Box>
                  )}
                </Box>
              </HStack>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack w="100%" justify="space-between">
            <Box>
              {targetUnit && (
                <Alert status="info" size="sm" borderRadius="md">
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
                isDisabled={selectedFactors.length === 0}
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