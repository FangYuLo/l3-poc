'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Text, Center } from '@chakra-ui/react'
import { OperationNodeData } from '@/types/formula.types'

function OperationNode({ data, selected }: NodeProps<OperationNodeData>) {
  const getSymbol = () => {
    switch (data.operation) {
      case 'multiply': return '×'
      case 'divide': return '÷'
      case 'add': return '+'
      case 'subtract': return '-'
      default: return '?'
    }
  }

  return (
    <Box
      bg="orange.50"
      border="2px solid"
      borderColor={selected ? 'orange.500' : 'orange.300'}
      borderRadius="md"
      w="60px"
      h="60px"
      boxShadow={selected ? 'lg' : 'md'}
      _hover={{ boxShadow: 'lg' }}
      position="relative"
    >
      <Center h="full">
        <Text fontSize="2xl" fontWeight="bold" color="orange.700">
          {getSymbol()}
        </Text>
      </Center>

      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        style={{
          background: '#dd6b20',
          width: '10px',
          height: '10px',
          top: '20%'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        style={{
          background: '#dd6b20',
          width: '10px',
          height: '10px',
          top: '80%'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#dd6b20',
          width: '10px',
          height: '10px'
        }}
      />
    </Box>
  )
}

export default memo(OperationNode)
