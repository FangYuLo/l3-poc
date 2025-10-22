import React from 'react'
import { Badge, Text, VStack } from '@chakra-ui/react'
import { formatNumber } from '@/lib/utils'

// 表格欄位配置介面
export interface TableColumnConfig {
  key: string
  label: string
  width: string
  type: 'text' | 'number' | 'badge' | 'date' | 'custom'
  formatter?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  isNumeric?: boolean
}

// 資料夾表格配置介面
export interface FolderTableConfig {
  folderType: string
  displayName: string
  columns: TableColumnConfig[]
  searchPlaceholder: string
}

// 數據品質標籤配置
export const qualityBadgeConfig = {
  Primary: { colorScheme: 'green', label: 'Primary' },
  Secondary: { colorScheme: 'yellow', label: 'Secondary' },
  PACT: { colorScheme: 'blue', label: 'PACT' },
  Custom: { colorScheme: 'orange', label: 'Custom' },
  Standard: { colorScheme: 'blue', label: 'Standard' },
  Supplier: { colorScheme: 'purple', label: 'Supplier' }
} as const

// 渲染品質標籤
export const renderQualityBadge = (row: any, folderType?: string) => {
  let badgeType: keyof typeof qualityBadgeConfig = 'Standard'

  // 根據資料夾類型和係數屬性決定標籤
  if (row.source_type === 'user_defined') {
    badgeType = 'Custom'
  } else if (row.source_type === 'pact') {
    badgeType = 'PACT'
  } else if (row.source_type === 'supplier') {
    badgeType = 'Supplier'
  } else if (row.data_quality === 'Primary') {
    badgeType = 'Primary'
  } else if (row.data_quality === 'Secondary') {
    badgeType = 'Secondary'
  }

  // 希達係數庫中的STANDARD標籤都改為SECONDARY
  if (folderType === 'global_search' && badgeType === 'Standard') {
    badgeType = 'Secondary'
  }

  const config = qualityBadgeConfig[badgeType]
  return (
    <Badge
      size="sm"
      colorScheme={config.colorScheme}
      variant="solid"
    >
      {config.label}
    </Badge>
  )
}

// 渲染排放係數（支援堆疊顯示）
export const renderEmissionValue = (value: number, unit: string) => (
  <VStack align="end" spacing={1}>
    <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
      {formatNumber(value)}
    </Text>
    <Text fontSize="xs" color="gray.500">
      {unit || 'kg CO₂e/unit'}
    </Text>
  </VStack>
)

// 各資料夾的表格配置
export const folderTableConfigs: Record<string, FolderTableConfig> = {
  // 中央係數庫 - 移除啟用日期
  favorites: {
    folderType: 'favorites',
    displayName: '中央係數庫',
    searchPlaceholder: '搜尋係數名稱、單位或地區...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '30%',
        type: 'custom',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '15%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'region',
        label: '國家/區域',
        width: '12%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '台灣'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '15%',
        type: 'text',
        formatter: (value: any, row: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || row.data?.source || row.source || 'ecoinvent'}
          </Text>
        )
      },
      {
        key: 'quality_label',
        label: '數據品質',
        width: '10%',
        type: 'custom',
        formatter: (value: any, row: any) => renderQualityBadge(row)
      },
      {
        key: 'usage_projects',
        label: '引用專案',
        width: '20%',
        type: 'custom',
        formatter: (value: any, row: any) => (
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {row.usageText || '未被使用'}
          </Text>
        )
      }
    ]
  },

  // 自建係數 - 與中央/希達係數庫欄位一致
  user_defined: {
    folderType: 'user_defined',
    displayName: '自建係數',
    searchPlaceholder: '搜尋自建係數名稱...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '30%',
        type: 'custom',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '15%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'region',
        label: '國家/區域',
        width: '12%',
        type: 'text',
        formatter: (value: any, row: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || row.data?.region || '組織自建'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '15%',
        type: 'text',
        formatter: (value: any, row: any) => {
          // 顯示組合係數的組件數量
          const componentCount = row.components?.length || row.data?.components?.length || 0
          const sourceText = componentCount > 0
            ? `組合係數 (${componentCount}個)`
            : '自建係數'
          return (
            <Text fontSize="sm" color="gray.700">
              {sourceText}
            </Text>
          )
        }
      },
      {
        key: 'quality_label',
        label: '數據品質',
        width: '10%',
        type: 'custom',
        formatter: (value: any, row: any) => renderQualityBadge(row)
      },
      {
        key: 'usage_projects',
        label: '引用專案',
        width: '20%',
        type: 'custom',
        formatter: (value: any, row: any) => (
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {row.usageText || '未被使用'}
          </Text>
        )
      }
    ]
  },

  // PACT交換 - 維持現狀
  pact: {
    folderType: 'pact',
    displayName: 'PACT 交換係數',
    searchPlaceholder: '搜尋 PACT 係數名稱...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '35%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '20%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'region',
        label: '國家/區域',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '全球'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '20%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || 'PACT Network'}
          </Text>
        )
      },
      {
        key: 'quality_label',
        label: '標籤',
        width: '10%',
        type: 'custom',
        formatter: (value: any, row: any) => renderQualityBadge(row)
      }
    ]
  },

  // 供應商係數 - 維持現狀
  supplier: {
    folderType: 'supplier',
    displayName: '供應商係數',
    searchPlaceholder: '搜尋供應商係數名稱...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '30%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '18%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'supplier_name',
        label: '供應商',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '-'}
          </Text>
        )
      },
      {
        key: 'validation_status',
        label: '驗證狀態',
        width: '12%',
        type: 'badge',
        formatter: (value: any) => (
          <Badge
            size="sm"
            colorScheme={value === 'verified' ? 'green' : 'yellow'}
          >
            {value === 'verified' ? '已驗證' : '待驗證'}
          </Badge>
        )
      },
      {
        key: 'updated_at',
        label: '更新日期',
        width: '10%',
        type: 'date',
        formatter: (value: any) => (
          <Text fontSize="xs" color="gray.500">
            {value ? new Date(value).toLocaleDateString('zh-TW') : '今日'}
          </Text>
        )
      },
      {
        key: 'quality_label',
        label: '標籤',
        width: '8%',
        type: 'custom',
        formatter: (value: any, row: any) => renderQualityBadge(row)
      },
      {
        key: 'usage_projects',
        label: '使用專案',
        width: '7%',
        type: 'custom',
        formatter: (value: any, row: any) => (
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {row.usageText || '未使用'}
          </Text>
        )
      }
    ]
  },

  // L1 組織碳盤查 - 新設計
  organizational_inventory: {
    folderType: 'organizational_inventory',
    displayName: '排放源清單',
    searchPlaceholder: '搜尋排放源名稱、子類別或氣體種類...',
    columns: [
      {
        key: 'scope',
        label: '範疇',
        width: '12%',
        type: 'badge',
        formatter: (value: any) => (
          <Badge
            size="sm"
            colorScheme={
              value === 'Scope 1' ? 'red' :
              value === 'Scope 2' ? 'blue' : 'green'
            }
            variant="solid"
          >
            {value || 'Scope 1'}
          </Badge>
        )
      },
      {
        key: 'emission_source_category',
        label: '子類別名稱',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '-'}
          </Text>
        )
      },
      {
        key: 'emission_source_name',
        label: '排放源名稱',
        width: '18%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'ghg_gas',
        label: '氣體種類',
        width: '12%',
        type: 'badge',
        formatter: (value: any) => (
          <Badge
            size="sm"
            colorScheme={
              value === 'CO₂' ? 'blue' :
              value === 'CH₄' ? 'green' :
              value === 'N₂O' ? 'orange' :
              value === 'HFCs' ? 'purple' :
              value === 'PFCs' ? 'pink' :
              value === 'SF₆' ? 'red' :
              value === 'NF₃' ? 'cyan' : 'gray'
            }
          >
            {value || 'CO₂'}
          </Badge>
        )
      },
      {
        key: 'emission_factor_value',
        label: '排放係數',
        width: '18%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => {
          // 從 data.emission_factor 取出係數值
          const factorValue = row.data?.emission_factor?.value || 0
          const factorUnit = row.data?.emission_factor?.unit || 'kg CO₂e'
          return renderEmissionValue(factorValue, factorUnit)
        }
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || 'ecoinvent'}
          </Text>
        )
      },
      {
        key: 'emission_factor_name',
        label: '係數名稱',
        width: '17%',
        type: 'text',
        formatter: (value: any, row: any) => {
          // 從 data.emission_factor 取出係數名稱
          const factorName = row.data?.emission_factor?.name || row.factor_selection || '-'
          return (
            <Text fontSize="sm" color="blue.600" noOfLines={2}>
              {factorName}
            </Text>
          )
        }
      }
    ]
  },

  // L2 產品碳足跡 - 新設計
  product_carbon_footprint: {
    folderType: 'product_carbon_footprint',
    displayName: '產品生命週期清單',
    searchPlaceholder: '搜尋生命週期、項目或係數來源...',
    columns: [
      {
        key: 'stage',
        label: '生命週期',
        width: '15%',
        type: 'badge',
        formatter: (value: any) => (
          <Badge
            size="sm"
            colorScheme={
              value === '原物料' ? 'blue' :
              value === '製造' ? 'green' :
              value === '配送' ? 'purple' :
              value === '使用' ? 'orange' :
              value === '廢棄' ? 'red' : 'gray'
            }
            variant="subtle"
          >
            {value || '原物料'}
          </Badge>
        )
      },
      {
        key: 'item_name',
        label: '項目',
        width: '25%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'emission_factor_value',
        label: '排放係數',
        width: '18%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => {
          // 從 data.emission_factor 取出係數值和單位
          const factorValue = row.data?.emission_factor?.value || 0
          const factorUnit = row.data?.emission_factor?.unit || 'kg CO₂e'
          return renderEmissionValue(factorValue, factorUnit)
        }
      },
      {
        key: 'unit',
        label: '單位',
        width: '12%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700" fontFamily="mono">
            {value || 'kg CO₂e'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || 'ecoinvent'}
          </Text>
        )
      },
      {
        key: 'allocation_principle',
        label: '分配原則',
        width: '15%',
        type: 'badge',
        formatter: (value: any) => (
          <Badge
            size="sm"
            colorScheme={
              value === '質量分配' ? 'green' :
              value === '經濟分配' ? 'blue' :
              value === '產量分配' ? 'purple' :
              value === '能源分配' ? 'orange' : 'gray'
            }
            variant="outline"
          >
            {value || '質量分配'}
          </Badge>
        )
      }
    ]
  },

  // 動態資料集 - 新配置
  dataset: {
    folderType: 'dataset',
    displayName: '動態資料集',
    searchPlaceholder: '搜尋係數名稱、單位或地區...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '35%',
        type: 'custom',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '20%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'region',
        label: '國家/區域',
        width: '15%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '台灣'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '20%',
        type: 'text',
        formatter: (value: any, row: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || row.source || 'ecoinvent'}
          </Text>
        )
      },
      {
        key: 'quality_label',
        label: '標籤',
        width: '10%',
        type: 'custom',
        formatter: (value: any, row: any) => renderQualityBadge(row)
      }
    ]
  },

  // 希達係數庫
  global_search: {
    folderType: 'global_search',
    displayName: '希達係數庫',
    searchPlaceholder: '搜尋係數名稱、單位或地區...',
    columns: [
      {
        key: 'name',
        label: '名稱',
        width: '30%',
        type: 'custom',
        formatter: (value: any) => (
          <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
            {value}
          </Text>
        )
      },
      {
        key: 'value',
        label: '排放係數',
        width: '15%',
        type: 'custom',
        isNumeric: true,
        formatter: (value: any, row: any) => renderEmissionValue(value, row.unit)
      },
      {
        key: 'region',
        label: '國家/區域',
        width: '12%',
        type: 'text',
        formatter: (value: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || '台灣'}
          </Text>
        )
      },
      {
        key: 'source_ref',
        label: '係數來源',
        width: '15%',
        type: 'text',
        formatter: (value: any, row: any) => (
          <Text fontSize="sm" color="gray.700">
            {value || row.data?.source || row.source || 'ecoinvent'}
          </Text>
        )
      },
      {
        key: 'quality_label',
        label: '數據品質',
        width: '10%',
        type: 'custom',
        formatter: (_value: any, row: any) => renderQualityBadge(row, 'global_search')
      },
      {
        key: 'usage_projects',
        label: '引用專案',
        width: '20%',
        type: 'custom',
        formatter: (_value: any, row: any) => (
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {row.usageText || '未被使用'}
          </Text>
        )
      }
    ]
  }
}

// 獲取表格配置的輔助函數
export const getTableConfig = (nodeType: string): FolderTableConfig => {
  return folderTableConfigs[nodeType] || folderTableConfigs.favorites
}

// 獲取搜尋佔位符
export const getSearchPlaceholder = (nodeType: string): string => {
  const config = getTableConfig(nodeType)
  return config.searchPlaceholder
}