'use client'

import {
  Box,
  VStack,
  Text,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react'
import { FormulaEvaluationResult } from '@/types/formula.types'

interface ResultPanelProps {
  evaluationResult: FormulaEvaluationResult | null
}

export default function ResultPanel({ evaluationResult }: ResultPanelProps) {
  if (!evaluationResult) {
    return (
      <Box w="320px" bg="gray.50" borderLeft="1px solid" borderColor="gray.200" p={4}>
        <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
          計算結果
        </Text>
        <Text fontSize="sm" color="gray.500">
          請建立公式以查看計算結果
        </Text>
      </Box>
    )
  }

  return (
    <Box w="320px" bg="gray.50" borderLeft="1px solid" borderColor="gray.200" p={4} overflowY="auto" h="full">
      <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
        計算結果
      </Text>

      {evaluationResult.success ? (
        <VStack spacing={4} align="stretch">
          {/* 最終結果 */}
          <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
              最終係數值
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.700">
              {evaluationResult.finalValue?.toFixed(4)}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {evaluationResult.finalUnit}
            </Text>
          </Box>

          <Divider />

          {/* 計算步驟 */}
          <Box>
            <Text fontSize="md" fontWeight="medium" mb={2} color="gray.700">
              計算步驟
            </Text>
            <Accordion allowMultiple>
              {evaluationResult.steps.map((step, index) => (
                <AccordionItem key={step.nodeId}>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="medium">
                        步驟 {index + 1}: {step.nodeLabel}
                      </Text>
                    </Box>
                    <Badge colorScheme="blue" fontSize="xs" mr={2}>
                      {step.nodeType}
                    </Badge>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack align="stretch" spacing={2}>
                      {step.inputValues.length > 0 && (
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                            輸入值:
                          </Text>
                          {step.inputValues.map((input, idx) => (
                            <Text key={idx} fontSize="xs" color="gray.700">
                              • {input.value.toFixed(4)} {input.unit}
                            </Text>
                          ))}
                        </Box>
                      )}
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                          輸出值:
                        </Text>
                        <Code fontSize="xs" colorScheme="green">
                          {step.outputValue.toFixed(4)} {step.outputUnit}
                        </Code>
                      </Box>
                      {step.description && (
                        <Text fontSize="xs" color="gray.600" fontStyle="italic">
                          {step.description}
                        </Text>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </VStack>
      ) : (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {evaluationResult.error || '計算失敗'}
          </AlertDescription>
        </Alert>
      )}
    </Box>
  )
}
