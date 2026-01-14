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
  Checkbox,
  IconButton,
  Tooltip,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { FiClock } from 'react-icons/fi'
import { SupplierProductFactor, SupplierReviewStatus, L3ImportStatus } from '@/types/types'

interface SupplierProductTableProps {
  products: SupplierProductFactor[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onReview?: (product: SupplierProductFactor) => void
  onViewHistory?: (product: SupplierProductFactor) => void
}

export default function SupplierProductTable({
  products,
  selectedIds,
  onSelectionChange,
  onReview,
  onViewHistory,
}: SupplierProductTableProps) {
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const newBg = useColorModeValue('red.50', 'red.900')

  // 全選/取消全選
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id))
    } else {
      onSelectionChange([])
    }
  }

  // 單選
  const handleSelect = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, productId])
    } else {
      onSelectionChange(selectedIds.filter(id => id !== productId))
    }
  }

  // 審核狀態顯示
  const renderReviewStatus = (status: SupplierReviewStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge colorScheme="red" variant="subtle">
            <HStack spacing={1}>
              <Box w={2} h={2} bg="red.500" borderRadius="full" />
              <Text>新</Text>
            </HStack>
          </Badge>
        )
      case 'reviewing':
        return <Badge colorScheme="yellow">審核中</Badge>
      case 'approved':
        return (
          <Badge colorScheme="green">
            <HStack spacing={1}>
              <CheckIcon boxSize={3} />
              <Text>已通過</Text>
            </HStack>
          </Badge>
        )
      case 'rejected':
        return (
          <Badge colorScheme="red">
            <HStack spacing={1}>
              <CloseIcon boxSize={3} />
              <Text>已退回</Text>
            </HStack>
          </Badge>
        )
      default:
        return <Badge>-</Badge>
    }
  }

  // L3 狀態顯示
  const renderL3Status = (status: L3ImportStatus) => {
    switch (status) {
      case 'imported':
        return <CheckIcon color="green.500" />
      case 'importing':
        return <Icon as={FiClock} color="blue.500" />
      case 'not_imported':
        return <Text color="gray.400">-</Text>
      default:
        return <Text>-</Text>
    }
  }

  // 判斷是否全選
  const isAllSelected = products.length > 0 && selectedIds.length === products.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">暫無產品資料</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th w="40px">
              <Checkbox
                isChecked={isAllSelected}
                isIndeterminate={isIndeterminate}
                onChange={e => handleSelectAll(e.target.checked)}
              />
            </Th>
            <Th>年度</Th>
            <Th>產品名稱</Th>
            <Th>料號</Th>
            <Th isNumeric>碳足跡</Th>
            <Th>單位</Th>
            <Th>狀態</Th>
            <Th textAlign="center">L3</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map(product => (
            <Tr
              key={product.id}
              bg={product.sync_status === 'new' ? newBg : undefined}
              _hover={{ bg: hoverBg }}
            >
              <Td>
                <Checkbox
                  isChecked={selectedIds.includes(product.id)}
                  onChange={e => handleSelect(product.id, e.target.checked)}
                />
              </Td>
              <Td>{product.inventory_year}</Td>
              <Td>
                <Text fontWeight="medium">{product.product_name}</Text>
                {product.notes && (
                  <Text fontSize="xs" color="gray.500">
                    {product.notes}
                  </Text>
                )}
              </Td>
              <Td>
                <Text fontFamily="mono" fontSize="sm">
                  {product.part_number}
                </Text>
              </Td>
              <Td isNumeric>
                <Text fontWeight="medium">{product.total_carbon_footprint.toFixed(2)}</Text>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.600">
                  kgCO₂e/{product.quantity_unit}
                </Text>
              </Td>
              <Td>{renderReviewStatus(product.review_status)}</Td>
              <Td textAlign="center">{renderL3Status(product.l3_status)}</Td>
              <Td>
                <HStack spacing={1}>
                  {product.review_status === 'pending' ? (
                    <Tooltip label="審核">
                      <IconButton
                        aria-label="審核"
                        icon={<ViewIcon />}
                        size="xs"
                        colorScheme="blue"
                        onClick={() => onReview?.(product)}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip label="查看">
                      <IconButton
                        aria-label="查看"
                        icon={<ViewIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={() => onReview?.(product)}
                      />
                    </Tooltip>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
