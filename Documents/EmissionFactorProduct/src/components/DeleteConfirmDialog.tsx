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
import { useRef } from 'react'

// 紅色圓形驚嘆號圖示
const DangerIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="white" />
  </Icon>
)

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  factorName: string
  factorType: 'emission_factor' | 'composite_factor'
  usageInfo?: {
    usedInProjects: number
    usedInComposites: string[]
    usedInDatasets: number
  }
  isLoading?: boolean
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  factorName,
  factorType,
  usageInfo,
  isLoading = false
}: DeleteConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  const hasUsage = usageInfo && (
    usageInfo.usedInProjects > 0 ||
    usageInfo.usedInComposites.length > 0 ||
    usageInfo.usedInDatasets > 0
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl">
        <ModalHeader pb={0}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">確認刪除係數</Text>
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

            {/* 係數資訊 */}
            <VStack spacing={2}>
              <HStack spacing={2}>
                <Text fontWeight="medium">{factorName}</Text>
                <Badge colorScheme={factorType === 'composite_factor' ? 'orange' : 'blue'} size="sm">
                  {factorType === 'composite_factor' ? '組合係數' : '排放係數'}
                </Badge>
              </HStack>

              {hasUsage ? (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  此係數正被 {usageInfo!.usedInProjects > 0 ? `${usageInfo!.usedInProjects} 個專案` : ''}
                  {usageInfo!.usedInComposites.length > 0 ? `、${usageInfo!.usedInComposites.length} 個組合係數` : ''}
                  {usageInfo!.usedInDatasets > 0 ? `、${usageInfo!.usedInDatasets} 個資料集` : ''} 使用中
                </Text>
              ) : (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  確定要刪除此係數嗎？此操作無法復原。
                </Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt={0}>
          <HStack spacing={3} justify="flex-end">
            <Button
              ref={cancelRef}
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="刪除中..."
            >
              Delete
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
