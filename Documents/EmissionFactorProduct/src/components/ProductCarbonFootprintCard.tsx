'use client'

import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Divider,
  VStack,
  HStack,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ProductCarbonFootprintSummary, ImportToCentralFormData } from '@/types/types'
import ImportToCentralModal from './ImportToCentralModal'

interface ProductCarbonFootprintCardProps {
  summary: ProductCarbonFootprintSummary
  onViewDetails?: () => void
  onImportToCentral?: (formData: ImportToCentralFormData) => Promise<void>
}

export default function ProductCarbonFootprintCard({
  summary,
  onViewDetails,
  onImportToCentral,
}: ProductCarbonFootprintCardProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleImportClick = () => {
    setIsImportModalOpen(true)
  }

  const handleImportConfirm = async (formData: ImportToCentralFormData) => {
    await onImportToCentral?.(formData)
    setIsImportModalOpen(false)
  }

  return (
    <>
      <Box
      bg="white"
      border="2px solid"
      borderColor="brand.500"
      borderRadius="lg"
      p={6}
      mb={6}
      boxShadow="md"
    >
      {/* 標題區 */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={3}>
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            ⭐ 產品碳足跡計算結果
          </Text>
          <Badge
            colorScheme={summary.isImported ? 'green' : 'gray'}
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            {summary.isImported ? '已匯入中央庫' : '未匯入中央庫'}
          </Badge>
        </HStack>
      </Flex>

      <Divider mb={4} />

      {/* 產品資訊與總碳足跡 */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
        <GridItem>
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              產品名稱
            </Text>
            <Text fontSize="lg" fontWeight="semibold">
              {summary.productName}
            </Text>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              功能單位
            </Text>
            <Text fontSize="md">
              {summary.functionalUnit}
            </Text>
          </VStack>
        </GridItem>

        <GridItem colSpan={2}>
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              總碳足跡
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="brand.600">
              {summary.totalFootprint.toFixed(1)} {summary.unit}
            </Text>
          </VStack>
        </GridItem>
      </Grid>

      <Divider mb={4} />

      {/* 計算資訊 */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
        <GridItem>
          <Text fontSize="sm" color="gray.600">
            計算日期
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {summary.calculationDate}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="sm" color="gray.600">
            計算依據
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {summary.standard}
          </Text>
        </GridItem>
      </Grid>

      {/* 操作按鈕 */}
      <Flex gap={3} mt={4}>
        <Button
          variant="outline"
          colorScheme="brand"
          size="sm"
          onClick={onViewDetails}
        >
          查看詳細計算
        </Button>
        <Button
          colorScheme="brand"
          size="sm"
          onClick={handleImportClick}
          isDisabled={summary.isImported}
        >
          匯入中央庫
        </Button>
      </Flex>
    </Box>

    {/* 匯入設定彈窗 */}
    <ImportToCentralModal
      isOpen={isImportModalOpen}
      onClose={() => setIsImportModalOpen(false)}
      summary={summary}
      onConfirm={handleImportConfirm}
    />
    </>
  )
}
