// ============================================================================
// 模板轉節點轉換邏輯
// ============================================================================

import { FormulaTemplate, FormulaNode, FormulaEdge } from '@/types/formula.types'

/**
 * 模組 ID 到 React Flow 節點類型的映射
 */
const moduleToNodeTypeMap: Record<string, string> = {
  'factor-selector': 'emission_factor',
  'heatvalue-fetcher': 'heat_value',
  'multiply': 'operation',
  'weighted-average': 'weighted_average',
  'weighted-sum': 'operation',
  'unit-converter': 'unit_conversion',
  'constant': 'constant',
}

/**
 * 根據模組 ID 建立節點資料
 */
function createNodeData(moduleId: string, params: Record<string, any>) {
  switch (moduleId) {
    case 'factor-selector':
      return {
        label: '排放係數選擇器',
        factorId: params.ef_id || '',
        factorName: '請選擇係數',
        factorValue: 0,
        factorUnit: 'kg CO₂e',
        category: 'fuel' as const,
      }

    case 'heatvalue-fetcher':
      return {
        label: '熱值查詢',
        country: params.country || '台灣',
        fuelType: params.fuel_type || '天然氣',
        heatValue: 0,
        heatUnit: 'MJ/Nm³',
      }

    case 'multiply':
      return {
        label: '乘法運算',
        operation: 'multiply' as const,
        operationSymbol: '×',
      }

    case 'weighted-average':
      return {
        label: '權重平均',
        operation: 'weighted_average' as const,
        operationSymbol: '⚖️',
        factors: params.factors || [],
      }

    case 'weighted-sum':
      return {
        label: '權重加總',
        operation: 'weighted_sum' as const,
        operationSymbol: 'Σ',
      }

    case 'unit-converter':
      return {
        label: '單位轉換',
        fromUnit: params.from_unit || 'MJ',
        toUnit: params.to_unit || 'kWh',
        conversionFactor: 0.277778,
      }

    case 'constant':
      return {
        label: '常數',
        constantValue: params.value || 1,
        constantUnit: params.unit || '',
      }

    default:
      return {
        label: '未知節點',
      }
  }
}

/**
 * 將模板轉換為 React Flow 節點和邊
 */
export function templateToNodes(template: FormulaTemplate): {
  nodes: FormulaNode[]
  edges: FormulaEdge[]
} {
  const nodes: FormulaNode[] = []
  const edges: FormulaEdge[] = []

  // 轉換模組為節點
  template.modules.forEach((module) => {
    const nodeType = moduleToNodeTypeMap[module.moduleId] || 'operation'

    const node: FormulaNode = {
      id: module.instanceId,
      type: nodeType as any,
      position: module.position || { x: 0, y: 0 },
      data: createNodeData(module.moduleId, module.params),
    }

    nodes.push(node)
  })

  // 自動建立連接線 (依序連接)
  for (let i = 0; i < nodes.length - 1; i++) {
    const edge: FormulaEdge = {
      id: `e${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
      animated: true,
    }
    edges.push(edge)
  }

  return { nodes, edges }
}

/**
 * 檢查節點類型是否需要特殊處理
 */
export function needsSpecialHandling(nodeType: string): boolean {
  return ['weighted_average', 'unit_conversion'].includes(nodeType)
}

/**
 * 取得模板的預設係數名稱建議
 */
export function getTemplateSuggestedName(template: FormulaTemplate): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${template.name} - ${timestamp}`
}
