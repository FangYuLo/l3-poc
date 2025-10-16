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
  FormControl,
  FormLabel,
  Select,
  Text,
  Box,
  Badge,
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'

interface UnitSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (fromUnit: string, toUnit: string, conversionFactor: number) => void
  initialFromUnit?: string
  initialToUnit?: string
}

// 單位選項（從 UnitConverterModule 複製）
const UNIT_OPTIONS = [
  { value: 'MJ', label: 'MJ (兆焦耳)', category: '能源' },
  { value: 'kWh', label: 'kWh (千瓦時)', category: '能源' },
  { value: 'GJ', label: 'GJ (吉焦耳)', category: '能源' },
  { value: 'kg', label: 'kg (公斤)', category: '質量' },
  { value: 'g', label: 'g (克)', category: '質量' },
  { value: 't', label: 't (公噸)', category: '質量' },
  { value: 'L', label: 'L (公升)', category: '體積' },
  { value: 'mL', label: 'mL (毫升)', category: '體積' },
  { value: 'm³', label: 'm³ (立方米)', category: '體積' },
  { value: 'Nm³', label: 'Nm³ (標準立方米)', category: '體積' },
]

// 轉換係數表（從 UnitConverterModule 複製）
const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  'MJ': { 'kWh': 0.277778, 'MJ': 1, 'GJ': 0.001 },
  'kWh': { 'MJ': 3.6, 'kWh': 1, 'GJ': 0.0036 },
  'GJ': { 'MJ': 1000, 'kWh': 277.778, 'GJ': 1 },
  'kg': { 'g': 1000, 'kg': 1, 't': 0.001 },
  'g': { 'g': 1, 'kg': 0.001, 't': 0.000001 },
  't': { 'g': 1000000, 'kg': 1000, 't': 1 },
  'L': { 'mL': 1000, 'L': 1, 'm³': 0.001 },
  'mL': { 'mL': 1, 'L': 0.001, 'm³': 0.000001 },
  'm³': { 'mL': 1000000, 'L': 1000, 'm³': 1, 'Nm³': 1 },
  'Nm³': { 'm³': 1, 'Nm³': 1 },
}

export default function UnitSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  initialFromUnit = 'MJ',
  initialToUnit = 'kWh',
}: UnitSelectorModalProps) {
  const [fromUnit, setFromUnit] = useState(initialFromUnit)
  const [toUnit, setToUnit] = useState(initialToUnit)
  const [conversionFactor, setConversionFactor] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 計算轉換係數
  useEffect(() => {
    if (fromUnit === toUnit) {
      setConversionFactor(1)
      setError(null)
      return
    }

    const fromConversions = CONVERSION_FACTORS[fromUnit]
    if (!fromConversions) {
      setError(`不支援的原始單位: ${fromUnit}`)
      setConversionFactor(null)
      return
    }

    const factor = fromConversions[toUnit]
    if (factor === undefined) {
      setError(`無法從 ${fromUnit} 轉換到 ${toUnit}（不同類別的單位）`)
      setConversionFactor(null)
      return
    }

    setConversionFactor(factor)
    setError(null)
  }, [fromUnit, toUnit])

  const handleConfirm = () => {
    if (conversionFactor === null) {
      return
    }
    onConfirm(fromUnit, toUnit, conversionFactor)
  }

  const handleClose = () => {
    setFromUnit(initialFromUnit)
    setToUnit(initialToUnit)
    setError(null)
    onClose()
  }

  // 取得單位類別
  const getUnitCategory = (unit: string) => {
    return UNIT_OPTIONS.find((opt) => opt.value === unit)?.category || ''
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>設定單位轉換</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 原始單位 */}
            <FormControl>
              <FormLabel fontSize="sm">原始單位</FormLabel>
              <Select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                size="md"
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color="gray.600" mt={1}>
                類別：{getUnitCategory(fromUnit)}
              </Text>
            </FormControl>

            {/* 箭頭指示 */}
            <Box textAlign="center" py={2}>
              <ArrowRightIcon w={6} h={6} color="purple.500" />
            </Box>

            {/* 目標單位 */}
            <FormControl>
              <FormLabel fontSize="sm">目標單位</FormLabel>
              <Select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                size="md"
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color="gray.600" mt={1}>
                類別：{getUnitCategory(toUnit)}
              </Text>
            </FormControl>

            {/* 轉換係數預覽 */}
            <Box
              p={4}
              bg={error ? 'red.50' : conversionFactor ? 'purple.50' : 'gray.50'}
              borderRadius="md"
              border="1px solid"
              borderColor={error ? 'red.200' : conversionFactor ? 'purple.200' : 'gray.200'}
            >
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    轉換係數：
                  </Text>
                  {conversionFactor !== null && (
                    <Badge colorScheme="purple" fontSize="md" fontFamily="mono">
                      {conversionFactor}
                    </Badge>
                  )}
                </HStack>

                {error && (
                  <Text fontSize="sm" color="red.600">
                    {error}
                  </Text>
                )}

                {conversionFactor !== null && !error && (
                  <Text fontSize="xs" color="gray.600">
                    1 {fromUnit} = {conversionFactor} {toUnit}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* 提示訊息 */}
            <Box
              p={3}
              bg="blue.50"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text fontSize="xs" color="blue.700">
                💡 只能在相同類別的單位之間轉換（能源/質量/體積）
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            取消
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleConfirm}
            isDisabled={conversionFactor === null || error !== null}
          >
            確認設定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
