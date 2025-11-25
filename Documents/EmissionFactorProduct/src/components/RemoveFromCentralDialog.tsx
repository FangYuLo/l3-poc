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
  Badge,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
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
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl">
        <ModalHeader pb={0}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">從中央係數庫移除？</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={4}>
            {/* 黃色警告圖示 */}
            <Box
              w={12}
              h={12}
              borderRadius="full"
              bg="yellow.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={WarningIcon} color="yellow.500" boxSize={6} />
            </Box>

            {/* 係數資訊 */}
            <VStack spacing={2}>
              <HStack spacing={2}>
                <Text fontWeight="medium">{factor.name}</Text>
                <Badge colorScheme="blue">{factor.version || 'v1.0'}</Badge>
              </HStack>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                係數將自中央係數庫移除，之後可重新匯入。
                {usageInfo?.isUsed && (
                  <>
                    <br />
                    <Text as="span" color="orange.600">
                      此係數正被 {usageInfo.usageCount} 個專案使用
                    </Text>
                  </>
                )}
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt={0}>
          <HStack spacing={3} justify="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleConfirm}
              isLoading={isRemoving}
              loadingText="移除中..."
            >
              Confirm
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
