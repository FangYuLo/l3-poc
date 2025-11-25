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
import { FactorTableItem } from '@/types/types'

interface BatchImportConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedFactors: FactorTableItem[]
  onConfirm: () => Promise<void>
  isProcessing: boolean
}

export default function BatchImportConfirmDialog({
  isOpen,
  onClose,
  selectedFactors,
  onConfirm,
  isProcessing,
}: BatchImportConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl">
        <ModalHeader pb={0}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">批次加入中央庫</Text>
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

            {/* 確認訊息 */}
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                您即將加入 <Text as="span" fontWeight="bold">{selectedFactors.length}</Text> 個係數到中央庫
              </Text>

              {/* 係數列表預覽（最多顯示5個） */}
              {selectedFactors.length <= 5 && (
                <Box
                  maxH="150px"
                  overflowY="auto"
                  w="100%"
                  mt={2}
                >
                  <VStack align="stretch" spacing={1}>
                    {selectedFactors.map((factor, index) => (
                      <HStack key={factor.id} spacing={2} justify="center">
                        <Badge colorScheme="blue" fontSize="xs">
                          {index + 1}
                        </Badge>
                        <Text fontSize="xs" color="gray.600">{factor.name}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt={0}>
          <HStack spacing={3} justify="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleConfirm}
              isLoading={isProcessing}
              loadingText="加入中..."
            >
              Confirm
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
