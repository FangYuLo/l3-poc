'use client'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { useRef } from 'react'

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

  const getFactorTypeBadge = () => {
    if (factorType === 'composite_factor') {
      return (
        <Badge colorScheme="orange" size="sm">
          組合係數
        </Badge>
      )
    }
    return (
      <Badge colorScheme="blue" size="sm">
        排放係數
      </Badge>
    )
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size="md"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <HStack spacing={3}>
              <WarningIcon color="red.500" />
              <Text>確認刪除係數</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  即將刪除的係數：
                </Text>
                <HStack spacing={2}>
                  <Text fontWeight="medium">{factorName}</Text>
                  {getFactorTypeBadge()}
                </HStack>
              </Box>

              {hasUsage ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    <Text fontWeight="medium" mb={2}>此係數正在被使用中：</Text>
                    <VStack align="start" spacing={1}>
                      {usageInfo!.usedInProjects > 0 && (
                        <Text fontSize="sm">• {usageInfo!.usedInProjects} 個專案中</Text>
                      )}
                      {usageInfo!.usedInComposites.length > 0 && (
                        <Text fontSize="sm">
                          • {usageInfo!.usedInComposites.length} 個組合係數中：
                          {usageInfo!.usedInComposites.map((name, index) => (
                            <Text key={index} fontSize="xs" color="gray.600" ml={4}>
                              - {name}
                            </Text>
                          ))}
                        </Text>
                      )}
                      {usageInfo!.usedInDatasets > 0 && (
                        <Text fontSize="sm">• {usageInfo!.usedInDatasets} 個資料集中</Text>
                      )}
                    </VStack>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    此係數目前未被任何專案、組合係數或資料集使用，可以安全刪除。
                  </AlertDescription>
                </Alert>
              )}

              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <Text fontWeight="medium" mb={1}>注意：</Text>
                  <Text>刪除後將無法復原。{hasUsage ? '相關引用將會失效。' : ''}</Text>
                </AlertDescription>
              </Alert>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={3}>
              <Button ref={cancelRef} onClick={onClose} size="sm">
                取消
              </Button>
              <Button
                colorScheme="red"
                onClick={onConfirm}
                isLoading={isLoading}
                loadingText="刪除中..."
                size="sm"
              >
                {hasUsage ? '確認刪除' : '刪除'}
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}