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
  Badge,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { formatDate } from '@/lib/utils'
import { getSyncStatus } from '@/hooks/useMockData'

interface ImportedFactorInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  factor: any
  onNavigateToCentral: (factor: any) => void
}

export default function ImportedFactorInfoDialog({
  isOpen,
  onClose,
  factor,
  onNavigateToCentral
}: ImportedFactorInfoDialogProps) {
  if (!factor) return null

  const syncStatus = getSyncStatus(factor)
  const isSynced = syncStatus === 'synced'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={CheckCircleIcon} color="green.500" boxSize={6} />
            <Text>係數已匯入中央庫</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 係數資訊 */}
            <Box bg="gray.50" p={4} borderRadius="md">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">係數名稱：</Text>
                  <Text fontSize="sm" fontWeight="bold">{factor.name}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">匯入時間：</Text>
                  <Text fontSize="sm">{formatDate(factor.imported_at)}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">當前版本：</Text>
                  <Badge colorScheme="blue">{factor.version || 'v1.0'}</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">同步狀態：</Text>
                  <Badge colorScheme={isSynced ? 'green' : 'orange'}>
                    {isSynced ? '✓ 已同步' : '⚠️ 需要同步'}
                  </Badge>
                </HStack>

                {factor.last_synced_version && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">中央庫版本：</Text>
                    <Text fontSize="sm">{factor.last_synced_version}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* 說明文字 */}
            <Box>
              <Text fontSize="sm" color="gray.600">
                此係數已成功匯入至中央係數庫，可供專案引用使用。
                {!isSynced && ' 目前本地版本與中央庫版本不一致，建議進行同步。'}
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            關閉
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
