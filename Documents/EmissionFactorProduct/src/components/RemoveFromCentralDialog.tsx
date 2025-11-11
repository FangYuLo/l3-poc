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
  AlertDescription,
  Badge,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import { InfoIcon, WarningIcon } from '@chakra-ui/icons'
import { useState } from 'react'

interface RemoveFromCentralDialogProps {
  isOpen: boolean
  onClose: () => void
  factor: any
  onConfirm: () => Promise<void>
  usageInfo?: {
    isUsed: boolean
    usageCount: number
    usedInProjects: string[]
  }
}

export default function RemoveFromCentralDialog({
  isOpen,
  onClose,
  factor,
  onConfirm,
  usageInfo
}: RemoveFromCentralDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  if (!factor) return null

  const handleConfirm = async () => {
    setIsRemoving(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={InfoIcon} color="blue.500" boxSize={6} />
            <Text>從中央係數庫移除？</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 係數資訊 */}
            <Box bg="gray.50" p={4} borderRadius="md">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">係數名稱：</Text>
                  <Text fontSize="sm" fontWeight="bold">{factor.name}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">當前版本：</Text>
                  <Badge colorScheme="blue">{factor.version || 'v1.0'}</Badge>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* 影響說明 */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={2}>
                ⚠️ 移除後影響
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                係數將從中央庫移除，原自建係數恢復為「未匯入」狀態，之後可重新匯入或刪除。
              </Text>
            </Box>

            {/* 使用情況警告 */}
            {usageInfo?.isUsed && (
              <>
                <Divider />
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="bold">
                      📊 使用情況警告
                    </Text>
                    <AlertDescription fontSize="xs" mt={1}>
                      此係數正被 <strong>{usageInfo.usageCount}</strong> 個專案使用，
                      移除後這些專案可能無法正常顯示此係數資訊
                    </AlertDescription>
                    {usageInfo.usedInProjects.length > 0 && (
                      <Box mt={2}>
                        <Text fontSize="xs" color="gray.600">使用專案：</Text>
                        <UnorderedList fontSize="xs" pl={4} mt={1}>
                          {usageInfo.usedInProjects.slice(0, 3).map((project, idx) => (
                            <ListItem key={idx}>{project}</ListItem>
                          ))}
                          {usageInfo.usedInProjects.length > 3 && (
                            <ListItem>...還有 {usageInfo.usedInProjects.length - 3} 個</ListItem>
                          )}
                        </UnorderedList>
                      </Box>
                    )}
                  </Box>
                </Alert>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isRemoving}>
            取消
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            isLoading={isRemoving}
            loadingText="移除中..."
          >
            確認移除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
