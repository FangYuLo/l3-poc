// 公式計算引擎

import {
  FormulaNode,
  FormulaEdge,
  FormulaEvaluationResult,
  EvaluationStep,
  EmissionFactorNodeData,
  HeatValueNodeData,
  OperationNodeData,
  ConstantNodeData,
  FormulaValidationResult
} from '@/types/formula.types'
import { calculateResultUnit, checkUnitCompatibility, simplifyUnit } from './unitConverter'

// 評估整個公式圖
export function evaluateFormula(nodes: FormulaNode[], edges: FormulaEdge[]): FormulaEvaluationResult {
  try {
    // 驗證公式
    const validation = validateFormula(nodes, edges)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.map(e => e.message).join('; '),
        steps: []
      }
    }

    // 拓撲排序節點（確保按依賴順序計算）
    const sortedNodes = topologicalSort(nodes, edges)
    if (!sortedNodes) {
      return {
        success: false,
        error: '公式中存在循環引用',
        steps: []
      }
    }

    // 儲存節點計算結果
    const nodeValues = new Map<string, { value: number; unit: string }>()
    const steps: EvaluationStep[] = []

    // 依序計算每個節點
    for (const node of sortedNodes) {
      const result = evaluateNode(node, edges, nodeValues)

      if (!result.success) {
        return {
          success: false,
          error: `計算節點 "${node.data.label}" 時發生錯誤: ${result.error}`,
          steps
        }
      }

      nodeValues.set(node.id, { value: result.value!, unit: result.unit! })

      steps.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeLabel: node.data.label,
        inputValues: result.inputs || [],
        outputValue: result.value!,
        outputUnit: result.unit!,
        description: result.description || ''
      })
    }

    // 找到最終輸出節點（沒有輸出邊的節點）
    const finalNode = findFinalOutputNode(nodes, edges)
    if (!finalNode) {
      return {
        success: false,
        error: '找不到最終輸出節點',
        steps
      }
    }

    const finalResult = nodeValues.get(finalNode.id)
    if (!finalResult) {
      return {
        success: false,
        error: '無法取得最終計算結果',
        steps
      }
    }

    return {
      success: true,
      finalValue: finalResult.value,
      finalUnit: finalResult.unit,
      steps
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      steps: []
    }
  }
}

// 評估單一節點
function evaluateNode(
  node: FormulaNode,
  edges: FormulaEdge[],
  nodeValues: Map<string, { value: number; unit: string }>
): {
  success: boolean
  value?: number
  unit?: string
  inputs?: Array<{ sourceId: string; value: number; unit: string }>
  description?: string
  error?: string
} {
  const nodeType = node.type

  // 獲取輸入節點
  const inputEdges = edges.filter(e => e.target === node.id)
  const inputs = inputEdges.map(e => {
    const sourceValue = nodeValues.get(e.source)
    if (!sourceValue) {
      throw new Error(`找不到節點 ${e.source} 的計算結果`)
    }
    return {
      sourceId: e.source,
      ...sourceValue
    }
  })

  switch (nodeType) {
    case 'emission_factor': {
      const data = node.data as EmissionFactorNodeData
      return {
        success: true,
        value: data.factorValue,
        unit: data.factorUnit,
        inputs: [],
        description: `排放係數: ${data.factorName} = ${data.factorValue} ${data.factorUnit}`
      }
    }

    case 'heat_value': {
      const data = node.data as HeatValueNodeData
      return {
        success: true,
        value: data.heatValue,
        unit: data.heatUnit,
        inputs: [],
        description: `熱值: ${data.country} ${data.fuelType} = ${data.heatValue} ${data.heatUnit}`
      }
    }

    case 'constant': {
      const data = node.data as ConstantNodeData
      return {
        success: true,
        value: data.constantValue,
        unit: data.constantUnit,
        inputs: [],
        description: `常數: ${data.constantValue} ${data.constantUnit}`
      }
    }

    case 'operation': {
      const data = node.data as OperationNodeData

      if (inputs.length !== 2) {
        return {
          success: false,
          error: `運算節點需要兩個輸入，但只有 ${inputs.length} 個`
        }
      }

      const [input1, input2] = inputs
      let resultValue: number
      let resultUnit: string

      // 檢查單位相容性
      const compatibility = checkUnitCompatibility(input1.unit, input2.unit, data.operation)
      if (!compatibility.compatible) {
        return {
          success: false,
          error: compatibility.message
        }
      }

      // 如果需要轉換單位
      let adjustedInput2 = input2
      if (compatibility.requiresConversion && compatibility.conversionFactor) {
        adjustedInput2 = {
          ...input2,
          value: input2.value * compatibility.conversionFactor,
          unit: input1.unit
        }
      }

      switch (data.operation) {
        case 'add':
          resultValue = input1.value + adjustedInput2.value
          resultUnit = input1.unit
          break
        case 'subtract':
          resultValue = input1.value - adjustedInput2.value
          resultUnit = input1.unit
          break
        case 'multiply':
          resultValue = input1.value * input2.value
          resultUnit = calculateResultUnit(input1.unit, input2.unit, 'multiply')
          break
        case 'divide':
          if (input2.value === 0) {
            return { success: false, error: '除數不能為零' }
          }
          resultValue = input1.value / input2.value
          resultUnit = calculateResultUnit(input1.unit, input2.unit, 'divide')
          break
      }

      resultUnit = simplifyUnit(resultUnit)

      return {
        success: true,
        value: resultValue,
        unit: resultUnit,
        inputs,
        description: `${data.operation}: ${input1.value} ${input1.unit} ${data.operationSymbol} ${input2.value} ${input2.unit} = ${resultValue} ${resultUnit}`
      }
    }

    case 'weighted_average': {
      // 加權平均實作（簡化版）
      if (inputs.length === 0) {
        return { success: false, error: '加權平均節點需要至少一個輸入' }
      }

      const totalWeight = inputs.length
      const sum = inputs.reduce((acc, input) => acc + input.value, 0)
      const avgValue = sum / totalWeight
      const resultUnit = inputs[0].unit

      return {
        success: true,
        value: avgValue,
        unit: resultUnit,
        inputs,
        description: `加權平均: (${inputs.map(i => i.value).join(' + ')}) / ${totalWeight} = ${avgValue} ${resultUnit}`
      }
    }

    default:
      return {
        success: false,
        error: `不支援的節點類型: ${nodeType}`
      }
  }
}

// 拓撲排序（Kahn's algorithm）
function topologicalSort(nodes: FormulaNode[], edges: FormulaEdge[]): FormulaNode[] | null {
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  // 初始化
  nodes.forEach(node => {
    inDegree.set(node.id, 0)
    adjList.set(node.id, [])
  })

  // 建構圖
  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    adjList.get(edge.source)?.push(edge.target)
  })

  // 找到所有入度為 0 的節點
  const queue: string[] = []
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId)
  })

  const sorted: FormulaNode[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const node = nodes.find(n => n.id === nodeId)
    if (node) sorted.push(node)

    adjList.get(nodeId)?.forEach(neighborId => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1
      inDegree.set(neighborId, newDegree)
      if (newDegree === 0) queue.push(neighborId)
    })
  }

  // 如果排序後的節點數量不等於總節點數，說明有循環
  return sorted.length === nodes.length ? sorted : null
}

// 找到最終輸出節點
function findFinalOutputNode(nodes: FormulaNode[], edges: FormulaEdge[]): FormulaNode | null {
  const nodesWithOutput = new Set(edges.map(e => e.source))
  const outputNodes = nodes.filter(n => !edges.some(e => e.source === n.id))

  // 返回最後一個沒有輸出邊的節點
  return outputNodes.length > 0 ? outputNodes[outputNodes.length - 1] : null
}

// 驗證公式
function validateFormula(nodes: FormulaNode[], edges: FormulaEdge[]): FormulaValidationResult {
  const errors: FormulaValidationResult['errors'] = []

  // 檢查是否有節點
  if (nodes.length === 0) {
    errors.push({ message: '公式中沒有節點', type: 'error' })
    return { valid: false, errors }
  }

  // 檢查每個運算節點是否有兩個輸入
  nodes.forEach(node => {
    if (node.type === 'operation') {
      const inputCount = edges.filter(e => e.target === node.id).length
      if (inputCount !== 2) {
        errors.push({
          nodeId: node.id,
          message: `運算節點 "${node.data.label}" 需要兩個輸入，但只有 ${inputCount} 個`,
          type: 'error'
        })
      }
    }
  })

  // 檢查是否有孤立節點（沒有連接的節點，除了最終輸出節點）
  const connectedNodes = new Set<string>()
  edges.forEach(edge => {
    connectedNodes.add(edge.source)
    connectedNodes.add(edge.target)
  })

  if (nodes.length > 1) {
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        errors.push({
          nodeId: node.id,
          message: `節點 "${node.data.label}" 沒有連接到其他節點`,
          type: 'warning'
        })
      }
    })
  }

  return {
    valid: errors.filter(e => e.type === 'error').length === 0,
    errors
  }
}
