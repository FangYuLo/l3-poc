import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Divider,
  Icon,
  Tooltip,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react'
import { 
  ArrowRightIcon, 
  InfoIcon, 
  CheckIcon,
  WarningTwoIcon 
} from '@chakra-ui/icons'
import { RelatedFactorInfo } from '@/hooks/useMockData'

interface RelatedFactorComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  relatedFactors: RelatedFactorInfo[]
}

/**
 * 相關係數對比模態框
 * 顯示新舊係數的詳細對比，支援選擇性批次匯入
 */
export function RelatedFactorComparisonModal({
  isOpen,
  onClose,
  relatedFactors
}: RelatedFactorComparisonModalProps) {
  const [selectedFactors, setSelectedFactors] = useState<Set<number>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const toast = useToast()
  
  const tableBg = useColorModeValue('white', 'gray.800')
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700')

  // 按關聯類型分組
  const parentSourceFactors = relatedFactors.filter(f => f.relationshipType === 'parent_source')
  const familyFactors = relatedFactors.filter(f => f.relationshipType === 'source_family')

  const handleSelectFactor = (factorId: number) => {
    const newSelection = new Set(selectedFactors)
    if (newSelection.has(factorId)) {
      newSelection.delete(factorId)
    } else {
      newSelection.add(factorId)
    }
    setSelectedFactors(newSelection)
  }

  const handleSelectAll = (factors: RelatedFactorInfo[]) => {
    const factorIds = factors.map(f => f.newFactorId)
    const allSelected = factorIds.every(id => selectedFactors.has(id))
    
    const newSelection = new Set(selectedFactors)
    if (allSelected) {
      factorIds.forEach(id => newSelection.delete(id))
    } else {
      factorIds.forEach(id => newSelection.add(id))
    }
    setSelectedFactors(newSelection)
  }

  const handleBatchImport = async () => {
    if (selectedFactors.size === 0) {
      toast({
        title: '請選擇要匯入的係數',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsImporting(true)
    try {
      // 模擬匯入延遲
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: '匯入成功',
        description: `已成功匯入 ${selectedFactors.size} 筆新係數到中央庫`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
      
      onClose()
    } catch (error) {
      toast({
        title: '匯入失敗',
        description: '發生未知錯誤，請稍後再試',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const renderFactorComparison = (factors: RelatedFactorInfo[], title: string, description: string) => {
    if (factors.length === 0) return null

    const allSelected = factors.every(f => selectedFactors.has(f.newFactorId))
    const someSelected = factors.some(f => selectedFactors.has(f.newFactorId))

    return (
      <Box>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" fontSize="md">{title}</Text>
            <Text fontSize="sm" color="gray.600">{description}</Text>
          </VStack>
          <Checkbox
            isChecked={allSelected}
            isIndeterminate={someSelected && !allSelected}
            onChange={() => handleSelectAll(factors)}
          >
            全選
          </Checkbox>
        </HStack>

        <Box bg={tableBg} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th width="40px"></Th>
                <Th>係數名稱</Th>
                <Th>舊值</Th>
                <Th width="40px"></Th>
                <Th>新值</Th>
                <Th>變化</Th>
                <Th>來源</Th>
              </Tr>
            </Thead>
            <Tbody>
              {factors.map((factor) => {
                const isSelected = selectedFactors.has(factor.newFactorId)
                const { comparisonData } = factor
                
                return (
                  <Tr 
                    key={factor.newFactorId}
                    bg={isSelected ? 'blue.50' : 'transparent'}
                    _hover={{ bg: rowHoverBg }}
                    cursor="pointer"
                    onClick={() => handleSelectFactor(factor.newFactorId)}
                  >
                    <Td>
                      <Checkbox
                        isChecked={isSelected}
                        onChange={() => handleSelectFactor(factor.newFactorId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm">{factor.newFactorName}</Text>
                        <Text fontSize="xs" color="gray.500">{factor.relatedFactorName}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {comparisonData.oldValue} {comparisonData.unit}
                      </Text>
                    </Td>
                    <Td>
                      <Icon as={ArrowRightIcon} color="gray.400" />
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="medium">
                        {comparisonData.newValue} {comparisonData.unit}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        size="sm"
                        colorScheme={comparisonData.changePercentage >= 0 ? 'red' : 'green'}
                      >
                        {comparisonData.changePercentage >= 0 ? '+' : ''}{comparisonData.changePercentage}%
                      </Badge>
                    </Td>
                    <Td>
                      <Tooltip label={factor.newFactorSource} fontSize="xs">
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {factor.newFactorSource.split(' - ')[0]}
                        </Text>
                      </Tooltip>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <Text>係數更新對比</Text>
            <Badge colorScheme="blue">{relatedFactors.length} 筆</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            {/* 說明資訊 */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  以下係數在中央庫中有對應的舊版本，您可以選擇性地匯入新版本係數。
                  建議檢視變化幅度，確認是否符合您的使用需求。
                </Text>
              </Box>
            </Alert>

            {/* 分頁顯示不同類型的關聯 */}
            <Tabs variant="enclosed">
              <TabList>
                {parentSourceFactors.length > 0 && (
                  <Tab>
                    <HStack>
                      <Text>母資料源更新</Text>
                      <Badge size="sm" colorScheme="blue">
                        {parentSourceFactors.length}
                      </Badge>
                    </HStack>
                  </Tab>
                )}
                {familyFactors.length > 0 && (
                  <Tab>
                    <HStack>
                      <Text>同系列係數更新</Text>
                      <Badge size="sm" colorScheme="green">
                        {familyFactors.length}
                      </Badge>
                    </HStack>
                  </Tab>
                )}
              </TabList>

              <TabPanels>
                {parentSourceFactors.length > 0 && (
                  <TabPanel p={0} pt={4}>
                    {renderFactorComparison(
                      parentSourceFactors,
                      '母資料源更新',
                      '這些係數是您中央庫現有係數的直接更新版本'
                    )}
                  </TabPanel>
                )}
                {familyFactors.length > 0 && (
                  <TabPanel p={0} pt={4}>
                    {renderFactorComparison(
                      familyFactors,
                      '同系列係數更新',
                      '這些係數與您中央庫的現有係數來自同一資料源系列'
                    )}
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.500">
              已選擇 {selectedFactors.size} 筆係數
            </Text>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBatchImport}
              isLoading={isImporting}
              loadingText="匯入中..."
              isDisabled={selectedFactors.size === 0}
            >
              匯入選中的係數
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RelatedFactorComparisonModal