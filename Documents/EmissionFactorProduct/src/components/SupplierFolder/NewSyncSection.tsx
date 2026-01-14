'use client'

import {
  Box,
  Card,
  CardBody,
  Text,
  HStack,
  VStack,
  Badge,
  Button,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { FiClock, FiPackage } from 'react-icons/fi'
import { SupplierInfo, SupplierProductFactor } from '@/types/types'

interface NewSyncSupplier {
  supplier: SupplierInfo
  products: SupplierProductFactor[]
  sync_time: string
  sync_project_name: string
}

interface NewSyncSectionProps {
  suppliers: NewSyncSupplier[]
  onViewAll?: () => void
  onSupplierClick?: (supplierId: string) => void
}

export default function NewSyncSection({
  suppliers,
  onViewAll,
  onSupplierClick,
}: NewSyncSectionProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const itemBg = useColorModeValue('red.50', 'red.900')
  const itemBorderColor = useColorModeValue('red.200', 'red.700')

  // 格式化相對時間
  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}分鐘前`
    if (diffHours < 24) return `${diffHours}小時前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-TW')
  }

  if (suppliers.length === 0) return null

  return (
    <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack>
            <Text fontSize="lg" fontWeight="semibold">
              最新同步資料
            </Text>
            <Badge colorScheme="red" borderRadius="full" px={2}>
              {suppliers.length}
            </Badge>
          </HStack>
          <Button
            variant="link"
            colorScheme="blue"
            size="sm"
            rightIcon={<ChevronRightIcon />}
            onClick={onViewAll}
          >
            查看全部
          </Button>
        </Flex>

        <VStack spacing={3} align="stretch">
          {suppliers.slice(0, 3).map(({ supplier, products, sync_time, sync_project_name }) => (
            <Box
              key={supplier.id}
              p={4}
              bg={itemBg}
              borderWidth="1px"
              borderColor={itemBorderColor}
              borderRadius="md"
              cursor="pointer"
              _hover={{ opacity: 0.9 }}
              onClick={() => onSupplierClick?.(supplier.id)}
            >
              <Flex justify="space-between" align="flex-start">
                <VStack align="flex-start" spacing={1}>
                  <HStack>
                    <Badge colorScheme="red" variant="solid" fontSize="xs">
                      NEW
                    </Badge>
                    <Text fontWeight="bold">{supplier.company_name}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    專案: {sync_project_name}
                  </Text>
                  <HStack fontSize="sm" color="gray.500" spacing={4}>
                    <HStack>
                      <Icon as={FiPackage} />
                      <Text>產品數: {products.length}</Text>
                    </HStack>
                  </HStack>
                </VStack>

                <VStack align="flex-end" spacing={1}>
                  <HStack fontSize="sm" color="gray.500">
                    <Icon as={FiClock} />
                    <Text>{formatRelativeTime(sync_time)}</Text>
                  </HStack>
                  <Badge colorScheme="orange">待審核</Badge>
                  <HStack spacing={2} mt={2}>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation()
                        onSupplierClick?.(supplier.id)
                      }}
                    >
                      快速查看
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={e => {
                        e.stopPropagation()
                        onSupplierClick?.(supplier.id)
                      }}
                    >
                      詳情
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}
