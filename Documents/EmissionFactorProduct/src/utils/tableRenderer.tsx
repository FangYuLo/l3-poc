import React from 'react'
import { Th, Td, Text, Badge } from '@chakra-ui/react'
import { TableColumnConfig } from '@/config/tableColumns'

// 渲染表頭
export const renderTableHeader = (columns: TableColumnConfig[]) => {
  return columns.map((column) => (
    <Th
      key={column.key}
      width={column.width}
      fontSize="xs"
      fontWeight="medium"
      color="gray.600"
      py={3}
      isNumeric={column.isNumeric}
      bg="gray.50"
    >
      {column.label}
    </Th>
  ))
}

// 渲染表格單元格
export const renderTableCell = (
  column: TableColumnConfig,
  value: any,
  row: any,
  key: string
) => {
  let cellContent: React.ReactNode

  // 使用自定義格式化函數
  if (column.formatter) {
    cellContent = column.formatter(value, row)
  } else {
    // 預設渲染邏輯
    switch (column.type) {
      case 'number':
        cellContent = (
          <Text fontSize="sm" fontFamily="mono">
            {typeof value === 'number' ? value.toLocaleString() : value || '-'}
          </Text>
        )
        break
      case 'badge':
        if (column.key === 'scope') {
          cellContent = (
            <Badge
              size="sm"
              colorScheme={
                value === 'Scope 1' ? 'red' :
                value === 'Scope 2' ? 'blue' : 'green'
              }
            >
              {value}
            </Badge>
          )
        } else if (column.key === 'stage') {
          cellContent = (
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
              {value}
            </Badge>
          )
        } else {
          cellContent = (
            <Badge size="sm" colorScheme="gray">
              {value || '-'}
            </Badge>
          )
        }
        break
      case 'date':
        cellContent = (
          <Text fontSize="sm" color="gray.700">
            {value ? new Date(value).toLocaleDateString('zh-TW') : '-'}
          </Text>
        )
        break
      case 'text':
      default:
        cellContent = (
          <Text fontSize="sm" fontWeight={column.key === 'name' ? 'medium' : 'normal'} noOfLines={2}>
            {value || '-'}
          </Text>
        )
        break
    }
  }

  return (
    <Td key={key} py={4} isNumeric={column.isNumeric}>
      {cellContent}
    </Td>
  )
}

// 渲染完整的表格行
export const renderTableRow = (
  columns: TableColumnConfig[],
  row: any,
  onRowClick?: (row: any) => void,
  isSelected?: boolean
) => {
  return (
    <tr
      key={row.id}
      onClick={() => onRowClick?.(row)}
      style={{
        cursor: onRowClick ? 'pointer' : 'default',
        backgroundColor: isSelected ? '#EDF2F7' : 'white'
      }}
      onMouseEnter={(e) => {
        if (onRowClick && !isSelected) {
          e.currentTarget.style.backgroundColor = '#F7FAFC'
        }
      }}
      onMouseLeave={(e) => {
        if (onRowClick && !isSelected) {
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
    >
      {columns.map((column) => {
        const value = getNestedValue(row, column.key)
        return renderTableCell(column, value, row, `${row.id}-${column.key}`)
      })}
    </tr>
  )
}

// 獲取嵌套物件的值
const getNestedValue = (obj: any, path: string): any => {
  if (!path || !obj) return undefined

  const result = path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, obj)

  // Debug logging for emission_factor.value path
  if (path === 'data.emission_factor.value' && obj.id <= 10010) {
    console.log(`[RENDER] Row ${obj.id}: path="${path}" → result=${result}, obj.data?.emission_factor=`, obj.data?.emission_factor)
  }

  return result
}

// 表格空狀態渲染
export const renderEmptyState = (message: string = '沒有找到符合條件的資料') => {
  return (
    <tr>
      <td colSpan={100} style={{ textAlign: 'center', padding: '2rem' }}>
        <Text color="gray.500" fontSize="sm">
          {message}
        </Text>
      </td>
    </tr>
  )
}

// 表格載入狀態渲染
export const renderLoadingState = (columnCount: number) => {
  return (
    <tr>
      <td colSpan={columnCount} style={{ textAlign: 'center', padding: '2rem' }}>
        <Text color="gray.500" fontSize="sm">
          載入中...
        </Text>
      </td>
    </tr>
  )
}