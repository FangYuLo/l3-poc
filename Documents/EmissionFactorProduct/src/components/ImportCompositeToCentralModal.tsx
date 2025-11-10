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
  Box,
  Badge,
} from '@chakra-ui/react'
import { useState } from 'react'

interface CompositeComponent {
  name: string
  value: number
  unit: string
  weight: number
  dataQuality?: string
}

interface CompositeFactor {
  id: number
  name: string
  description?: string
  value: number
  unit: string
  formulaType: 'weighted' | 'sum'
  components: CompositeComponent[]
  region?: string
  enabledDate?: string
}

interface ImportCompositeToCentralFormData {
  factor_name: string
  description: string
  factor_value: number
  unit: string
  isic_categories: string[]  // 新增：ISIC 產業分類（必填）
  geographic_scope: string
  lifecycle_stages?: string[]  // 新增：產品生命週期階段（選填）
  data_quality: 'Secondary' | 'Primary'  // 數據品質等級（必填）
  // 以下欄位自動生成，不需用戶填寫
  valid_from?: string  // 自動使用 enabledDate
  composition_notes?: string  // 自動生成
}

interface ImportCompositeToCentralModalProps {
  isOpen: boolean
  onClose: () => void
  compositeFactor: CompositeFactor
  onConfirm: (formData: ImportCompositeToCentralFormData) => Promise<void>
}

export default function ImportCompositeToCentralModal({
  isOpen,
  onClose,
  compositeFactor,
  onConfirm,
}: ImportCompositeToCentralModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 地理範圍自動對應函數
  const mapRegionToScope = (region?: string): string => {
    if (!region) return 'taiwan'
    const regionLower = region.toLowerCase()
    if (regionLower.includes('台灣') || regionLower.includes('taiwan')) return 'taiwan'
    if (regionLower.includes('亞洲') || regionLower.includes('asia')) return 'asia'
    if (regionLower.includes('歐洲') || regionLower.includes('europe')) return 'europe'
    if (regionLower.includes('美國') || regionLower.includes('north america') || regionLower.includes('america')) return 'north_america'
    if (regionLower.includes('全球') || regionLower.includes('global') || regionLower.includes('國際')) return 'global'
    return 'taiwan'
  }

  // 表單狀態
  const [formData, setFormData] = useState<ImportCompositeToCentralFormData>({
    factor_name: compositeFactor.name,
    description: compositeFactor.description || '',
    factor_value: compositeFactor.value,
    unit: compositeFactor.unit,
    isic_categories: [],  // 新增：ISIC 產業分類
    geographic_scope: mapRegionToScope(compositeFactor.region),  // 自動對應地理範圍
    lifecycle_stages: [],  // 新增：生命週期階段
    data_quality: 'Secondary',  // 預設為 Secondary
    // 以下欄位自動生成，不在表單中顯示
    valid_from: compositeFactor.enabledDate || new Date().toISOString().split('T')[0],
    composition_notes: `本組合係數由 ${compositeFactor.components.length} 個基礎係數組成，採用${compositeFactor.formulaType === 'weighted' ? '權重平均' : '權重加總'}計算方式。組成：${compositeFactor.components.map(c => c.name).join('、')}。`,
  })

  const handleSubmit = async () => {
    // 驗證必填欄位
    if (formData.isic_categories.length === 0) {
      toast({
        title: '請至少選擇一個適用產業分類（ISIC）',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 提交前確保所有自動生成的欄位都已填入
      const enrichedData = {
        ...formData,
        valid_from: formData.valid_from || compositeFactor.enabledDate || new Date().toISOString().split('T')[0],
        composition_notes: formData.composition_notes || `本組合係數由 ${compositeFactor.components.length} 個基礎係數組成，採用${compositeFactor.formulaType === 'weighted' ? '權重平均' : '權重加總'}計算方式。`,
      }
      await onConfirm(enrichedData)
      toast({
        title: '匯入成功',
        description: '組合係數已成功匯入中央庫',
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
        <ModalHeader>組合係數匯入設定</ModalHeader>
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
              <FormLabel>描述</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="請輸入組合係數的詳細描述..."
                rows={2}
              />
            </FormControl>

            <FormControl>
              <FormLabel>係數值</FormLabel>
              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                {formData.factor_value.toFixed(4)} {formData.unit}
              </Text>
            </FormControl>

            {/* 啟用日期（唯讀顯示） */}
            <Box p={3} bg="blue.50" borderRadius="md">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.700" fontWeight="medium">啟用日期：</Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.700">
                  {formData.valid_from || new Date().toISOString().split('T')[0]}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600" mt={1}>
                自動使用自建係數的啟用日期
              </Text>
            </Box>

            {/* 組成說明 */}
            <FormControl>
              <FormLabel>組成係數列表（唯讀）</FormLabel>
              <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50" maxH="200px" overflowY="auto">
                <VStack align="stretch" spacing={2}>
                  {compositeFactor.components.map((comp, idx) => (
                    <HStack key={idx} justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">{comp.name}</Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.600">權重: {comp.weight?.toFixed(3) ?? '-'}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {comp.value?.toFixed(4) ?? '-'} {comp.unit}
                        </Text>
                        {comp.dataQuality && (
                          <Badge size="xs" colorScheme={comp.dataQuality === 'Primary' ? 'green' : 'blue'}>
                            {comp.dataQuality}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
              <Text fontSize="xs" color="gray.600" mt={1}>
                計算方式: {compositeFactor.formulaType === 'weighted' ? '權重平均' : '權重加總'}
              </Text>
            </FormControl>

            <Divider />

            {/* 適用範圍 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【適用範圍】（必填）
            </Text>

            <FormControl isRequired>
              <FormLabel>適用產業分類（ISIC Rev.4）*</FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                請選擇一個或多個適用的國際標準產業分類
              </Text>
              <CheckboxGroup
                value={formData.isic_categories}
                onChange={(values) => setFormData({ ...formData, isic_categories: values as string[] })}
              >
                <Box maxH="300px" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
                  <Stack spacing={2}>
                    <Checkbox value="A">A - 農業、林業和漁業</Checkbox>
                    <Checkbox value="B">B - 採礦及採石業</Checkbox>
                    <Checkbox value="C">C - 製造業</Checkbox>
                    <Checkbox value="D">D - 電力、燃氣、蒸汽及空調供應業</Checkbox>
                    <Checkbox value="E">E - 供水；污水處理、廢棄物管理及污染整治業</Checkbox>
                    <Checkbox value="F">F - 營造業</Checkbox>
                    <Checkbox value="G">G - 批發及零售業；汽車及機車之維修</Checkbox>
                    <Checkbox value="H">H - 運輸及倉儲業</Checkbox>
                    <Checkbox value="I">I - 住宿及餐飲業</Checkbox>
                    <Checkbox value="J">J - 資訊及通訊傳播業</Checkbox>
                    <Checkbox value="K">K - 金融及保險業</Checkbox>
                    <Checkbox value="L">L - 不動產業</Checkbox>
                    <Checkbox value="M">M - 專業、科學及技術服務業</Checkbox>
                    <Checkbox value="N">N - 支援服務業</Checkbox>
                    <Checkbox value="O">O - 公共行政及國防；強制性社會安全</Checkbox>
                    <Checkbox value="P">P - 教育業</Checkbox>
                    <Checkbox value="Q">Q - 醫療保健及社會工作服務業</Checkbox>
                    <Checkbox value="R">R - 藝術、娛樂及休閒服務業</Checkbox>
                    <Checkbox value="S">S - 其他服務業</Checkbox>
                  </Stack>
                </Box>
              </CheckboxGroup>
            </FormControl>

            <FormControl>
              <FormLabel>地理範圍（自動帶入，可修改）</FormLabel>
              <Select
                value={formData.geographic_scope}
                onChange={(e) => setFormData({ ...formData, geographic_scope: e.target.value })}
              >
                <option value="taiwan">台灣</option>
                <option value="asia">亞洲</option>
                <option value="europe">歐洲</option>
                <option value="north_america">北美洲</option>
                <option value="global">全球</option>
              </Select>
            </FormControl>

            <Divider />

            {/* 產品生命週期階段 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【產品生命週期階段】（選填）
            </Text>

            <FormControl>
              <FormLabel>適用的生命週期階段</FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                請選擇此係數適用的產品生命週期階段（可複選）
              </Text>
              <CheckboxGroup
                value={formData.lifecycle_stages}
                onChange={(values) => setFormData({ ...formData, lifecycle_stages: values as string[] })}
              >
                <Stack spacing={2}>
                  <Checkbox value="cradle_to_gate">搖籃到大門 (Cradle to Gate)</Checkbox>
                  <Checkbox value="cradle_to_grave">搖籃到墳墓 (Cradle to Grave)</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>

            <Divider />

            {/* 數據品質 */}
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              【數據品質】
            </Text>

            <FormControl isRequired>
              <FormLabel>數據品質等級 *</FormLabel>
              <RadioGroup
                value={formData.data_quality}
                onChange={(value) => setFormData({ ...formData, data_quality: value as 'Secondary' | 'Primary' })}
              >
                <Stack spacing={2}>
                  <Radio value="Secondary">Secondary（第二級 - 含部分實測數據或次級資料庫）</Radio>
                  <Radio value="Primary">Primary（第一級 - 主要基於實際量測數據）</Radio>
                </Stack>
              </RadioGroup>
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
