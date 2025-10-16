'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react'

interface WeightedAverageNodeData {
  label: string
  operation: 'weighted_average'
  operationSymbol: string
  factors?: Array<{
    id: number
    name: string
    value: number
    weight: number
  }>
}

export default function WeightedAverageNode({ data }: NodeProps<WeightedAverageNodeData>) {
  const factorCount = data.factors?.length || 0

  return (
    <Box
      bg="teal.50"
      border="2px solid"
      borderColor="teal.400"
      borderRadius="md"
      px={4}
      py={3}
      minW="180px"
      boxShadow="md"
      _hover={{
        borderColor: 'teal.500',
        boxShadow: 'lg',
      }}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} />

      <VStack align="start" spacing={2}>
        <HStack spacing={2}>
          <Text fontSize="2xl">{data.operationSymbol}</Text>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="bold" color="teal.700">
              {data.label}
            </Text>
            <Text fontSize="xs" color="gray.600">
              權重平均計算
            </Text>
          </VStack>
        </HStack>

        {factorCount > 0 && (
          <Badge colorScheme="teal" fontSize="xs">
            {factorCount} 個係數
          </Badge>
        )}

        {factorCount === 0 && (
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            點擊設定係數
          </Text>
        )}
      </VStack>

      <Handle type="source" position={Position.Right} />
    </Box>
  )
}
