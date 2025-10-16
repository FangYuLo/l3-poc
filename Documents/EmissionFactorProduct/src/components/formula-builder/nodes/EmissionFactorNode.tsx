'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { EmissionFactorNodeData } from '@/types/formula.types'

function EmissionFactorNode({ data, selected }: NodeProps<EmissionFactorNodeData>) {
  // 判斷是否未選擇係數
  const isUnselected = data.factorValue === 0 || data.factorName === '請選擇係數'

  return (
    <Box
      bg={isUnselected ? 'blue.50' : 'blue.100'}
      border="2px"
      borderStyle={isUnselected ? 'dashed' : 'solid'}
      borderColor={selected ? 'blue.500' : isUnselected ? 'blue.300' : 'blue.400'}
      borderRadius="md"
      p={3}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      _hover={{
        boxShadow: 'lg',
        borderColor: 'blue.500',
        transform: 'translateY(-2px)'
      }}
      cursor="pointer"
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Badge colorScheme="blue" fontSize="xs" w="fit-content">
            排放係數
          </Badge>
          {isUnselected && <SearchIcon color="blue.400" boxSize={3} />}
        </HStack>

        {isUnselected ? (
          <>
            <Text fontSize="sm" fontWeight="bold" color="blue.600" fontStyle="italic">
              {data.factorName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              點擊選擇係數
            </Text>
          </>
        ) : (
          <>
            <Text fontSize="sm" fontWeight="bold" color="gray.800" noOfLines={2}>
              {data.factorName}
            </Text>
            <Text fontSize="xs" color="gray.700" fontFamily="mono">
              {data.factorValue} {data.factorUnit}
            </Text>
            {data.region && (
              <Badge colorScheme="gray" fontSize="xs" w="fit-content">
                {data.region}
              </Badge>
            )}
          </>
        )}
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#3182ce',
          width: '10px',
          height: '10px'
        }}
      />
    </Box>
  )
}

export default memo(EmissionFactorNode)
