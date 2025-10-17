'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Box,
  Divider,
  Table,
  Tbody,
  Tr,
  Td,
  Badge,
  Icon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useState } from 'react'
import { WarningIcon } from '@chakra-ui/icons'
import { EmissionFactor } from '@/types/types'
import { formatNumber } from '@/lib/utils'

interface GWPConversionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (factorsWithGWP: FactorWithGWPConversion[]) => void
  factors: EmissionFactor[] // 需要進行 GWP 轉換的係數
}

export interface FactorWithGWPConversion extends EmissionFactor {
  gwpVersion: 'AR4' | 'AR5' | 'AR6'
  convertedCO2eValue: number
  conversionBreakdown: {
    co2_contribution: number
    ch4_contribution: number
    n2o_contribution: number
  }
}

// GWP 版本定義
const GWP_VERSIONS = {
  AR4: {
    name: 'IPCC AR4 (2007)',
    ch4: 25,
    n2o: 298,
    description: '適用於較舊的盤查標準',
    color: 'gray',
  },
  AR5: {
    name: 'IPCC AR5 (2013)',
    ch4: 28,
    n2o: 265,
    description: '目前多數國際標準採用',
    color: 'blue',
    recommended: true,
  },
  AR6: {
    name: 'IPCC AR6 (2021)',
    ch4: 27.9,
    n2o: 273,
    description: '最新科學數據，部分標準開始採用',
    color: 'green',
  },
} as const

export default function GWPConversionModal({
  isOpen,
  onClose,
  onConfirm,
  factors,
}: GWPConversionModalProps) {
  const [selectedGWPVersion, setSelectedGWPVersion] = useState<'AR4' | 'AR5' | 'AR6'>('AR5')

  // 計算轉換後的 CO2e 值
  const calculateCO2e = (factor: EmissionFactor, gwpVersion: 'AR4' | 'AR5' | 'AR6') => {
    const gwp = GWP_VERSIONS[gwpVersion]

    const co2 = factor.co2_factor || 0
    const ch4_co2e = (factor.ch4_factor || 0) * gwp.ch4
    const n2o_co2e = (factor.n2o_factor || 0) * gwp.n2o

    return {
      total: co2 + ch4_co2e + n2o_co2e,
      breakdown: {
        co2_contribution: co2,
        ch4_contribution: ch4_co2e,
        n2o_contribution: n2o_co2e,
      }
    }
  }

  // 計算預覽結果（僅用於顯示第一個係數的範例）
  const previewFactor = factors[0]
  const previewResult = previewFactor ? calculateCO2e(previewFactor, selectedGWPVersion) : null

  const handleConfirm = () => {
    const factorsWithGWP: FactorWithGWPConversion[] = factors.map(factor => {
      const result = calculateCO2e(factor, selectedGWPVersion)
      return {
        ...factor,
        gwpVersion: selectedGWPVersion,
        convertedCO2eValue: result.total,
        conversionBreakdown: result.breakdown,
      }
    })

    onConfirm(factorsWithGWP)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={WarningIcon} color="orange.500" />
            <Text>溫室氣體轉換設定</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* 說明 */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  您選擇了 {factors.length} 個包含多種溫室氣體的係數
                </Text>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  這些係數包含 CO₂、CH₄、N₂O 等氣體數據，需要選擇 GWP 標準轉換為 CO₂e 當量
                </Text>
              </Box>
            </Alert>

            {/* 顯示第一個係數的資訊作為範例 */}
            {previewFactor && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>範例係數：</Text>
                <Box p={3} bg="gray.50" borderRadius="md" fontSize="sm">
                  <Text fontWeight="medium">{previewFactor.name}</Text>
                  <HStack mt={2} spacing={4} fontSize="xs" color="gray.600">
                    <Text>CO₂: {formatNumber(previewFactor.co2_factor || 0)} {previewFactor.co2_unit}</Text>
                    {previewFactor.ch4_factor && (
                      <Text>CH₄: {formatNumber(previewFactor.ch4_factor)} {previewFactor.ch4_unit}</Text>
                    )}
                    {previewFactor.n2o_factor && (
                      <Text>N₂O: {formatNumber(previewFactor.n2o_factor)} {previewFactor.n2o_unit}</Text>
                    )}
                  </HStack>
                </Box>
              </Box>
            )}

            <Divider />

            {/* GWP 版本選擇 */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={3}>
                請選擇 GWP 計算標準：
              </Text>

              <RadioGroup value={selectedGWPVersion} onChange={(value) => setSelectedGWPVersion(value as 'AR4' | 'AR5' | 'AR6')}>
                <VStack align="stretch" spacing={3}>
                  {Object.entries(GWP_VERSIONS).map(([key, gwp]) => (
                    <Box
                      key={key}
                      p={3}
                      border="2px solid"
                      borderColor={selectedGWPVersion === key ? `${gwp.color}.400` : 'gray.200'}
                      borderRadius="md"
                      bg={selectedGWPVersion === key ? `${gwp.color}.50` : 'white'}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: `${gwp.color}.300` }}
                      onClick={() => setSelectedGWPVersion(key as 'AR4' | 'AR5' | 'AR6')}
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <Radio value={key} />
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Text fontWeight="medium" fontSize="sm">{gwp.name}</Text>
                              {'recommended' in gwp && gwp.recommended && (
                                <Badge colorScheme="blue" fontSize="xs">推薦</Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              CH₄={gwp.ch4}, N₂O={gwp.n2o}
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              💡 {gwp.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>
            </Box>

            {/* 預覽計算結果 */}
            {previewResult && previewFactor && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    📊 預覽轉換結果（以第一個係數為例）：
                  </Text>
                  <Box p={3} bg="blue.50" borderRadius="md">
                    <Table size="sm" variant="unstyled">
                      <Tbody>
                        <Tr>
                          <Td px={0} fontSize="xs" color="gray.600">CO₂</Td>
                          <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right">
                            {formatNumber(previewFactor.co2_factor || 0)} × 1
                          </Td>
                          <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right" fontWeight="medium">
                            = {formatNumber(previewResult.breakdown.co2_contribution)}
                          </Td>
                        </Tr>
                        {previewFactor.ch4_factor && (
                          <Tr>
                            <Td px={0} fontSize="xs" color="gray.600">CH₄</Td>
                            <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right">
                              {formatNumber(previewFactor.ch4_factor)} × {GWP_VERSIONS[selectedGWPVersion].ch4}
                            </Td>
                            <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right" fontWeight="medium">
                              = {formatNumber(previewResult.breakdown.ch4_contribution)}
                            </Td>
                          </Tr>
                        )}
                        {previewFactor.n2o_factor && (
                          <Tr>
                            <Td px={0} fontSize="xs" color="gray.600">N₂O</Td>
                            <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right">
                              {formatNumber(previewFactor.n2o_factor)} × {GWP_VERSIONS[selectedGWPVersion].n2o}
                            </Td>
                            <Td px={0} fontSize="xs" fontFamily="mono" textAlign="right" fontWeight="medium">
                              = {formatNumber(previewResult.breakdown.n2o_contribution)}
                            </Td>
                          </Tr>
                        )}
                        <Tr>
                          <Td colSpan={3} px={0} pt={2}>
                            <Divider />
                          </Td>
                        </Tr>
                        <Tr>
                          <Td px={0} fontSize="sm" fontWeight="bold">合計</Td>
                          <Td px={0}></Td>
                          <Td px={0} fontSize="sm" fontFamily="mono" textAlign="right" fontWeight="bold" color="green.600">
                            {formatNumber(previewResult.total)} kg CO₂e/{previewFactor.unit.split('/')[1] || 'unit'}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                {factors.length > 1 && (
                  <Alert status="info" size="sm" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="xs">
                      此設定將套用至所有 {factors.length} 個需要轉換的係數
                    </Text>
                  </Alert>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button colorScheme="blue" onClick={handleConfirm}>
              確認並套用轉換
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
