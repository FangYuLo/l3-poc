'use client'

import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  Code,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { EvaluationResult } from '@/types/formula.types'
import { formatNumber } from '@/lib/utils'

interface ResultCardProps {
  result: EvaluationResult | null
  isCalculating?: boolean
}

export default function ResultCard({ result, isCalculating = false }: ResultCardProps) {
  if (!result && !isCalculating) {
    return (
      <Card variant="outline">
        <CardBody>
          <Box textAlign="center" py={8} color="gray.500">
            <Text fontSize="lg" mb={2}>
              ⏳
            </Text>
            <Text fontSize="sm">填寫參數後點擊「計算」查看結果</Text>
          </Box>
        </CardBody>
      </Card>
    )
  }

  if (isCalculating) {
    return (
      <Card variant="outline">
        <CardBody>
          <Box textAlign="center" py={8} color="blue.500">
            <Text fontSize="lg" mb={2}>
              🔄
            </Text>
            <Text fontSize="sm">計算中...</Text>
          </Box>
        </CardBody>
      </Card>
    )
  }

  if (!result) return null

  return (
    <VStack align="stretch" spacing={4}>
      {/* 主結果卡片 */}
      <Card
        variant="outline"
        borderColor={result.success ? 'green.500' : 'red.500'}
        borderWidth="2px"
      >
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {/* 狀態標籤 */}
            <HStack justify="space-between">
              <Badge
                colorScheme={result.success ? 'green' : 'red'}
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {result.success ? '✓ 計算成功' : '✗ 計算失敗'}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                耗時: {result.duration}ms
              </Text>
            </HStack>

            {result.success ? (
              <>
                {/* 計算結果 */}
                <Stat>
                  <StatLabel>計算結果</StatLabel>
                  <StatNumber fontSize="3xl" color="green.600">
                    {formatNumber(result.value)}
                  </StatNumber>
                  <StatHelpText fontSize="md">{result.unit}</StatHelpText>
                </Stat>

                <Divider />

                {/* 警告訊息 */}
                {result.warnings.length > 0 && (
                  <Alert status="warning" borderRadius="md" size="sm">
                    <AlertIcon />
                    <VStack align="start" spacing={1} flex={1}>
                      {result.warnings.map((warning, index) => (
                        <Text key={index} fontSize="xs">
                          {warning}
                        </Text>
                      ))}
                    </VStack>
                  </Alert>
                )}

                {/* 計算步驟 */}
                {result.steps.length > 0 && (
                  <Accordion allowToggle>
                    <AccordionItem border="none">
                      <AccordionButton px={0}>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="sm" fontWeight="medium">
                            計算步驟詳情 ({result.steps.length} 步)
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} pt={3} pb={0}>
                        <VStack align="stretch" spacing={3}>
                          {result.steps.map((step, index) => (
                            <Box
                              key={index}
                              p={3}
                              bg="gray.50"
                              borderRadius="md"
                              borderLeft="3px solid"
                              borderColor="blue.400"
                            >
                              <HStack justify="space-between" mb={2}>
                                <HStack>
                                  <Badge colorScheme="blue" size="sm">
                                    步驟 {index + 1}
                                  </Badge>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {step.moduleName}
                                  </Text>
                                </HStack>
                                {step.duration && (
                                  <Text fontSize="xs" color="gray.500">
                                    {step.duration}ms
                                  </Text>
                                )}
                              </HStack>

                              <VStack align="stretch" spacing={2} fontSize="xs">
                                {/* 特殊顯示：係數詳情 */}
                                {step.output?.factors_used && Array.isArray(step.output.factors_used) && (
                                  <Box>
                                    <Text color="gray.600" mb={2} fontWeight="medium">
                                      使用的排放係數:
                                    </Text>
                                    <VStack align="stretch" spacing={2}>
                                      {step.output.factors_used.map((factor: any, idx: number) => (
                                        <Box
                                          key={idx}
                                          p={2}
                                          bg="white"
                                          borderRadius="md"
                                          border="1px solid"
                                          borderColor="gray.200"
                                        >
                                          <HStack justify="space-between" mb={1}>
                                            <Text fontWeight="medium" fontSize="xs">
                                              {factor.name}
                                            </Text>
                                            <Badge size="xs" colorScheme="blue">
                                              ID: {factor.id}
                                            </Badge>
                                          </HStack>
                                          <HStack fontSize="xs" color="gray.600" spacing={3}>
                                            <Text>
                                              數值: <strong>{formatNumber(factor.value)}</strong>
                                            </Text>
                                            <Text>×</Text>
                                            <Text>
                                              權重: <strong>{factor.weight}</strong>
                                            </Text>
                                            <Text>=</Text>
                                            <Text fontWeight="bold" color="green.600">
                                              {formatNumber(factor.value * factor.weight)}
                                            </Text>
                                          </HStack>
                                        </Box>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}

                                {/* 計算細節 */}
                                {step.output?.calculation_details && Array.isArray(step.output.calculation_details) && (
                                  <Box>
                                    <Text color="gray.600" mb={1} fontWeight="medium">
                                      計算過程:
                                    </Text>
                                    <VStack align="stretch" spacing={1}>
                                      {step.output.calculation_details.map((detail: string, idx: number) => (
                                        <Text key={idx} fontSize="xs" fontFamily="mono" color="gray.700">
                                          {detail}
                                        </Text>
                                      ))}
                                    </VStack>
                                    <Divider my={2} />
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text color="gray.600">加權總和:</Text>
                                      <Text fontWeight="bold">
                                        {formatNumber(step.output.weighted_sum)}
                                      </Text>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text color="gray.600">總權重:</Text>
                                      <Text fontWeight="bold">
                                        {step.output.total_weight?.toFixed(3)}
                                      </Text>
                                    </HStack>
                                    <Divider my={2} />
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text color="gray.600" fontWeight="bold">
                                        結果 (加權平均):
                                      </Text>
                                      <Text fontWeight="bold" color="green.600" fontSize="sm">
                                        {formatNumber(step.output.value)}
                                      </Text>
                                    </HStack>
                                  </Box>
                                )}

                                {/* 預設顯示：完整輸入輸出 */}
                                {!step.output?.factors_used && (
                                  <>
                                    <Box>
                                      <Text color="gray.600" mb={1}>
                                        輸入:
                                      </Text>
                                      <Code
                                        fontSize="xs"
                                        display="block"
                                        p={2}
                                        whiteSpace="pre-wrap"
                                        wordBreak="break-word"
                                      >
                                        {JSON.stringify(step.input, null, 2)}
                                      </Code>
                                    </Box>

                                    <Box>
                                      <Text color="gray.600" mb={1}>
                                        輸出:
                                      </Text>
                                      <Code
                                        fontSize="xs"
                                        display="block"
                                        p={2}
                                        whiteSpace="pre-wrap"
                                        wordBreak="break-word"
                                        colorScheme="green"
                                      >
                                        {JSON.stringify(step.output, null, 2)}
                                      </Code>
                                    </Box>
                                  </>
                                )}
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                )}
              </>
            ) : (
              <>
                {/* 錯誤訊息 */}
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <VStack align="start" spacing={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      計算失敗
                    </Text>
                    {result.errors.map((error, index) => (
                      <Text key={index} fontSize="xs">
                        • {error}
                      </Text>
                    ))}
                  </VStack>
                </Alert>

                {/* 部分步驟 (如果有) */}
                {result.steps.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      已完成的步驟:
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {result.steps.map((step, index) => (
                        <HStack key={index} fontSize="xs" color="gray.600">
                          <Badge size="sm">步驟 {index + 1}</Badge>
                          <Text>{step.moduleName}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
