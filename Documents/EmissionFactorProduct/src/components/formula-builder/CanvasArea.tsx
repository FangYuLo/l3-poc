'use client'

import { useCallback, useRef } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeTypes,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  NodeMouseHandler
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Box } from '@chakra-ui/react'
import EmissionFactorNode from './nodes/EmissionFactorNode'
import HeatValueNode from './nodes/HeatValueNode'
import OperationNode from './nodes/OperationNode'
import ConstantNode from './nodes/ConstantNode'
import WeightedAverageNode from './nodes/WeightedAverageNode'
import UnitConverterNode from './nodes/UnitConverterNode'
import { FormulaNode, FormulaEdge } from '@/types/formula.types'

const nodeTypes: NodeTypes = {
  emission_factor: EmissionFactorNode,
  heat_value: HeatValueNode,
  operation: OperationNode,
  constant: ConstantNode,
  weighted_average: WeightedAverageNode,
  unit_conversion: UnitConverterNode
}

interface CanvasAreaProps {
  nodes: FormulaNode[]
  edges: FormulaEdge[]
  onNodesChange: (nodes: FormulaNode[]) => void
  onEdgesChange: (edges: FormulaEdge[]) => void
  reactFlowWrapper: React.RefObject<HTMLDivElement>
  onDropNode: (event: React.DragEvent) => void
  onNodeClick?: NodeMouseHandler
}

export default function CanvasArea({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  reactFlowWrapper,
  onDropNode,
  onNodeClick
}: CanvasAreaProps) {
  const { project } = useReactFlow()

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true
      } as Edge

      onEdgesChange([...edges, newEdge])
    },
    [edges, onEdgesChange]
  )

  const handleNodesChange = useCallback(
    (changes: any) => {
      const updatedNodes = applyNodeChanges(changes, nodes) as FormulaNode[]
      onNodesChange(updatedNodes)
    },
    [nodes, onNodesChange]
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      const updatedEdges = applyEdgeChanges(changes, edges) as FormulaEdge[]
      onEdgesChange(updatedEdges)
    },
    [edges, onEdgesChange]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return (
    <Box
      ref={reactFlowWrapper}
      flex="1"
      bg="white"
      onDrop={onDropNode}
      onDragOver={onDragOver}
      h="100%"
      position="relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'emission_factor':
                return '#bee3f8'
              case 'heat_value':
                return '#c6f6d5'
              case 'operation':
                return '#fed7d7'
              case 'weighted_average':
                return '#b2f5ea'
              case 'unit_conversion':
                return '#e9d8fd'
              default:
                return '#e2e8f0'
            }
          }}
          style={{
            background: '#f7fafc'
          }}
        />
      </ReactFlow>
    </Box>
  )
}
