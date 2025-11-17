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
  Alert,
  AlertIcon,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={AddIcon} color="brand.500" />
            <Text>批次加入中央庫</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* 摘要資訊 */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">
                  您即將加入 {selectedFactors.length} 個係數到中央庫
                </Text>
                <Text fontSize="sm">
                  確認後這些係數將可在中央係數庫中使用
                </Text>
              </VStack>
            </Alert>

            {/* 係數列表 */}
            <Box>
              <Text fontWeight="bold" mb={2}>選中的係數：</Text>
              <Box
                maxH="300px"
                overflowY="auto"
                borderWidth="1px"
                borderRadius="md"
                p={3}
                bg="gray.50"
              >
                <VStack align="stretch" spacing={2}>
                  {selectedFactors.map((factor, index) => (
                    <HStack key={factor.id} justify="space-between">
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" fontSize="xs">
                          {index + 1}
                        </Badge>
                        <Text fontSize="sm">{factor.name}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {factor.value} {factor.unit}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isProcessing}>
            取消
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleConfirm}
            isLoading={isProcessing}
            loadingText="加入中..."
          >
            確認加入
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
