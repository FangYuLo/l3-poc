'use client'

import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  Divider,
  Badge,
  Icon,
  Card,
  CardBody,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'
import {
  FiFileText,
  FiCalendar,
  FiUser,
  FiFile,
  FiPackage,
  FiHash,
  FiLayers,
} from 'react-icons/fi'
import { SupplierProductFactor, SupplierInfo } from '@/types/types'

interface FactorReviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: SupplierProductFactor
  supplier: SupplierInfo
  historyData?: SupplierProductFactor[]
  onApprove: () => void
  onReject: () => void
  onHold?: () => void
  currentIndex?: number
  totalCount?: number
  onNext?: () => void
  onPrev?: () => void
}

export default function FactorReviewModal({
  isOpen,
  onClose,
  product,
  supplier,
  historyData = [],
  onApprove,
  onReject,
  onHold,
  currentIndex = 0,
  totalCount = 1,
  onNext,
  onPrev,
}: FactorReviewModalProps) {
  const [reviewComment, setReviewComment] = useState('')

  const cardBg = useColorModeValue('gray.50', 'gray.700')
  const sourceBg = useColorModeValue('blue.50', 'blue.900')

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

  // 計算碳足跡各階段百分比
  const rawMaterialPercent =
    (product.raw_material_stage / product.total_carbon_footprint) * 100
  const manufacturingPercent =
    (product.manufacturing_stage / product.total_carbon_footprint) * 100

  // 取得歷史比較資料
  const previousYearData = historyData.find(
    h => h.inventory_year === product.inventory_year - 1
  )

  // 計算變化百分比
  const calculateChange = () => {
    if (!previousYearData) return null
    const change =
      ((product.total_carbon_footprint - previousYearData.total_carbon_footprint) /
        previousYearData.total_carbon_footprint) *
      100
    return change
  }

  const changePercent = calculateChange()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>
          <HStack justify="space-between">
            <HStack>
              <Text>產品係數審核</Text>
              <Text color="gray.500" fontSize="md" fontWeight="normal">
                - {product.product_name} ({product.part_number})
              </Text>
            </HStack>
            {totalCount > 1 && (
              <HStack>
                <IconButton
                  aria-label="上一個"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="ghost"
                  isDisabled={currentIndex <= 0}
                  onClick={onPrev}
                />
                <Text fontSize="sm" color="gray.500">
                  {currentIndex + 1} / {totalCount}
                </Text>
                <IconButton
                  aria-label="下一個"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="ghost"
                  isDisabled={currentIndex >= totalCount - 1}
                  onClick={onNext}
                />
              </HStack>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 資料來源追溯 */}
            <Card bg={sourceBg} size="sm">
              <CardBody>
                <Text fontWeight="semibold" mb={3}>
                  資料來源追溯
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                  <HStack>
                    <Icon as={FiFileText} color="blue.500" />
                    <Text fontSize="sm">收集專案:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {product.sync_project_name}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text fontSize="sm">提交時間:</Text>
                    <Text fontSize="sm">{formatDateTime(product.sync_time)}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiUser} color="blue.500" />
                    <Text fontSize="sm">提交人:</Text>
                    <Text fontSize="sm">
                      {supplier.contact_person} ({supplier.company_name})
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiFile} color="blue.500" />
                    <Text fontSize="sm">原始檔案:</Text>
                    <Text fontSize="sm" color="blue.500" cursor="pointer">
                      供應鏈資料收集_{supplier.vendor_code}.xlsx
                    </Text>
                  </HStack>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* 產品資訊 */}
            <Card bg={cardBg} size="sm">
              <CardBody>
                <Text fontWeight="semibold" mb={3}>
                  產品資訊
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                  <HStack>
                    <Icon as={FiPackage} color="gray.500" />
                    <Text fontSize="sm">產品名稱:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {product.product_name}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiHash} color="gray.500" />
                    <Text fontSize="sm">料號:</Text>
                    <Text fontSize="sm" fontFamily="mono">
                      {product.part_number}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="gray.500" />
                    <Text fontSize="sm">盤查年度:</Text>
                    <Text fontSize="sm">{product.inventory_year}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiLayers} color="gray.500" />
                    <Text fontSize="sm">生產數量:</Text>
                    <Text fontSize="sm">
                      {product.production_quantity.toLocaleString()} {product.quantity_unit}
                    </Text>
                  </HStack>
                  <HStack gridColumn="span 2">
                    <Text fontSize="sm">總碳足跡:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                      {product.total_carbon_footprint.toFixed(2)} kgCO₂e/{product.quantity_unit}
                    </Text>
                  </HStack>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* 碳足跡明細 */}
            <Card bg={cardBg} size="sm">
              <CardBody>
                <Text fontWeight="semibold" mb={3}>
                  碳足跡明細
                </Text>
                <VStack spacing={3} align="stretch">
                  {/* 原物料階段 */}
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">🏭 原物料階段</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {product.raw_material_stage.toFixed(2)} kgCO₂e
                        </Text>
                        <Badge colorScheme="blue">{rawMaterialPercent.toFixed(1)}%</Badge>
                      </HStack>
                    </HStack>
                    <Progress
                      value={rawMaterialPercent}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  {/* 製造階段 */}
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">🏗️ 製造階段</Text>
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {product.manufacturing_stage.toFixed(2)} kgCO₂e
                        </Text>
                        <Badge colorScheme="purple">{manufacturingPercent.toFixed(1)}%</Badge>
                      </HStack>
                    </HStack>
                    <Progress
                      value={manufacturingPercent}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  <Divider />

                  {/* 合計 */}
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold">
                      💹 合計
                    </Text>
                    <HStack>
                      <Text fontSize="md" fontWeight="bold">
                        {product.total_carbon_footprint.toFixed(2)} kgCO₂e
                      </Text>
                      <Badge colorScheme="green">100%</Badge>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* 歷史比較 */}
            {previousYearData && (
              <Card bg={cardBg} size="sm">
                <CardBody>
                  <Text fontWeight="semibold" mb={3}>
                    歷史比較
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Stat size="sm">
                      <StatLabel>{previousYearData.inventory_year}年</StatLabel>
                      <StatNumber fontSize="lg">
                        {previousYearData.total_carbon_footprint.toFixed(2)} kgCO₂e/
                        {previousYearData.quantity_unit}
                      </StatNumber>
                    </Stat>
                    <Text fontSize="2xl" color="gray.400">
                      →
                    </Text>
                    <Stat size="sm">
                      <StatLabel>{product.inventory_year}年</StatLabel>
                      <StatNumber fontSize="lg">
                        {product.total_carbon_footprint.toFixed(2)} kgCO₂e/
                        {product.quantity_unit}
                      </StatNumber>
                    </Stat>
                    <Stat size="sm" textAlign="right">
                      <StatLabel>變化</StatLabel>
                      <StatHelpText fontSize="lg" m={0}>
                        <StatArrow type={changePercent! < 0 ? 'decrease' : 'increase'} />
                        {Math.abs(changePercent!).toFixed(1)}%
                      </StatHelpText>
                      <Text fontSize="xs" color={changePercent! < 0 ? 'green.500' : 'red.500'}>
                        {changePercent! < 0 ? '(改善)' : '(增加)'}
                      </Text>
                    </Stat>
                  </HStack>
                </CardBody>
              </Card>
            )}

            {/* 審核意見 */}
            <Card bg={cardBg} size="sm">
              <CardBody>
                <Text fontWeight="semibold" mb={3}>
                  審核決定
                </Text>
                <Textarea
                  placeholder="請輸入審核意見（選填）"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  size="sm"
                  rows={3}
                />
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {onHold && (
              <Button variant="ghost" onClick={onHold}>
                ⏸️ 暫緩處理
              </Button>
            )}
            <Button
              colorScheme="red"
              variant="outline"
              leftIcon={<CloseIcon />}
              onClick={onReject}
            >
              退回修正
            </Button>
            <Button colorScheme="green" leftIcon={<CheckIcon />} onClick={onApprove}>
              通過審核
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
