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
  Icon,
  Box,
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { ReactNode, useRef } from 'react'

// 錯誤/刪除圖示（紅色圓形驚嘆號）
const DangerIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="white" />
  </Icon>
)

export type DialogVariant = 'success' | 'warning' | 'danger' | 'info'

interface BaseDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  variant?: DialogVariant
  children?: ReactNode
  primaryButtonText?: string
  primaryButtonAction?: () => void
  secondaryButtonText?: string
  secondaryButtonAction?: () => void
  isLoading?: boolean
  loadingText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const variantConfig = {
  success: {
    icon: CheckCircleIcon,
    iconColor: 'green.500',
    iconBg: 'green.100',
    primaryColor: 'blue',
  },
  warning: {
    icon: WarningIcon,
    iconColor: 'yellow.500',
    iconBg: 'yellow.100',
    primaryColor: 'blue',
  },
  danger: {
    icon: DangerIcon,
    iconColor: 'red.500',
    iconBg: 'red.100',
    primaryColor: 'red',
  },
  info: {
    icon: InfoIcon,
    iconColor: 'blue.500',
    iconBg: 'blue.100',
    primaryColor: 'blue',
  },
}

export default function BaseDialog({
  isOpen,
  onClose,
  title,
  variant = 'info',
  children,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
  isLoading = false,
  loadingText,
  size = 'md',
}: BaseDialogProps) {
  const config = variantConfig[variant]
  const IconComponent = config.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl">
        <ModalHeader pb={0}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">{title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={4}>
            {/* 狀態圖示 */}
            <Box
              w={12}
              h={12}
              borderRadius="full"
              bg={config.iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={IconComponent} color={config.iconColor} boxSize={6} />
            </Box>

            {/* 內容 */}
            {children && (
              <Box textAlign="center" w="100%">
                {children}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter pt={0}>
          <HStack spacing={3} justify="flex-end">
            {secondaryButtonText && (
              <Button
                variant="outline"
                onClick={secondaryButtonAction || onClose}
                isDisabled={isLoading}
              >
                {secondaryButtonText}
              </Button>
            )}
            {primaryButtonText && (
              <Button
                colorScheme={config.primaryColor}
                onClick={primaryButtonAction}
                isLoading={isLoading}
                loadingText={loadingText}
              >
                {primaryButtonText}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
