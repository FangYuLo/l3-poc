'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  IconButton,
  Divider,
  SimpleGrid,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons'
import {
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiHash,
  FiFileText,
} from 'react-icons/fi'
import { useMockData } from '@/hooks/useMockData'
import {
  SupplierInfo,
  SupplierProductFactor,
  SupplierSyncStatus,
  SupplierReviewStatus,
  L3ImportStatus,
} from '@/types/types'
import SupplierProductTable from './SupplierProductTable'
import FactorReviewModal from './FactorReviewModal'
import BatchImportL3Modal from './BatchImportL3Modal'

interface SupplierDetailPageProps {
  supplierId: string
  onBack?: () => void
}

export default function SupplierDetailPage({ supplierId, onBack }: SupplierDetailPageProps) {
  const {
    getSupplierById,
    getProductFactorsBySupplierId,
    getProductHistoryComparison,
  } = useMockData()

  const toast = useToast()

  // 取得資料
  const supplier = getSupplierById(supplierId)
  const products = getProductFactorsBySupplierId(supplierId)

  // 狀態管理
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewingProduct, setReviewingProduct] = useState<SupplierProductFactor | null>(null)
  const [importL3ModalOpen, setImportL3ModalOpen] = useState(false)

  // 顏色設定
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const syncInfoBg = useColorModeValue('blue.50', 'blue.900')

  // 取得最新同步資訊
  const latestSyncInfo = useMemo(() => {
    if (products.length === 0) return null
    const sorted = [...products].sort(
      (a, b) => new Date(b.sync_time).getTime() - new Date(a.sync_time).getTime()
    )
    return sorted[0]
  }, [products])

  // 統計資訊
  const stats = useMemo(() => {
    const newCount = products.filter(p => p.sync_status === 'new').length
    const pendingCount = products.filter(p => p.review_status === 'pending').length
    const approvedCount = products.filter(p => p.review_status === 'approved').length
    const importedCount = products.filter(p => p.l3_status === 'imported').length

    return { newCount, pendingCount, approvedCount, importedCount }
  }, [products])

  // 格式化時間
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 同步狀態顯示
  const renderSyncStatus = (status: SupplierSyncStatus) => {
    switch (status) {
      case 'new':
        return <Badge colorScheme="red">新同步待審核</Badge>
      case 'viewed':
        return <Badge colorScheme="yellow">已查看</Badge>
      case 'processed':
        return <Badge colorScheme="green">已處理</Badge>
      default:
        return <Badge>-</Badge>
    }
  }

  // L3 狀態顯示
  const renderL3Status = (status: L3ImportStatus) => {
    switch (status) {
      case 'imported':
        return <Badge colorScheme="green">已匯入</Badge>
      case 'importing':
        return <Badge colorScheme="blue">匯入中</Badge>
      case 'not_imported':
        return <Badge colorScheme="gray">待處理</Badge>
      default:
        return <Badge>-</Badge>
    }
  }

  // 處理選取變更
  const handleSelectionChange = (productIds: string[]) => {
    setSelectedProducts(productIds)
  }

  // 開啟審核 Modal
  const handleReview = (product: SupplierProductFactor) => {
    setReviewingProduct(product)
    setReviewModalOpen(true)
  }

  // 批次審核
  const handleBatchReview = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: '請先選擇產品',
        status: 'warning',
        duration: 2000,
      })
      return
    }
    // 取得第一個選中的產品開始審核
    const firstProduct = products.find(p => p.id === selectedProducts[0])
    if (firstProduct) {
      handleReview(firstProduct)
    }
  }

  // 批次匯入 L3
  const handleBatchImportL3 = () => {
    // 只能匯入已審核通過的產品
    const approvedSelected = selectedProducts.filter(id => {
      const product = products.find(p => p.id === id)
      return product?.review_status === 'approved' && product?.l3_status !== 'imported'
    })

    if (approvedSelected.length === 0) {
      toast({
        title: '沒有可匯入的產品',
        description: '請選擇已審核通過且尚未匯入的產品',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setImportL3ModalOpen(true)
  }

  // 審核完成回調
  const handleReviewComplete = (productId: string, result: 'approved' | 'rejected') => {
    toast({
      title: result === 'approved' ? '審核通過' : '已退回',
      status: result === 'approved' ? 'success' : 'info',
      duration: 2000,
    })

    // 如果是批次審核，繼續下一個
    const currentIndex = selectedProducts.indexOf(productId)
    if (currentIndex < selectedProducts.length - 1) {
      const nextProduct = products.find(p => p.id === selectedProducts[currentIndex + 1])
      if (nextProduct) {
        setReviewingProduct(nextProduct)
        return
      }
    }

    setReviewModalOpen(false)
    setReviewingProduct(null)
  }

  // 匯入完成回調
  const handleImportComplete = () => {
    toast({
      title: '匯入成功',
      description: `已成功匯入 ${selectedProducts.length} 筆係數到中央庫`,
      status: 'success',
      duration: 3000,
    })
    setImportL3ModalOpen(false)
    setSelectedProducts([])
  }

  if (!supplier) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">找不到供應商資料</Text>
        <Button mt={4} onClick={onBack}>
          返回列表
        </Button>
      </Box>
    )
  }

  return (
    <Box p={6} h="100%" overflow="auto">
      {/* 頁面標題 */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <IconButton
            aria-label="返回"
            icon={<ArrowBackIcon />}
            variant="ghost"
            onClick={onBack}
          />
          <Text fontSize="2xl" fontWeight="bold">
            {supplier.company_name}
          </Text>
          {stats.newCount > 0 && (
            <Badge colorScheme="red" variant="solid">
              {stats.newCount} 筆新資料
            </Badge>
          )}
        </HStack>

        <HStack>
          <Button leftIcon={<Icon as={FiFileText} />} variant="outline" size="sm">
            審核歷史
          </Button>
          <Button leftIcon={<DownloadIcon />} variant="outline" size="sm">
            匯出報告
          </Button>
        </HStack>
      </Flex>

      {/* 同步資訊卡片 */}
      {latestSyncInfo && (
        <Card mb={6} bg={syncInfoBg} borderColor={borderColor} borderWidth="1px">
          <CardBody py={4}>
            <HStack spacing={6} flexWrap="wrap">
              <HStack>
                <Icon as={FiRefreshCw} color="blue.500" />
                <Text fontWeight="medium">資料來源:</Text>
                <Text>{latestSyncInfo.sync_project_name}</Text>
              </HStack>
              <Divider orientation="vertical" h="20px" />
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  首次同步: {formatDateTime(products[products.length - 1]?.sync_time)}
                </Text>
              </HStack>
              <Divider orientation="vertical" h="20px" />
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  最後更新: {formatDateTime(latestSyncInfo.sync_time)}
                </Text>
              </HStack>
              <Divider orientation="vertical" h="20px" />
              <HStack>
                <Text fontSize="sm">同步狀態:</Text>
                {renderSyncStatus(latestSyncInfo.sync_status)}
              </HStack>
              <Divider orientation="vertical" h="20px" />
              <HStack>
                <Text fontSize="sm">L3匯入:</Text>
                {renderL3Status(latestSyncInfo.l3_status)}
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* 基本資訊卡片 */}
      <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            基本資訊
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <HStack>
              <Icon as={FiHash} color="gray.500" />
              <Text color="gray.600">Vendor Code:</Text>
              <Text fontWeight="medium">{supplier.vendor_code}</Text>
            </HStack>
            <HStack>
              <Icon as={FiMapPin} color="gray.500" />
              <Text color="gray.600">區域:</Text>
              <Text fontWeight="medium">{supplier.region}</Text>
            </HStack>
            {supplier.company_address && (
              <HStack gridColumn={{ md: 'span 2' }}>
                <Icon as={FiMapPin} color="gray.500" />
                <Text color="gray.600">地址:</Text>
                <Text>{supplier.company_address}</Text>
              </HStack>
            )}
            <HStack>
              <Icon as={FiUser} color="gray.500" />
              <Text color="gray.600">聯絡人:</Text>
              <Text>{supplier.contact_person}</Text>
            </HStack>
            {supplier.contact_number && (
              <HStack>
                <Icon as={FiPhone} color="gray.500" />
                <Text color="gray.600">電話:</Text>
                <Text>{supplier.contact_number}</Text>
              </HStack>
            )}
            <HStack>
              <Icon as={FiMail} color="gray.500" />
              <Text color="gray.600">Email:</Text>
              <Text>{supplier.contact_email}</Text>
            </HStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* 產品碳足跡係數表格 */}
      <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              產品碳足跡係數
            </Text>
            <HStack>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleBatchReview}
                isDisabled={selectedProducts.length === 0}
              >
                批次審核
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                onClick={handleBatchImportL3}
                isDisabled={selectedProducts.length === 0}
              >
                批次匯入L3
              </Button>
            </HStack>
          </Flex>

          <SupplierProductTable
            products={products}
            selectedIds={selectedProducts}
            onSelectionChange={handleSelectionChange}
            onReview={handleReview}
            onViewHistory={(product) => {
              const history = getProductHistoryComparison(supplierId, product.part_number)
              console.log('History:', history)
            }}
          />

          {selectedProducts.length > 0 && (
            <Flex
              mt={4}
              p={3}
              bg={useColorModeValue('gray.100', 'gray.700')}
              borderRadius="md"
              justify="space-between"
              align="center"
            >
              <Text fontSize="sm">已選擇 {selectedProducts.length} 個項目</Text>
              <HStack>
                <Button size="sm" variant="outline" onClick={handleBatchReview}>
                  審核選中
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedProducts([])}
                >
                  取消
                </Button>
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* 審核 Modal */}
      {reviewingProduct && (
        <FactorReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false)
            setReviewingProduct(null)
          }}
          product={reviewingProduct}
          supplier={supplier}
          historyData={getProductHistoryComparison(supplierId, reviewingProduct.part_number)}
          onApprove={() => handleReviewComplete(reviewingProduct.id, 'approved')}
          onReject={() => handleReviewComplete(reviewingProduct.id, 'rejected')}
          currentIndex={selectedProducts.indexOf(reviewingProduct.id)}
          totalCount={selectedProducts.length}
          onNext={() => {
            const currentIndex = selectedProducts.indexOf(reviewingProduct.id)
            if (currentIndex < selectedProducts.length - 1) {
              const nextProduct = products.find(p => p.id === selectedProducts[currentIndex + 1])
              if (nextProduct) setReviewingProduct(nextProduct)
            }
          }}
          onPrev={() => {
            const currentIndex = selectedProducts.indexOf(reviewingProduct.id)
            if (currentIndex > 0) {
              const prevProduct = products.find(p => p.id === selectedProducts[currentIndex - 1])
              if (prevProduct) setReviewingProduct(prevProduct)
            }
          }}
        />
      )}

      {/* 批次匯入 L3 Modal */}
      <BatchImportL3Modal
        isOpen={importL3ModalOpen}
        onClose={() => setImportL3ModalOpen(false)}
        products={products.filter(
          p =>
            selectedProducts.includes(p.id) &&
            p.review_status === 'approved' &&
            p.l3_status !== 'imported'
        )}
        supplier={supplier}
        onImportComplete={handleImportComplete}
      />
    </Box>
  )
}
