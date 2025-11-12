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
  VStack,
  HStack,
  Text,
  Divider,
  Checkbox,
  CheckboxGroup,
  Stack,
  Radio,
  RadioGroup,
  useToast,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
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
  isic_categories: string[]  // ISIC 產業分類（必填）
  geographic_scope: string
  lifecycle_stages: string[]  // 產品生命週期階段（必填）
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
  onEditComposite?: (factor: CompositeFactor) => void  // 新增：編輯回調
}

export default function ImportCompositeToCentralModal({
  isOpen,
  onClose,
  compositeFactor,
  onConfirm,
  onEditComposite,
}: ImportCompositeToCentralModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 檢測必要欄位是否缺失
  const missingFields: string[] = []
  if (!compositeFactor.region || compositeFactor.region.trim() === '') {
    missingFields.push('國家/區域')
  }
  if (!compositeFactor.enabledDate || compositeFactor.enabledDate.trim() === '') {
    missingFields.push('啟用日期')
  }
  const hasMissingFields = missingFields.length > 0

  // 地理範圍自動對應函數（英文 key）
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

  // 地理範圍中文顯示對應函數
  const getRegionDisplayName = (scopeKey: string): string => {
    const mapping: { [key: string]: string } = {
      taiwan: '台灣',
      asia: '亞洲',
      europe: '歐洲',
      north_america: '北美洲',
      global: '全球'
    }
    return mapping[scopeKey] || scopeKey
  }

  // ISIC 產業分類中文對應表
  const isicCategoryNames: { [key: string]: string } = {
    'A': 'A - 農業、林業和漁業',
    'B': 'B - 採礦及採石業',
    'C': 'C - 製造業',
    'D': 'D - 電力、燃氣、蒸汽及空調供應業',
    'E': 'E - 供水；污水處理、廢棄物管理及污染整治業',
    'F': 'F - 營造業',
    'G': 'G - 批發及零售業；汽車及機車之維修',
    'H': 'H - 運輸及倉儲業',
    'I': 'I - 住宿及餐飲業',
    'J': 'J - 資訊及通訊傳播業',
    'K': 'K - 金融及保險業',
    'L': 'L - 不動產業',
    'M': 'M - 專業、科學及技術服務業',
    'N': 'N - 支援服務業',
    'O': 'O - 公共行政及國防；強制性社會安全',
    'P': 'P - 教育業',
    'Q': 'Q - 醫療保健及社會工作服務業',
    'R': 'R - 藝術、娛樂及休閒服務業',
    'S': 'S - 其他服務業',
  }

  // 生命週期階段中文對應表
  const lifecycleStageNames: { [key: string]: string } = {
    'raw_material_acquisition': '原料取得階段 (Raw Material Acquisition Stage)',
    'production': '製造階段 (Production Stage)',
    'distribution': '配送銷售階段 (Distribution Stage)',
    'product_use': '使用階段 (Product Use Stage)',
    'end_of_life': '廢棄處理階段 (End-of-life Stage)',
  }

  // 數據品質等級中文對應表
  const dataQualityNames: { [key: string]: string } = {
    'Secondary': 'Secondary（第二級 - 含部分實測數據或次級資料庫）',
    'Primary': 'Primary（第一級 - 主要基於實際量測數據）',
  }

  // 生成完整的組成備註（包含組成資訊和中央庫設定）
  const generateCompositionNotes = (
    compositeFactor: CompositeFactor,
    formData: ImportCompositeToCentralFormData
  ): string => {
    // 第一部分：組成資訊
    const compositionInfo = `【組成資訊】
本組合係數由 ${compositeFactor.components.length} 個基礎係數組成，採用${compositeFactor.formulaType === 'weighted' ? '權重平均' : '權重加總'}計算方式。
組成：${compositeFactor.components.map(c => c.name).join('、')}。`

    // 第二部分：中央庫設定
    const isicNames = formData.isic_categories
      .map(code => isicCategoryNames[code] || code)
      .join('、')

    const lifecycleNames = formData.lifecycle_stages
      .map(code => lifecycleStageNames[code] || code)
      .join('、')

    const dataQualityName = dataQualityNames[formData.data_quality] || formData.data_quality

    const centralLibrarySettings = `【係數適用範疇】
• 適用產業分類：${isicNames}
• 適用生命週期階段：${lifecycleNames}
• 數據品質等級：${dataQualityName}`

    // 組合兩部分
    return `${compositionInfo}\n\n${centralLibrarySettings}`
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
    // composition_notes 將在提交時根據表單資料動態生成
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

    if (!formData.lifecycle_stages || formData.lifecycle_stages.length === 0) {
      toast({
        title: '請至少選擇一個適用的生命週期階段',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 生成包含組成資訊和中央庫設定的完整備註
      const compositionNotes = generateCompositionNotes(compositeFactor, formData)

      // 提交前確保所有自動生成的欄位都已填入
      const enrichedData = {
        ...formData,
        valid_from: formData.valid_from || compositeFactor.enabledDate || new Date().toISOString().split('T')[0],
        composition_notes: compositionNotes,
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
        <ModalHeader>匯入中央係數庫設定</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {hasMissingFields ? (
            /* 缺失欄位警告 */
            <VStack spacing={6} align="stretch" py={6}>
              <Alert
                status="warning"
                variant="left-accent"
                flexDirection="column"
                alignItems="flex-start"
                borderRadius="md"
                py={6}
              >
                <HStack mb={4}>
                  <AlertIcon boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold">
                    缺失必要資訊
                  </Text>
                </HStack>

                <AlertDescription fontSize="md" w="100%">
                  <VStack align="stretch" spacing={4}>
                    <Text>
                      自建係數尚未填寫以下資訊，無法匯入中央庫：
                    </Text>

                    <Box pl={4}>
                      <VStack align="stretch" spacing={2}>
                        {missingFields.map((field) => (
                          <HStack key={field}>
                            <Icon as={WarningIcon} color="orange.500" />
                            <Text fontWeight="medium">{field}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <Divider />

                    <Box bg="blue.50" p={4} borderRadius="md">
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="bold" color="blue.800">
                          💡 建議做法：
                        </Text>
                        <Text color="blue.700">
                          請先完善自建係數的基本資訊，確保資料完整後再進行匯入。
                          這樣可以避免版本控制上的混亂。
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                </AlertDescription>
              </Alert>

              {/* 係數預覽 */}
              <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
                <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
                  係數預覽：
                </Text>
                <VStack align="stretch" spacing={1}>
                  <HStack>
                    <Text fontSize="sm" color="gray.600">名稱：</Text>
                    <Text fontSize="sm" fontWeight="medium">{compositeFactor.name}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" color="gray.600">計算值：</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {compositeFactor.value.toFixed(4)} {compositeFactor.unit}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          ) : (
            /* 正常的匯入表單 */
            <VStack spacing={5} align="stretch">
              {/* 基本資訊區塊 - 唯讀 */}
              <Box
                borderWidth="1px"
                borderRadius="lg"
                p={5}
                bg="gray.50"
                borderColor="gray.300"
              >
                <Text fontWeight="bold" fontSize="lg" color="gray.700" mb={4}>
                  【基本資訊】（自動帶入，唯讀）
                </Text>

                <VStack align="stretch" spacing={3}>
                  {/* 係數名稱 */}
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      係數名稱
                    </Text>
                    <Text fontSize="md" fontWeight="semibold" color="gray.800">
                      {formData.factor_name}
                    </Text>
                  </Box>

                  {/* 描述 */}
                  {formData.description && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        描述
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {formData.description}
                      </Text>
                    </Box>
                  )}

                  {/* 係數值和單位 */}
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      係數值
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.600">
                      {formData.factor_value.toFixed(4)} {formData.unit}
                    </Text>
                  </Box>

                  {/* 啟用日期 */}
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      啟用日期
                    </Text>
                    <Text fontSize="md" color="gray.800">
                      {formData.valid_from || new Date().toISOString().split('T')[0]}
                    </Text>
                  </Box>

                  {/* 地理範圍 */}
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      地理範圍
                    </Text>
                    <Text fontSize="md" color="gray.800">
                      {getRegionDisplayName(formData.geographic_scope)}
                    </Text>
                  </Box>

                  {/* 計算過程 */}
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      📐 計算過程
                    </Text>
                    <Box
                      borderWidth="1px"
                      borderRadius="md"
                      p={3}
                      bg="white"
                      borderColor="gray.300"
                      maxH="180px"
                      overflowY="auto"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700">
                          各項計算結果：
                        </Text>

                        {/* 各項計算 */}
                        <VStack align="stretch" spacing={1} pl={2}>
                          {compositeFactor.components.map((comp, idx) => (
                            <HStack key={idx} justify="space-between" fontSize="xs">
                              <Text color="gray.600">{comp.name}:</Text>
                              <Text fontFamily="mono" color="gray.700">
                                {comp.value?.toFixed(4) ?? '-'} × {comp.weight?.toFixed(3) ?? '-'}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>

                        <Divider />

                        {/* 總和或平均 */}
                        <HStack justify="space-between" fontSize="xs">
                          <Text fontWeight="bold" color="gray.700">
                            {compositeFactor.formulaType === 'weighted' ? '加權平均：' : '加權總和：'}
                          </Text>
                          <Text fontFamily="mono" fontWeight="bold" color="gray.800">
                            {compositeFactor.value.toFixed(4)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>
                </VStack>
              </Box>

            <Divider borderColor="gray.400" />

            {/* 中央庫設定區塊 */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="brand.600" mb={1}>
                【中央庫設定】
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>
                請填寫係數在中央庫中的分類資訊
              </Text>

              <VStack align="stretch" spacing={4}>
                {/* 適用產業分類 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">
                    適用產業分類（ISIC Rev.4）*
                  </FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    請選擇一個或多個適用的國際標準產業分類
                  </Text>
                  <CheckboxGroup
                    value={formData.isic_categories}
                    onChange={(values) => setFormData({ ...formData, isic_categories: values as string[] })}
                  >
                    <Box maxH="280px" overflowY="auto" borderWidth="1px" borderRadius="md" p={3} bg="white">
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

                <Divider />

                {/* 產品生命週期階段 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">
                    適用的生命週期階段 *
                  </FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    請至少選擇一個適用的生命週期階段
                  </Text>
                  <CheckboxGroup
                    value={formData.lifecycle_stages}
                    onChange={(values) => setFormData({ ...formData, lifecycle_stages: values as string[] })}
                  >
                    <Stack spacing={2}>
                      <Checkbox value="raw_material_acquisition">原料取得階段 (Raw Material Acquisition Stage)</Checkbox>
                      <Checkbox value="production">製造階段 (Production Stage)</Checkbox>
                      <Checkbox value="distribution">配送銷售階段 (Distribution Stage)</Checkbox>
                      <Checkbox value="product_use">使用階段 (Product Use Stage)</Checkbox>
                      <Checkbox value="end_of_life">廢棄處理階段 (End-of-life Stage)</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <Divider />

                {/* 數據品質 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">
                    數據品質等級 *
                  </FormLabel>
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
            </Box>

          </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {hasMissingFields ? (
            /* 缺失欄位時的按鈕 */
            <>
              <Button variant="ghost" mr={3} onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="brand"
                onClick={() => {
                  onClose()
                  onEditComposite?.(compositeFactor)
                }}
              >
                返回編輯
              </Button>
            </>
          ) : (
            /* 正常匯入時的按鈕 */
            <>
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
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
