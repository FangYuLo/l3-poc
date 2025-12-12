import React, { useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  CloseButton,
  Collapse,
  Divider,
  Icon,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { RelatedFactorInfo, UpdateResult } from '@/hooks/useMockData'

interface RelatedFactorUpdateNotificationProps {
  updateResult: UpdateResult
  onViewComparison?: (relatedFactors: RelatedFactorInfo[]) => void
  onDismiss?: () => void
}

/**
 * 相關係數更新通知組件
 * 顯示統一的批次通知，包含所有相關係數的摘要資訊
 */
export function RelatedFactorUpdateNotification({
  updateResult,
  onViewComparison,
  onDismiss
}: RelatedFactorUpdateNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const alertBg = useColorModeValue('blue.50', 'blue.900')
  const borderColor = useColorModeValue('blue.200', 'blue.600')

  if (!updateResult.relatedFactors.length) {
    return null
  }

  const { relatedFactors, relatedFactorsCount } = updateResult

  // 按關聯類型分組
  const parentSourceFactors = relatedFactors.filter(f => f.relationshipType === 'parent_source')
  const familyFactors = relatedFactors.filter(f => f.relationshipType === 'source_family')

  return (
    <Alert
      status="info"
      borderRadius="lg"
      border={`1px solid ${borderColor}`}
      bg={alertBg}
      p={4}
      position="relative"
    >
      <AlertIcon />
      <Box flex="1" mr={2}>
        <HStack justify="space-between" align="start" mb={2}>
          <VStack align="start" spacing={1} flex="1">
            <HStack>
              <Text fontWeight="bold" fontSize="sm">
                發現相關係數更新
              </Text>
              <Badge colorScheme="blue" fontSize="xs">
                {relatedFactorsCount} 筆
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              中央庫中的係數有新版本可用，建議檢視更新內容。
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Button
              size="xs"
              variant="ghost"
              leftIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '收起' : '查看詳情'}
            </Button>
            <Button
              size="xs"
              colorScheme="blue"
              leftIcon={<ExternalLinkIcon />}
              onClick={() => onViewComparison?.(relatedFactors)}
            >
              檢視差異
            </Button>
          </HStack>
        </HStack>

        {/* 展開的詳細資訊 */}
        <Collapse in={isExpanded}>
          <Divider my={3} />
          <VStack align="stretch" spacing={3}>
            
            {/* 母資料源更新 */}
            {parentSourceFactors.length > 0 && (
              <Box>
                <HStack mb={2}>
                  <Icon as={InfoIcon} color="blue.500" boxSize={3} />
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    母資料源更新 ({parentSourceFactors.length} 筆)
                  </Text>
                </HStack>
                <VStack align="stretch" spacing={2} pl={4}>
                  {parentSourceFactors.map((factor) => (
                    <Box key={factor.newFactorId} fontSize="xs">
                      <Text fontWeight="medium" mb={1}>{factor.newFactorName}</Text>
                      <HStack justify="space-between">
                        <Text color="gray.600">
                          {factor.comparisonData.oldValue} → {factor.comparisonData.newValue} {factor.comparisonData.unit}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={factor.comparisonData.changePercentage >= 0 ? 'red' : 'green'}
                          fontSize="xs"
                        >
                          {factor.comparisonData.changePercentage >= 0 ? '+' : ''}{factor.comparisonData.changePercentage}%
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* 資料源家族更新 */}
            {familyFactors.length > 0 && (
              <Box>
                <HStack mb={2}>
                  <Icon as={InfoIcon} color="blue.500" boxSize={3} />
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    同系列係數更新 ({familyFactors.length} 筆)
                  </Text>
                </HStack>
                <VStack align="stretch" spacing={2} pl={4}>
                  {familyFactors.map((factor) => (
                    <Box key={factor.newFactorId} fontSize="xs">
                      <Text fontWeight="medium" mb={1}>{factor.newFactorName}</Text>
                      <HStack justify="space-between">
                        <Text color="gray.600">
                          {factor.comparisonData.oldValue} → {factor.comparisonData.newValue} {factor.comparisonData.unit}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={factor.comparisonData.changePercentage >= 0 ? 'red' : 'green'}
                          fontSize="xs"
                        >
                          {factor.comparisonData.changePercentage >= 0 ? '+' : ''}{factor.comparisonData.changePercentage}%
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* 操作提示 */}
            <Box bg="white" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
              <Text fontSize="xs" color="gray.600">
                <Icon as={InfoIcon} mr={1} />
                點選「檢視差異」可查看詳細對比並選擇性匯入新係數到中央庫。
              </Text>
            </Box>
          </VStack>
        </Collapse>
      </Box>

      {/* 關閉按鈕 */}
      {onDismiss && (
        <Tooltip label="暫時隱藏通知" fontSize="xs">
          <CloseButton
            position="absolute"
            right={2}
            top={2}
            size="sm"
            onClick={onDismiss}
          />
        </Tooltip>
      )}
    </Alert>
  )
}

export default RelatedFactorUpdateNotification