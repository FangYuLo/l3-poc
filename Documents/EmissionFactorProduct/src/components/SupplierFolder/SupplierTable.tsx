'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  HStack,
  IconButton,
  Tooltip,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { FiFolder, FiAlertCircle } from 'react-icons/fi'
import { SupplierListItem } from '@/types/types'

interface SupplierTableProps {
  suppliers: SupplierListItem[]
  onSupplierSelect?: (supplierId: string) => void
}

export default function SupplierTable({ suppliers, onSupplierSelect }: SupplierTableProps) {
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // L3 狀態顯示
  const renderL3Status = (status: SupplierListItem['l3_status']) => {
    switch (status) {
      case 'all_imported':
        return <Badge colorScheme="green">已匯入L3</Badge>
      case 'partial':
        return <Badge colorScheme="yellow">部分匯入</Badge>
      case 'none':
        return <Badge colorScheme="gray">未匯入</Badge>
      default:
        return <Badge colorScheme="gray">-</Badge>
    }
  }

  // 格式化時間
  const formatTime = (isoString: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (suppliers.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Icon as={FiFolder} boxSize={12} color="gray.300" mb={4} />
        <Text color="gray.500">暫無供應商資料</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>供應商</Th>
            <Th>區域</Th>
            <Th isNumeric>產品數</Th>
            <Th isNumeric>最新年度</Th>
            <Th isNumeric>平均碳足跡</Th>
            <Th>狀態</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {suppliers.map(supplier => (
            <Tr
              key={supplier.id}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              onClick={() => onSupplierSelect?.(supplier.id)}
            >
              <Td>
                <HStack spacing={2}>
                  <Icon as={FiFolder} color="blue.400" />
                  <Text fontWeight="medium">{supplier.company_name}</Text>
                  {supplier.has_new_sync && (
                    <Tooltip label="有新同步資料">
                      <Badge colorScheme="red" variant="solid" fontSize="xs">
                        NEW
                      </Badge>
                    </Tooltip>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {supplier.vendor_code}
                </Text>
              </Td>
              <Td>{supplier.region}</Td>
              <Td isNumeric>{supplier.product_count}</Td>
              <Td isNumeric>{supplier.latest_year}</Td>
              <Td isNumeric>
                <Text>
                  {supplier.average_carbon_footprint.toFixed(2)}
                  <Text as="span" fontSize="xs" color="gray.500" ml={1}>
                    kgCO₂e
                  </Text>
                </Text>
              </Td>
              <Td>{renderL3Status(supplier.l3_status)}</Td>
              <Td>
                <Tooltip label="查看詳情">
                  <IconButton
                    aria-label="查看詳情"
                    icon={<ViewIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation()
                      onSupplierSelect?.(supplier.id)
                    }}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
