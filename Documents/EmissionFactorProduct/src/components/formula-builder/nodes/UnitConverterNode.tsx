'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, VStack, HStack, Badge, Icon } from '@chakra-ui/react'
import { ArrowRightIcon, SettingsIcon } from '@chakra-ui/icons'

interface UnitConverterNodeData {
  label: string
  fromUnit: string
  toUnit: string
  conversionFactor: number
}

function UnitConverterNode({ data, selected }: NodeProps<UnitConverterNodeData>) {
  // 判斷是否未設定單位
  const isUnconfigured = data.fromUnit === '請設定' || data.toUnit === '請設定' || data.conversionFactor === 0

  return (
    <Box
      bg={isUnconfigured ? 'purple.50' : 'purple.100'}
      border="2px"
      borderStyle={isUnconfigured ? 'dashed' : 'solid'}
      borderColor={selected ? 'purple.500' : isUnconfigured ? 'purple.300' : 'purple.400'}
      borderRadius="md"
      px={4}
      py={3}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      _hover={{
        borderColor: 'purple.500',
        boxShadow: 'lg',
        transform: 'translateY(-2px)'
      }}
      cursor="pointer"
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} />

      <VStack align="start" spacing={2}>
        <HStack spacing={2} justify="space-between" w="100%">
          <HStack spacing={2}>
            <Text fontSize="2xl">🔄</Text>
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold" color="purple.700">
                {data.label}
              </Text>
              <Text fontSize="xs" color="gray.600">
                單位轉換
              </Text>
            </VStack>
          </HStack>
          {isUnconfigured && <SettingsIcon color="purple.400" boxSize={3} />}
        </HStack>

        {isUnconfigured ? (
          <>
            {/* 未設定狀態 */}
            <Box
              p={2}
              bg="white"
              borderRadius="md"
              border="1px dashed"
              borderColor="purple.300"
              w="100%"
              textAlign="center"
            >
              <Text fontSize="sm" fontWeight="bold" color="purple.600" fontStyle="italic">
                {data.fromUnit} → {data.toUnit}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                點擊設定單位
              </Text>
            </Box>
          </>
        ) : (
          <>
            {/* 已設定狀態 */}
            <HStack
              spacing={2}
              p={2}
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor="purple.200"
              w="100%"
            >
              <Badge colorScheme="purple" fontSize="xs" fontWeight="bold">
                {data.fromUnit}
              </Badge>
              <ArrowRightIcon w={3} h={3} color="purple.500" />
              <Badge colorScheme="purple" fontSize="xs" fontWeight="bold">
                {data.toUnit}
              </Badge>
            </HStack>

            {/* 轉換係數 */}
            <HStack justify="space-between" w="100%" fontSize="xs" color="gray.600">
              <Text>轉換係數:</Text>
              <Text fontFamily="mono" fontWeight="bold" color="purple.700">
                {data.conversionFactor}
              </Text>
            </HStack>
          </>
        )}
      </VStack>

      <Handle type="source" position={Position.Right} />
    </Box>
  )
}

export default memo(UnitConverterNode)
