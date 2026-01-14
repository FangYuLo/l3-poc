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
  Select,
  Input,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Divider,
  Badge,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { FiPackage } from 'react-icons/fi'
import { SupplierProductFactor, SupplierInfo } from '@/types/types'

interface BatchImportL3ModalProps {
  isOpen: boolean
  onClose: () => void
  products: SupplierProductFactor[]
  supplier: SupplierInfo
  onImportComplete: () => void
}

// ISIC 分類選項
const isicCategories = [
  { value: 'C26', label: 'C26 - 電腦、電子及光學產品製造業' },
  { value: 'C27', label: 'C27 - 電氣設備製造業' },
  { value: 'C28', label: 'C28 - 機械設備製造業' },
  { value: 'C29', label: 'C29 - 汽車及其零件製造業' },
  { value: 'C30', label: 'C30 - 其他運輸設備製造業' },
]

// 資料品質選項
const dataQualityOptions = [
  { value: 'Primary', label: 'Primary - 實測數據' },
  { value: 'Secondary', label: 'Secondary - 供應商提供' },
]

// 地理範圍選項
const geographicScopes = [
  { value: 'taiwan', label: '台灣' },
  { value: 'asia', label: '亞洲' },
  { value: 'global', label: '全球' },
]

// 生命週期階段選項
const lifecycleStages = [
  { value: 'cradle_to_gate', label: '搖籃到大門' },
  { value: 'cradle_to_grave', label: '搖籃到墳墓' },
  { value: 'gate_to_gate', label: '大門到大門' },
]

export default function BatchImportL3Modal({
  isOpen,
  onClose,
  products,
  supplier,
  onImportComplete,
}: BatchImportL3ModalProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  // 表單狀態
  const [isicCategory, setIsicCategory] = useState('C26')
  const [dataQuality, setDataQuality] = useState('Secondary')
  const [geographicScope, setGeographicScope] = useState('taiwan')
  const [selectedLifecycle, setSelectedLifecycle] = useState<string[]>(['cradle_to_gate'])
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 處理匯入
  const handleImport = async () => {
    setIsSubmitting(true)

    // 模擬 API 呼叫
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    onImportComplete()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="700px">
        <ModalHeader>批次匯入至L3中央係數庫</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 待匯入項目列表 */}
            <Card bg={cardBg} size="sm">
              <CardBody>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold">待匯入項目</Text>
                  <Badge colorScheme="blue">已選擇 {products.length} 個</Badge>
                </HStack>
                <List spacing={1} maxH="150px" overflowY="auto">
                  {products.map(product => (
                    <ListItem key={product.id} fontSize="sm">
                      <ListIcon as={FiPackage} color="blue.400" />
                      {supplier.company_name} - {product.product_name} ({product.part_number}) -{' '}
                      {product.inventory_year} - {product.total_carbon_footprint.toFixed(2)}{' '}
                      kgCO₂e/{product.quantity_unit}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>

            <Divider />

            {/* L3 匯入設定 */}
            <Text fontWeight="semibold">L3匯入設定</Text>

            <FormControl>
              <FormLabel fontSize="sm">係數分類</FormLabel>
              <Select
                size="sm"
                value={isicCategory}
                onChange={e => setIsicCategory(e.target.value)}
              >
                {isicCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">資料品質</FormLabel>
              <Select
                size="sm"
                value={dataQuality}
                onChange={e => setDataQuality(e.target.value)}
              >
                {dataQualityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">地理範圍</FormLabel>
              <Select
                size="sm"
                value={geographicScope}
                onChange={e => setGeographicScope(e.target.value)}
              >
                {geographicScopes.map(scope => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">生命週期</FormLabel>
              <CheckboxGroup
                value={selectedLifecycle}
                onChange={values => setSelectedLifecycle(values as string[])}
              >
                <HStack spacing={4}>
                  {lifecycleStages.map(stage => (
                    <Checkbox key={stage.value} value={stage.value} size="sm">
                      {stage.label}
                    </Checkbox>
                  ))}
                </HStack>
              </CheckboxGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">備註</FormLabel>
              <Textarea
                size="sm"
                placeholder="批次匯入自供應鏈資料收集專案"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                rows={2}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button
            colorScheme="green"
            leftIcon={<CheckCircleIcon />}
            onClick={handleImport}
            isLoading={isSubmitting}
            loadingText="匯入中..."
          >
            確認匯入
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
