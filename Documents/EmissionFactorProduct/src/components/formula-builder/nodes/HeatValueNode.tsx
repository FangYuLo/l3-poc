'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, VStack, Badge } from '@chakra-ui/react'
import { HeatValueNodeData } from '@/types/formula.types'

function HeatValueNode({ data, selected }: NodeProps<HeatValueNodeData>) {
  return (
    <Box
      bg="green.50"
      border="2px solid"
      borderColor={selected ? 'green.500' : 'green.300'}
      borderRadius="md"
      p={3}
      minW="180px"
      boxShadow={selected ? 'lg' : 'md'}
      _hover={{ boxShadow: 'lg' }}
    >
      <VStack align="stretch" spacing={1}>
        <Badge colorScheme="green" fontSize="xs" w="fit-content">
          熱值
        </Badge>
        <Text fontSize="sm" fontWeight="bold" color="gray.800">
          {data.country} - {data.fuelType}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {data.heatValue} {data.heatUnit}
        </Text>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#38a169',
          width: '10px',
          height: '10px'
        }}
      />
    </Box>
  )
}

export default memo(HeatValueNode)
