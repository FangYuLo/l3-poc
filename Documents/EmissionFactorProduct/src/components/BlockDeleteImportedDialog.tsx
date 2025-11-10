'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  OrderedList,
  ListItem,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { formatDate } from '@/lib/utils'
import { getSyncStatus } from '@/hooks/useMockData'

interface BlockDeleteImportedDialogProps {
  isOpen: boolean
  onClose: () => void
  factor: any
  onNavigateToCentral: (factor: any) => void
}

export default function BlockDeleteImportedDialog({
  isOpen,
  onClose,
  factor,
  onNavigateToCentral
}: BlockDeleteImportedDialogProps) {
  if (!factor) return null

  const syncStatus = getSyncStatus(factor)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={WarningIcon} color="orange.500" boxSize={6} />
            <Text>無法刪除已匯入的係數</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 說明 */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  此係數已匯入至中央係數庫
                </Text>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  為確保數據一致性，請先從中央庫移除後再刪除
                </Text>
              </Box>
            </Alert>

            <Divider />

            {/* 係數資訊 */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                係數資訊
              </Text>
              <VStack spacing={2} align="stretch" pl={4}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">係數名稱：</Text>
                  <Text fontSize="sm" fontWeight="medium">{factor.name}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">匯入時間：</Text>
                  <Text fontSize="sm">{formatDate(factor.imported_at)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">同步狀態：</Text>
                  <Text fontSize="sm" color={syncStatus === 'synced' ? 'green.600' : 'orange.600'}>
                    {syncStatus === 'synced' ? '✓ 已同步' : '⚠️ 需要同步'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">中央庫版本：</Text>
                  <Text fontSize="sm">{factor.last_synced_version || 'v1.0'}</Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* 操作步驟 */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                如何刪除此係數
              </Text>
              <OrderedList spacing={2} pl={4} fontSize="sm" color="gray.600">
                <ListItem>前往中央係數庫</ListItem>
                <ListItem>找到並選擇此係數</ListItem>
                <ListItem>點擊「從中央係數庫移除」</ListItem>
                <ListItem>確認移除後，即可刪除此自建係數</ListItem>
              </OrderedList>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onNavigateToCentral(factor)
              onClose()
            }}
          >
            前往中央庫
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
