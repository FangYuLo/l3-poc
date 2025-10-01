'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Text,
  Divider,
  Checkbox,
  CheckboxGroup,
  Stack,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ProductCarbonFootprintSummary, ImportToCentralFormData, DataQuality } from '@/types/types'

interface ImportToCentralModalProps {
  isOpen: boolean
  onClose: () => void
  summary: ProductCarbonFootprintSummary
  onConfirm: (formData: ImportToCentralFormData) => Promise<void>
}

export default function ImportToCentralModal({
  isOpen,
  onClose,
  summary,
  onConfirm,
}: ImportToCentralModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 表單狀態
  const [formData, setFormData] = useState<ImportToCentralFormData>({
    factor_name: `${summary.productName}-產品碳足跡`,
    functional_unit: summary.functionalUnit,
    carbon_footprint_value: summary.totalFootprint,
    unit: summary.unit,
    product_categories: [],
    geographic_scope: 'taiwan',
    valid_from: new Date().getFullYear().toString(),
    valid_years: 3,
    system_boundary: 'cradle_to_grave',
    exclusions: '',
    primary_data_percentage: 65,
    secondary_data_percentage: 35,
    data_quality: 'Secondary',
    usage_notes: '',
  })

  const handleSubmit = async () => {
    // 驗證必填欄位
    if (formData.product_categories.length === 0) {
      toast({
        title: '請至少選擇一個產品類別',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(formData)
      toast({
        title: '匯入成功',
        description: '產品碳足跡係數已成功匯入中央庫',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: '匯入失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>產品碳足跡係數匯入設定</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 基本資訊 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【基本資訊】（自動帶入，可編輯）
            </Text>

            <FormControl isRequired>
              <FormLabel>係數名稱</FormLabel>
              <Input
                value={formData.factor_name}
                onChange={(e) => setFormData({ ...formData, factor_name: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>功能單位</FormLabel>
              <Input
                value={formData.functional_unit}
                onChange={(e) => setFormData({ ...formData, functional_unit: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>碳足跡值</FormLabel>
              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                {formData.carbon_footprint_value.toFixed(1)} {formData.unit}
              </Text>
            </FormControl>

            <Divider />

            {/* 適用範圍 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【適用範圍】（必填）
            </Text>

            <FormControl isRequired>
              <FormLabel>產品類別</FormLabel>
              <CheckboxGroup
                value={formData.product_categories}
                onChange={(values) => setFormData({ ...formData, product_categories: values as string[] })}
              >
                <Stack spacing={2}>
                  <Checkbox value="電子產品">電子產品</Checkbox>
                  <Checkbox value="消費性電子">消費性電子</Checkbox>
                  <Checkbox value="通訊設備">通訊設備</Checkbox>
                  <Checkbox value="照明設備">照明設備</Checkbox>
                  <Checkbox value="電腦設備">電腦設備</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>地理範圍</FormLabel>
              <RadioGroup
                value={formData.geographic_scope}
                onChange={(value) => setFormData({ ...formData, geographic_scope: value })}
              >
                <Stack direction="row" spacing={4}>
                  <Radio value="taiwan">台灣</Radio>
                  <Radio value="asia">亞洲</Radio>
                  <Radio value="global">全球</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <HStack>
              <FormControl isRequired flex={1}>
                <FormLabel>有效年份</FormLabel>
                <Select
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </Select>
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel>預計有效期</FormLabel>
                <Select
                  value={formData.valid_years}
                  onChange={(e) => setFormData({ ...formData, valid_years: parseInt(e.target.value) })}
                >
                  <option value="3">3 年</option>
                  <option value="5">5 年</option>
                  <option value="10">10 年</option>
                </Select>
              </FormControl>
            </HStack>

            <Divider />

            {/* 計算邊界 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【計算邊界說明】（必填）
            </Text>

            <FormControl isRequired>
              <FormLabel>系統邊界</FormLabel>
              <RadioGroup
                value={formData.system_boundary}
                onChange={(value) => setFormData({ ...formData, system_boundary: value })}
              >
                <Stack spacing={2}>
                  <Radio value="cradle_to_grave">搖籃到墳墓（全生命週期）</Radio>
                  <Radio value="cradle_to_gate">搖籃到大門（至出廠）</Radio>
                  <Radio value="gate_to_gate">大門到大門（製造階段）</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>排除項目（若有）</FormLabel>
              <Textarea
                value={formData.exclusions}
                onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                placeholder="例如：包裝材料<5%質量的小零件已排除"
                rows={2}
              />
            </FormControl>

            <Divider />

            {/* 數據品質 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【數據品質】
            </Text>

            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              主要數據來源：
            </Text>
            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel fontSize="sm">實際量測數據（Primary data）</FormLabel>
                <HStack>
                  <NumberInput
                    value={formData.primary_data_percentage}
                    onChange={(_, value) =>
                      setFormData({
                        ...formData,
                        primary_data_percentage: value,
                        secondary_data_percentage: 100 - value,
                      })
                    }
                    min={0}
                    max={100}
                    size="sm"
                  >
                    <NumberInputField />
                  </NumberInput>
                  <Text fontSize="sm">%</Text>
                </HStack>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontSize="sm">次級資料庫（Secondary data）</FormLabel>
                <HStack>
                  <NumberInput value={formData.secondary_data_percentage} isReadOnly size="sm">
                    <NumberInputField />
                  </NumberInput>
                  <Text fontSize="sm">%</Text>
                </HStack>
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>建議品質等級</FormLabel>
              <RadioGroup
                value={formData.data_quality}
                onChange={(value) => setFormData({ ...formData, data_quality: value as DataQuality })}
              >
                <Stack spacing={2}>
                  <Radio value="Secondary">Secondary（含部分實測數據）</Radio>
                  <Radio value="Primary">Primary（主要基於實際量測數據）</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* 使用建議 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【使用建議】（選填）
            </Text>

            <FormControl>
              <Textarea
                value={formData.usage_notes}
                onChange={(e) => setFormData({ ...formData, usage_notes: e.target.value })}
                placeholder="此係數適用於消費性電子產品的碳足跡快速評估。若需精確計算，建議依據實際產品規格進行調整..."
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="匯入中"
          >
            確認匯入
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
