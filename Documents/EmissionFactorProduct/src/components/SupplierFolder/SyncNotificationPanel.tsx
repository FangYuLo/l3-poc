'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { FiClock, FiUser, FiPackage } from 'react-icons/fi'
import { SupplierSyncRecord } from '@/types/types'

interface SyncNotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  syncRecords: SupplierSyncRecord[]
  onSupplierClick?: (supplierId: string) => void
  onBatchReview?: (syncId: string) => void
  onMarkAllRead?: () => void
}

export default function SyncNotificationPanel({
  isOpen,
  onClose,
  syncRecords,
  onSupplierClick,
  onBatchReview,
  onMarkAllRead,
}: SyncNotificationPanelProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // 格式化時間
  const formatDateTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Badge colorScheme="red" borderRadius="full" px={2}>
              {syncRecords.length}
            </Badge>
            <Text>新同步資料通知</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {syncRecords.map(record => (
              <Box
                key={record.sync_id}
                p={4}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
              >
                <VStack align="stretch" spacing={3}>
                  {/* 專案資訊 */}
                  <Box>
                    <Text fontWeight="bold" fontSize="md">
                      來源專案: {record.project_name}
                    </Text>
                    <HStack fontSize="sm" color="gray.500" mt={1} spacing={4}>
                      <HStack>
                        <Icon as={FiClock} />
                        <Text>同步時間: {formatDateTime(record.sync_timestamp)}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiUser} />
                        <Text>負責人: {record.project_manager}</Text>
                      </HStack>
                    </HStack>
                  </Box>

                  <Divider />

                  {/* 新增供應商列表 */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      新增供應商 ({record.new_suppliers.length}家):
                    </Text>
                    <List spacing={1}>
                      {record.new_suppliers.map(supplier => (
                        <ListItem
                          key={supplier.supplier_id}
                          fontSize="sm"
                          cursor="pointer"
                          _hover={{ color: 'blue.500' }}
                          onClick={() => onSupplierClick?.(supplier.supplier_id)}
                        >
                          <ListIcon as={FiPackage} color="blue.400" />
                          {supplier.company_name} - {supplier.product_count}個產品
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* 操作按鈕 */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => onBatchReview?.(record.sync_id)}
                    >
                      批次審核
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // 跳轉到第一個供應商
                        if (record.new_suppliers.length > 0) {
                          onSupplierClick?.(record.new_suppliers[0].supplier_id)
                          onClose()
                        }
                      }}
                    >
                      逐一查看
                    </Button>
                    <Button size="sm" variant="ghost">
                      稍後處理
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            ))}

            {syncRecords.length === 0 && (
              <Box textAlign="center" py={8}>
                <Icon as={CheckIcon} boxSize={12} color="green.400" mb={4} />
                <Text color="gray.500">沒有未讀的同步通知</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            關閉
          </Button>
          {syncRecords.length > 0 && (
            <Button colorScheme="blue" onClick={onMarkAllRead}>
              全部標記已讀
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
