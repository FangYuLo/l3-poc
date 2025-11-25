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
} from '@chakra-ui/react'

// 紅色圓形驚嘆號圖示
const DangerIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="white" />
  </Icon>
)

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl">
        <ModalHeader pb={0}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">無法刪除已匯入的係數</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={4}>
            {/* 紅色圓形驚嘆號圖示 */}
            <Box
              w={12}
              h={12}
              borderRadius="full"
              bg="red.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <DangerIcon color="red.500" boxSize={6} />
            </Box>

            {/* 說明訊息 */}
            <VStack spacing={2}>
              <Text fontWeight="medium">{factor.name}</Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                此係數已匯入至中央係數庫，請先從中央庫移除後再刪除。
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt={0}>
          <HStack spacing={3} justify="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
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
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
