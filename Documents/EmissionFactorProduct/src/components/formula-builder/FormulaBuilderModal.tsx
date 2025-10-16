'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Flex,
  useToast,
  Input,
  FormControl,
  FormLabel,
  VStack
} from '@chakra-ui/react'
import { ReactFlowProvider } from 'reactflow'
import BlockPanel from './BlockPanel'
import CanvasArea from './CanvasArea'
import ResultPanel from './ResultPanel'
import VisualTemplateSelector from './VisualTemplateSelector'
import FactorSelectorModal from '@/components/FactorSelectorModal'
import UnitSelectorModal from './UnitSelectorModal'
import { FormulaNode, FormulaEdge, FormulaEvaluationResult } from '@/types/formula.types'
import { evaluateFormula } from '@/services/formulaCalculator'
import { getTemplateById } from '@/data/mockFormulaTemplates'
import { templateToNodes, getTemplateSuggestedName } from '@/services/templateToNodes'
import { getAllEmissionFactors } from '@/data/mockDatabase'

interface FormulaBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (factorData: any) => void
}

let nodeIdCounter = 0

export default function FormulaBuilderModal({ isOpen, onClose, onSave }: FormulaBuilderModalProps) {
  const [nodes, setNodes] = useState<FormulaNode[]>([])
  const [edges, setEdges] = useState<FormulaEdge[]>([])
  const [evaluationResult, setEvaluationResult] = useState<FormulaEvaluationResult | null>(null)
  const [factorName, setFactorName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isFactorSelectorOpen, setIsFactorSelectorOpen] = useState(false)
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Debug: 監控 nodes 變化
  useEffect(() => {
    console.log('Nodes state updated:', nodes)
  }, [nodes])

  // 拖曳開始
  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('nodeData', JSON.stringify(data))
    event.dataTransfer.effectAllowed = 'move'
  }

  // 拖曳結束（放置到畫布）
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      const nodeDataStr = event.dataTransfer.getData('nodeData')

      if (!type || !nodeDataStr) {
        console.log('Missing data:', { type, nodeDataStr })
        return
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) {
        console.log('No reactFlowBounds')
        return
      }

      const nodeData = JSON.parse(nodeDataStr)
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      }

      const newNode: FormulaNode = {
        id: `node_${nodeIdCounter++}`,
        type: type as any,
        position,
        data: nodeData
      }

      console.log('Adding new node:', newNode)
      setNodes((nds) => {
        const updated = [...nds, newNode]
        console.log('Updated nodes:', updated)
        return updated
      })
    },
    []
  )


  // 當節點或邊改變時，重新計算公式
  useEffect(() => {
    if (nodes.length > 0) {
      const result = evaluateFormula(nodes, edges)
      setEvaluationResult(result)
    } else {
      setEvaluationResult(null)
    }
  }, [nodes, edges])

  const handleSave = () => {
    if (!factorName.trim()) {
      toast({
        title: '請輸入係數名稱',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    if (!evaluationResult || !evaluationResult.success) {
      toast({
        title: '公式計算失敗',
        description: evaluationResult?.error || '請確認公式是否正確',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // 建立自建係數資料
    const newFactorData = {
      name: factorName,
      value: evaluationResult.finalValue,
      unit: evaluationResult.finalUnit,
      formula: {
        nodes,
        edges
      },
      evaluationSteps: evaluationResult.steps,
      description: `視覺化公式建構：${factorName}`
    }

    onSave(newFactorData)

    toast({
      title: '儲存成功',
      description: `自建係數「${factorName}」已建立`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })

    handleClose()
  }

  // 載入模板
  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = getTemplateById(templateId)
    if (!template) {
      toast({
        title: '載入失敗',
        description: '找不到指定的模板',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // 轉換模板為節點
    const { nodes: newNodes, edges: newEdges } = templateToNodes(template)

    setNodes(newNodes)
    setEdges(newEdges)
    setSelectedTemplateId(templateId)

    // 建議係數名稱
    if (!factorName) {
      setFactorName(getTemplateSuggestedName(template))
    }

    toast({
      title: '模板已載入',
      description: `${template.name} - ${newNodes.length} 個節點`,
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }, [factorName, toast])

  // 處理節點點擊 - 開啟選擇器
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    // 處理排放係數節點
    if (node.type === 'emission_factor') {
      const data = node.data as any
      const isUnselected = data.factorValue === 0 || data.factorName === '請選擇係數'

      if (isUnselected) {
        setSelectedNodeId(node.id)
        setIsFactorSelectorOpen(true)
      }
    }

    // 處理單位轉換節點
    if (node.type === 'unit_conversion') {
      const data = node.data as any
      const isUnconfigured = data.fromUnit === '請設定' || data.toUnit === '請設定' || data.conversionFactor === 0

      if (isUnconfigured) {
        setSelectedNodeId(node.id)
        setIsUnitSelectorOpen(true)
      }
    }
  }, [])

  // 處理係數選擇確認
  const handleFactorConfirm = useCallback((selectedFactors: any[]) => {
    if (selectedFactors.length === 0 || !selectedNodeId) {
      setIsFactorSelectorOpen(false)
      return
    }

    // 取第一個選中的係數（單選模式）
    const factor = selectedFactors[0]

    // 更新對應節點的資料
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNodeId && node.type === 'emission_factor') {
          return {
            ...node,
            data: {
              ...node.data,
              factorId: factor.id,
              factorName: factor.name,
              factorValue: factor.value,
              factorUnit: factor.unit,
              region: factor.region,
              source_type: factor.source_type,
              year: factor.year,
            },
          }
        }
        return node
      })
    )

    setIsFactorSelectorOpen(false)
    setSelectedNodeId(null)

    toast({
      title: '係數已選擇',
      description: `已選擇：${factor.name}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }, [selectedNodeId, toast])

  // 處理單位選擇確認
  const handleUnitConfirm = useCallback((fromUnit: string, toUnit: string, conversionFactor: number) => {
    if (!selectedNodeId) {
      setIsUnitSelectorOpen(false)
      return
    }

    // 更新對應節點的資料
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNodeId && node.type === 'unit_conversion') {
          return {
            ...node,
            data: {
              ...node.data,
              fromUnit,
              toUnit,
              conversionFactor,
            },
          }
        }
        return node
      })
    )

    setIsUnitSelectorOpen(false)
    setSelectedNodeId(null)

    toast({
      title: '單位已設定',
      description: `${fromUnit} → ${toUnit} (係數: ${conversionFactor})`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }, [selectedNodeId, toast])

  // 準備係數資料給 Modal
  const allFactors = getAllEmissionFactors()
  const centralFactors = allFactors.map((f) => ({
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

  const handleClose = () => {
    setNodes([])
    setEdges([])
    setEvaluationResult(null)
    setFactorName('')
    setSelectedTemplateId(null)
    setSelectedNodeId(null)
    setIsFactorSelectorOpen(false)
    setIsUnitSelectorOpen(false)
    nodeIdCounter = 0
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent h="100vh" m={0} borderRadius={0}>
        <ModalHeader borderBottom="1px solid" borderColor="gray.200">
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center">
              <span>視覺化公式建構器</span>
              <ModalCloseButton position="relative" top={0} right={0} />
            </Flex>

            {/* 模板選擇器 */}
            <VisualTemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleLoadTemplate}
            />

            {/* 係數名稱 */}
            <FormControl>
              <FormLabel fontSize="sm" mb={1}>係數名稱</FormLabel>
              <Input
                placeholder="輸入自建係數名稱..."
                value={factorName}
                onChange={(e) => setFactorName(e.target.value)}
                size="sm"
                maxW="400px"
              />
            </FormControl>
          </VStack>
        </ModalHeader>

        <ModalBody p={0} overflow="hidden">
          <ReactFlowProvider>
            <Flex h="full">
              <BlockPanel onDragStart={onDragStart} />
              <CanvasArea
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                reactFlowWrapper={reactFlowWrapper}
                onDropNode={onDrop}
                onNodeClick={handleNodeClick}
              />
              <ResultPanel evaluationResult={evaluationResult} />
            </Flex>
          </ReactFlowProvider>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" mr={3} onClick={handleClose}>
            取消
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isDisabled={!evaluationResult?.success || !factorName.trim()}
          >
            儲存自建係數
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* 係數選擇器 Modal */}
      <FactorSelectorModal
        isOpen={isFactorSelectorOpen}
        onClose={() => {
          setIsFactorSelectorOpen(false)
          setSelectedNodeId(null)
        }}
        onConfirm={handleFactorConfirm}
        centralFactors={centralFactors}
        globalFactors={[]}
      />

      {/* 單位選擇器 Modal */}
      <UnitSelectorModal
        isOpen={isUnitSelectorOpen}
        onClose={() => {
          setIsUnitSelectorOpen(false)
          setSelectedNodeId(null)
        }}
        onConfirm={handleUnitConfirm}
      />
    </Modal>
  )
}
