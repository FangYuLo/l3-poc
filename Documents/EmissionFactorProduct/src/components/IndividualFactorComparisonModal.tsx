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
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  Icon,
  Flex
} from '@chakra-ui/react'
import { 
  ArrowRightIcon
} from '@chakra-ui/icons'
import { ExtendedFactorTableItem, FactorUpdateInfo, useMockData } from '@/hooks/useMockData'
import { EmissionFactor } from '@/types/types'

interface IndividualFactorComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  currentFactor: ExtendedFactorTableItem
  updateInfo: FactorUpdateInfo
  onUpdateSuccess?: () => void
}

/**
 * 單筆係數對比彈窗組件
 * 顯示當前係數與新版本係數的詳細對比，支援一鍵更新
 */
export function IndividualFactorComparisonModal({
  isOpen,
  onClose,
  currentFactor,
  updateInfo,
  onUpdateSuccess
}: IndividualFactorComparisonModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()
  const { getAllFactorItems, addStandardFactorToCentral } = useMockData()
  
  const tableBg = useColorModeValue('white', 'gray.800')
  
  // 獲取新版本係數的完整資料
  const newFactor = getAllFactorItems().find(f => f.id === updateInfo.newFactorId) as EmissionFactor | undefined
  
  if (!newFactor) {
    return null
  }


  // 處理更新係數
  const handleUpdateFactor = async () => {
    setIsUpdating(true)
    try {
      // 模擬處理延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 將新版本係數加入中央庫
      const result = addStandardFactorToCentral(updateInfo.newFactorId)
      
      if (result.success) {
        toast({
          title: '更新成功',
          description: `已成功將新版本係數 "${newFactor.name}" 加入中央庫`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
        
        // 觸發成功回調
        onUpdateSuccess?.()
        onClose()
      } else {
        throw new Error(result.message || '更新失敗')
      }
    } catch (error) {
      toast({
        title: '更新失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 比較欄位資料
  const compareFields = [
    { label: '係數名稱', currentValue: currentFactor.name, newValue: newFactor.name },
    { label: '排放係數值', currentValue: `${currentFactor.value} ${currentFactor.unit}`, newValue: `${newFactor.value} ${newFactor.unit}` },
    { label: '版本', currentValue: currentFactor.version, newValue: newFactor.version },
    { label: '年份', currentValue: currentFactor.year?.toString() || '未知', newValue: newFactor.year?.toString() || '未知' },
    { label: '地區', currentValue: currentFactor.region || '未指定', newValue: newFactor.region || '未指定' },
    { label: '方法學', currentValue: currentFactor.method_gwp || '未指定', newValue: newFactor.method_gwp || '未指定' },
    { label: '資料來源', currentValue: currentFactor.source || '未知', newValue: newFactor.source || '未知' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text>係數更新對比</Text>
            <HStack>
              <Badge colorScheme="blue" size="sm">
                係數更新
              </Badge>
              {updateInfo.publisherInfo && (
                <Badge colorScheme="gray" size="sm">
                  {updateInfo.publisherInfo.name}
                </Badge>
              )}
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            {/* 更新摘要 */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">
                  發現係數更新版本
                </AlertTitle>
                {updateInfo.changePercentage !== undefined && (
                  <AlertDescription fontSize="xs">
                    數值變化：{updateInfo.changePercentage > 0 ? '+' : ''}{updateInfo.changePercentage.toFixed(2)}%
                  </AlertDescription>
                )}
              </Box>
            </Alert>

            {/* 對比表格 */}
            <Box bg={tableBg} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th width="120px">欄位</Th>
                    <Th>目前版本 ({updateInfo.currentVersion})</Th>
                    <Th width="40px"></Th>
                    <Th>新版本 ({updateInfo.newVersion})</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {compareFields.map((field, index) => {
                    const isChanged = field.currentValue !== field.newValue
                    const isValueField = field.label === '排放係數值'
                    
                    return (
                      <Tr 
                        key={index}
                        bg={isChanged ? 'blue.50' : 'transparent'}
                        _hover={{ bg: isChanged ? 'blue.100' : 'gray.50' }}
                      >
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {field.label}
                            {isChanged && <Badge colorScheme="blue" size="xs" ml={2}>改動</Badge>}
                          </Text>
                        </Td>
                        <Td>
                          <Text 
                            fontSize="sm" 
                            color={isChanged ? 'gray.600' : 'gray.800'}
                            fontWeight={isValueField ? 'medium' : 'normal'}
                          >
                            {field.currentValue}
                          </Text>
                        </Td>
                        <Td>
                          {isChanged && <Icon as={ArrowRightIcon} color="blue.500" />}
                        </Td>
                        <Td>
                          <Text 
                            fontSize="sm"
                            color={isChanged ? 'blue.600' : 'gray.800'}
                            fontWeight={isChanged && isValueField ? 'bold' : isValueField ? 'medium' : 'normal'}
                          >
                            {field.newValue}
                          </Text>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* 釋出單位資訊 */}
            {updateInfo.publisherInfo && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>釋出單位資訊</Text>
                <HStack spacing={4} fontSize="xs" color="gray.600">
                  <Text>發布機構：{updateInfo.publisherInfo.name}</Text>
                  <Text>資料庫演進：{updateInfo.publisherInfo.databaseEvolution}</Text>
                </HStack>
              </Box>
            )}

            {/* 更新說明 */}
            <Box fontSize="xs" color="gray.600">
              <Text>
                ℹ️ 更新後將在中央係數庫中新增此新版本係數，原有係數保持不變。
                您可以在專案中選擇使用新版本或繼續使用原版本。
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              暫不更新
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateFactor}
              isLoading={isUpdating}
              loadingText="更新中..."
            >
              更新到新版本
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default IndividualFactorComparisonModal