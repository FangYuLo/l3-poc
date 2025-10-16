'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, VStack, Badge } from '@chakra-ui/react'
import { ConstantNodeData } from '@/types/formula.types'

function ConstantNode({ data, selected }: NodeProps<ConstantNodeData>) {
  return (
    <Box
      bg="purple.50"
      border="2px solid"
      borderColor={selected ? 'purple.500' : 'purple.300'}
      borderRadius="md"
      p={3}
      minW="140px"
      boxShadow={selected ? 'lg' : 'md'}
      _hover={{ boxShadow: 'lg' }}
    >
      <VStack align="stretch" spacing={1}>
        <Badge colorScheme="purple" fontSize="xs" w="fit-content">
          常數
        </Badge>
        <Text fontSize="sm" fontWeight="bold" color="gray.800">
          {data.constantValue} {data.constantUnit}
        </Text>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#805ad5',
          width: '10px',
          height: '10px'
        }}
      />
    </Box>
  )
}

export default memo(ConstantNode)
