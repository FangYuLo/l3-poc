'use client'

import {
  VStack,
  HStack,
  Button,
  IconButton,
  Box,
  Text,
  Card,
  CardBody,
  Badge,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import FactorSelectorModal from '@/components/FactorSelectorModal'
import { formatNumber } from '@/lib/utils'
import { getAllEmissionFactors } from '@/data/mockDatabase'

interface SelectedFactor {
  id: number
  name: string
  value: number
  unit: string
  weight: number
  region?: string
  source_type: string
}

interface FormulaFactorArrayInputProps {
  value: SelectedFactor[]
  onChange: (factors: SelectedFactor[]) => void
  label?: string
  description?: string
}

export default function FormulaFactorArrayInput({
  value = [],
  onChange,
  label = '選擇排放係數',
  description,
}: FormulaFactorArrayInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 取得所有係數資料
  const allFactors = getAllEmissionFactors()

  // 將資料庫係數轉換為 Modal 所需的格式
  const convertToUnifiedFactors = (factors: any[]) => {
    return factors.map((f) => ({
      id: f.id,
      type: 'emission_factor' as const,
      name: f.name,
      value: f.value,
      unit: f.unit,
      year: f.year,
      region: f.country,
      method_gwp: f.method_gwp,
      source_type: f.source_type || 'standard',
      source_ref: f.source,
      version: f.version,
      dataSource: 'local' as const,
    }))
  }

  // 處理係數選擇
  const handleFactorSelect = (selectedFactors: any[]) => {
    const newFactors: SelectedFactor[] = selectedFactors.map((factor) => ({
      id: factor.id,
      name: factor.name,
      value: factor.value,
      unit: factor.unit,
      weight: 0.33, // 預設權重
      region: factor.region,
      source_type: factor.source_type,
    }))

    // 合併現有係數和新選擇的係數
    const existingIds = value.map((f) => f.id)
    const filteredNewFactors = newFactors.filter((f) => !existingIds.includes(f.id))

    const updatedFactors = [...value, ...filteredNewFactors]

    // 重新分配權重 (平均分配)
    const evenWeight = updatedFactors.length > 0 ? 1 / updatedFactors.length : 0
    const factorsWithEvenWeight = updatedFactors.map((f) => ({
      ...f,
      weight: parseFloat(evenWeight.toFixed(3)),
    }))

    onChange(factorsWithEvenWeight)
    setIsModalOpen(false)
  }

  // 移除係數
  const handleRemoveFactor = (factorId: number) => {
    const updatedFactors = value.filter((f) => f.id !== factorId)

    // 重新分配權重
    if (updatedFactors.length > 0) {
      const evenWeight = 1 / updatedFactors.length
      const factorsWithEvenWeight = updatedFactors.map((f) => ({
        ...f,
        weight: parseFloat(evenWeight.toFixed(3)),
      }))
      onChange(factorsWithEvenWeight)
    } else {
      onChange([])
    }
  }

  // 更新權重
  const handleWeightChange = (factorId: number, newWeight: number) => {
    const updatedFactors = value.map((f) =>
      f.id === factorId ? { ...f, weight: newWeight } : f
    )
    onChange(updatedFactors)
  }

  // 計算權重總和
  const totalWeight = value.reduce((sum, f) => sum + f.weight, 0)
  const isWeightValid = Math.abs(totalWeight - 1) < 0.001

  // 來源類型 Badge
  const getSourceTypeBadge = (sourceType: string) => {
    const configs = {
      standard: { label: '標準', colorScheme: 'blue' },
      pact: { label: 'PACT', colorScheme: 'green' },
      supplier: { label: '供應商', colorScheme: 'purple' },
      user_defined: { label: '自建', colorScheme: 'orange' },
    }

    const config = configs[sourceType as keyof typeof configs] || {
      label: '未知',
      colorScheme: 'gray',
    }
    return (
      <Badge size="xs" colorScheme={config.colorScheme}>
        {config.label}
      </Badge>
    )
  }

  return (
    <VStack align="stretch" spacing={3}>
      {/* 標題與說明 */}
      {label && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>
            {label}
          </Text>
          {description && (
            <Text fontSize="xs" color="gray.600">
              {description}
            </Text>
          )}
        </Box>
      )}

      {/* 已選擇的係數列表 */}
      {value.length > 0 && (
        <VStack align="stretch" spacing={2}>
          {value.map((factor, index) => (
            <Card key={factor.id} size="sm" variant="outline">
              <CardBody p={3}>
                <HStack spacing={3} align="start">
                  {/* 序號 */}
                  <Flex
                    w="24px"
                    h="24px"
                    bg="blue.100"
                    borderRadius="full"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Text fontSize="xs" fontWeight="bold" color="blue.700">
                      {index + 1}
                    </Text>
                  </Flex>

                  {/* 係數資訊 */}
                  <VStack align="start" spacing={1} flex={1} minW={0}>
                    <HStack spacing={2} w="100%">
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1} flex={1}>
                        {factor.name}
                      </Text>
                      {getSourceTypeBadge(factor.source_type)}
                    </HStack>

                    <HStack spacing={4} fontSize="xs" color="gray.600">
                      <Text fontFamily="mono">
                        {formatNumber(factor.value)} {factor.unit}
                      </Text>
                      {factor.region && (
                        <Badge size="xs" variant="subtle">
                          {factor.region}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>

                  {/* 權重輸入 */}
                  <VStack spacing={1} w="100px" flexShrink={0}>
                    <Text fontSize="xs" color="gray.600">
                      權重
                    </Text>
                    <input
                      type="number"
                      value={factor.weight}
                      onChange={(e) =>
                        handleWeightChange(factor.id, parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        textAlign: 'center',
                      }}
                    />
                  </VStack>

                  {/* 刪除按鈕 */}
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleRemoveFactor(factor.id)}
                    aria-label="刪除係數"
                    flexShrink={0}
                  />
                </HStack>
              </CardBody>
            </Card>
          ))}

          {/* 權重總和檢查 */}
          <Box
            p={2}
            bg={isWeightValid ? 'green.50' : 'orange.50'}
            borderRadius="md"
            border="1px solid"
            borderColor={isWeightValid ? 'green.200' : 'orange.200'}
          >
            <HStack justify="space-between" fontSize="sm">
              <Text fontWeight="medium" color={isWeightValid ? 'green.700' : 'orange.700'}>
                權重總和：
              </Text>
              <HStack>
                <Text
                  fontFamily="mono"
                  fontWeight="bold"
                  color={isWeightValid ? 'green.700' : 'orange.700'}
                >
                  {totalWeight.toFixed(3)}
                </Text>
                {!isWeightValid && (
                  <Badge colorScheme="orange" fontSize="xs">
                    建議為 1.0
                  </Badge>
                )}
                {isWeightValid && (
                  <Badge colorScheme="green" fontSize="xs">
                    ✓ 正確
                  </Badge>
                )}
              </HStack>
            </HStack>
          </Box>
        </VStack>
      )}

      {/* 空狀態提示 */}
      {value.length === 0 && (
        <Box
          p={6}
          textAlign="center"
          bg="gray.50"
          borderRadius="md"
          border="1px dashed"
          borderColor="gray.300"
        >
          <Text fontSize="sm" color="gray.600" mb={2}>
            尚未選擇任何排放係數
          </Text>
          <Text fontSize="xs" color="gray.500">
            點擊下方按鈕從係數庫中選擇
          </Text>
        </Box>
      )}

      {/* 新增係數按鈕 */}
      <Button
        leftIcon={<SearchIcon />}
        size="md"
        variant="outline"
        colorScheme="blue"
        onClick={() => setIsModalOpen(true)}
      >
        {value.length > 0 ? '新增更多係數' : '從係數庫選擇'}
      </Button>

      {/* 係數選擇 Modal */}
      <FactorSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFactorSelect}
        excludeIds={value.map((f) => f.id)}
        centralFactors={convertToUnifiedFactors(
          allFactors.filter((f) => f.source_type !== 'global')
        )}
        globalFactors={convertToUnifiedFactors(
          allFactors.filter((f) => f.source_type === 'global')
        )}
      />
    </VStack>
  )
}
