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
  Table,
  Tbody,
  Tr,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { ChevronDownIcon, CloseIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons'
import { useState } from 'react'

interface EmissionFactor {
  source?: string
  source_ref?: string
  source_type?: 'standard' | 'pact' | 'supplier' | 'user_defined'
}

interface CompositeComponent {
  name: string
  value: number
  unit: string
  weight: number
  dataQuality?: string
  emission_factor?: EmissionFactor
}

interface ProjectReference {
  project_id: string
  project_name: string
  project_type: 'L1' | 'L2' | 'L4'
  usage_count: number
  last_used_date: string
}

interface FactorUsageInfo {
  total_usage_count: number
  project_references: ProjectReference[]
  usage_summary: string
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
  usage_info?: FactorUsageInfo
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
  system_boundary_detail?: string  // 系統邊界詳細說明（自動生成）
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

  // 生成系統邊界文字（用於顯示生命週期階段）
  const generateSystemBoundaryText = (stages: string[]): string => {
    if (!stages || stages.length === 0) return 'Cradle-to-Grave'
    const stageNames = stages.map(code => {
      const fullName = lifecycleStageNames[code] || code
      // 提取階段名稱（去掉英文部分）
      const match = fullName.match(/^(.+?)\s*\(/)
      return match ? match[1] : fullName
    })
    return stageNames.join(' + ')
  }

  // 彙整組合係數的所有組成係數來源
  const getComponentSources = (compositeFactor: CompositeFactor): string => {
    const sources = compositeFactor.components
      .map(comp => {
        // 優先使用 source，其次使用 source_ref
        const source = comp.emission_factor?.source ||
                      comp.emission_factor?.source_ref ||
                      '未知來源'
        return source
      })
      .filter((value, index, self) => self.indexOf(value) === index)  // 去重複

    if (sources.length === 0) {
      return '無組成係數來源資訊'
    }

    if (sources.length === 1) {
      return sources[0]
    }

    // 多個來源時，用頓號分隔
    return sources.join('、')
  }

  // 格式化引用專案資訊（進階版：包含專案類型）
  const getReferencedProjectsWithTypes = (compositeFactor: CompositeFactor): JSX.Element => {
    // 檢查是否有 usage_info
    if (!compositeFactor.usage_info) {
      return <Text fontSize="sm" color="gray.500">未被引用</Text>
    }

    const { project_references } = compositeFactor.usage_info

    // 沒有引用專案
    if (!project_references || project_references.length === 0) {
      return <Text fontSize="sm" color="gray.500">未被引用</Text>
    }

    // 專案類型對應顯示文字和顏色
    const projectTypeMap = {
      'L1': { label: '組織盤查', color: 'blue' },
      'L2': { label: '產品碳足跡', color: 'green' },
      'L4': { label: '供應商係數', color: 'purple' },
    }

    // 有引用專案：顯示專案名稱和類型標記
    return (
      <VStack align="start" spacing={1}>
        {project_references.map((ref, index) => (
          <HStack key={index} spacing={2}>
            <Text fontSize="sm">{ref.project_name}</Text>
            <Badge
              colorScheme={projectTypeMap[ref.project_type].color}
              fontSize="xs"
            >
              {projectTypeMap[ref.project_type].label}
            </Badge>
          </HStack>
        ))}
      </VStack>
    )
  }

  // 生成組成備註（只包含組成資訊）
  const generateCompositionNotes = (
    compositeFactor: CompositeFactor,
    formData: ImportCompositeToCentralFormData
  ): string => {
    // 組成資訊
    const compositionInfo = `【組成資訊】
本組合係數由 ${compositeFactor.components.length} 個基礎係數組成，採用${compositeFactor.formulaType === 'weighted' ? '權重平均' : '權重加總'}計算方式。
組成：${compositeFactor.components.map(c => c.name).join('、')}。`

    return compositionInfo
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
      // 生成包含組成資訊和適用範圍的完整備註
      const compositionNotes = generateCompositionNotes(compositeFactor, formData)

      // 提交前確保所有自動生成的欄位都已填入
      const enrichedData = {
        ...formData,
        valid_from: formData.valid_from || compositeFactor.enabledDate || new Date().toISOString().split('T')[0],
        composition_notes: compositionNotes,
        // 新增：將適用範圍資訊對應到係數欄位
        isic_categories: formData.isic_categories,
        lifecycle_stages: formData.lifecycle_stages,
        data_quality: formData.data_quality,
        system_boundary_detail: generateSystemBoundaryText(formData.lifecycle_stages),
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
              {/* 基本資訊區塊 - 表格式唯讀 */}
              <Box>
                <Text fontWeight="bold" fontSize="lg" color="gray.700" mb={3}>
                  【基本資訊】（自動帶入，唯讀）
                </Text>

                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td width="30%" bg="gray.50" fontWeight="medium">Factor Name</Td>
                      <Td>{formData.factor_name}</Td>
                    </Tr>
                    {formData.description && (
                      <Tr>
                        <Td bg="gray.50" fontWeight="medium">Description</Td>
                        <Td>{formData.description}</Td>
                      </Tr>
                    )}
                    <Tr>
                      <Td bg="gray.50" fontWeight="medium">Factor Value</Td>
                      <Td>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600" fontFamily="mono">
                          {formData.factor_value.toFixed(4)} {formData.unit}
                        </Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td bg="gray.50" fontWeight="medium">Enabled Date</Td>
                      <Td>{formData.valid_from || new Date().toISOString().split('T')[0]}</Td>
                    </Tr>
                    <Tr>
                      <Td bg="gray.50" fontWeight="medium">Geographic Scope</Td>
                      <Td>{getRegionDisplayName(formData.geographic_scope)}</Td>
                    </Tr>
                    <Tr>
                      <Td bg="gray.50" fontWeight="medium">係數來源</Td>
                      <Td>
                        <Text fontSize="sm">
                          {getComponentSources(compositeFactor)}
                        </Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td bg="gray.50" fontWeight="medium">引用專案</Td>
                      <Td>
                        {getReferencedProjectsWithTypes(compositeFactor)}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {/* 計算過程區塊 - 採用係數詳情樣式 */}
              <Box>
                <Text fontWeight="bold" fontSize="lg" color="gray.700" mb={3}>
                  【計算過程】
                </Text>

                <Box
                  border="1px solid"
                  borderColor="blue.200"
                  borderRadius="md"
                  p={4}
                  bg="white"
                >
                  <Text fontSize="sm" mb={3}>
                    <Text as="span" fontWeight="bold">Calculation Formula</Text>
                    {' '}Formula: Σ(Factor Value × Conversion Ratio × Weight)
                  </Text>

                  <VStack align="stretch" spacing={2} my={3}>
                    {compositeFactor.components.map((comp, idx) => {
                      const actualValue = comp.value || 0
                      const weight = comp.weight || 0
                      const contribution = actualValue * weight

                      return (
                        <Box key={idx}>
                          <HStack justify="space-between" fontSize="sm">
                            <HStack spacing={2}>
                              <Text>{comp.name}</Text>
                              <Badge colorScheme="orange" fontSize="xs">
                                WEIGHT: {(weight * 100).toFixed(0)}%
                              </Badge>
                            </HStack>
                            <Text fontFamily="mono">
                              {actualValue.toFixed(6)}×{weight.toFixed(0)} = {contribution.toFixed(6)}
                            </Text>
                          </HStack>
                          {idx < compositeFactor.components.length - 1 && <Divider mt={2} />}
                        </Box>
                      )
                    })}
                  </VStack>

                  <Divider my={3} />

                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="md">Composite Value</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600" fontFamily="mono">
                      {compositeFactor.value.toFixed(6)} {formData.unit}
                    </Text>
                  </HStack>
                </Box>
              </Box>

            <Divider borderColor="gray.400" />

            {/* 適用範圍區塊 */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="brand.600" mb={1}>
                【適用範圍】
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>
                請填寫係數在中央庫中的分類資訊
              </Text>

              <VStack align="stretch" spacing={4}>
                {/* 適用產業分類 - 下拉選擇 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm">
                    適用產業分類（ISIC Rev.4）*
                  </FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      width="100%"
                      textAlign="left"
                      fontWeight="normal"
                      bg="white"
                      borderWidth="1px"
                      borderColor="gray.300"
                      _hover={{ bg: 'gray.50' }}
                    >
                      {formData.isic_categories.length === 0
                        ? '請選擇產業分類'
                        : `已選擇 ${formData.isic_categories.length} 個分類`}
                    </MenuButton>
                    <MenuList maxH="300px" overflowY="auto">
                      <MenuOptionGroup
                        type="checkbox"
                        value={formData.isic_categories}
                        onChange={(values) => setFormData({ ...formData, isic_categories: values as string[] })}
                      >
                        <MenuItemOption value="A">A - 農業、林業和漁業</MenuItemOption>
                        <MenuItemOption value="B">B - 採礦及採石業</MenuItemOption>
                        <MenuItemOption value="C">C - 製造業</MenuItemOption>
                        <MenuItemOption value="D">D - 電力、燃氣、蒸汽及空調供應業</MenuItemOption>
                        <MenuItemOption value="E">E - 供水；污水處理、廢棄物管理及污染整治業</MenuItemOption>
                        <MenuItemOption value="F">F - 營造業</MenuItemOption>
                        <MenuItemOption value="G">G - 批發及零售業；汽車及機車之維修</MenuItemOption>
                        <MenuItemOption value="H">H - 運輸及倉儲業</MenuItemOption>
                        <MenuItemOption value="I">I - 住宿及餐飲業</MenuItemOption>
                        <MenuItemOption value="J">J - 資訊及通訊傳播業</MenuItemOption>
                        <MenuItemOption value="K">K - 金融及保險業</MenuItemOption>
                        <MenuItemOption value="L">L - 不動產業</MenuItemOption>
                        <MenuItemOption value="M">M - 專業、科學及技術服務業</MenuItemOption>
                        <MenuItemOption value="N">N - 支援服務業</MenuItemOption>
                        <MenuItemOption value="O">O - 公共行政及國防；強制性社會安全</MenuItemOption>
                        <MenuItemOption value="P">P - 教育業</MenuItemOption>
                        <MenuItemOption value="Q">Q - 醫療保健及社會工作服務業</MenuItemOption>
                        <MenuItemOption value="R">R - 藝術、娛樂及休閒服務業</MenuItemOption>
                        <MenuItemOption value="S">S - 其他服務業</MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                  {/* 已選擇的 Badge 列表 */}
                  {formData.isic_categories.length > 0 && (
                    <Wrap mt={2}>
                      {formData.isic_categories.map((code) => (
                        <WrapItem key={code}>
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                isic_categories: formData.isic_categories.filter((c) => c !== code)
                              })
                            }}
                          >
                            {isicCategoryNames[code] || code}
                            <CloseIcon ml={1} boxSize={2} />
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </FormControl>

                <Divider />

                {/* 產品生命週期階段 - 卡片式多選 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm">
                    適用的生命週期階段 *
                  </FormLabel>
                  <VStack align="stretch" spacing={2}>
                    {[
                      { value: 'raw_material_acquisition', label: '原料取得階段', subtitle: 'Raw Material Acquisition Stage' },
                      { value: 'production', label: '製造階段', subtitle: 'Production Stage' },
                      { value: 'distribution', label: '配送銷售階段', subtitle: 'Distribution Stage' },
                      { value: 'product_use', label: '使用階段', subtitle: 'Product Use Stage' },
                      { value: 'end_of_life', label: '廢棄處理階段', subtitle: 'End-of-life Stage' }
                    ].map((stage) => {
                      const isSelected = formData.lifecycle_stages.includes(stage.value)
                      return (
                        <Box
                          key={stage.value}
                          borderWidth="2px"
                          borderRadius="md"
                          p={3}
                          cursor="pointer"
                          bg={isSelected ? 'blue.50' : 'white'}
                          borderColor={isSelected ? 'blue.400' : 'gray.200'}
                          transition="all 0.2s"
                          _hover={{ borderColor: isSelected ? 'blue.400' : 'blue.300' }}
                          onClick={() => {
                            const newStages = isSelected
                              ? formData.lifecycle_stages.filter((s) => s !== stage.value)
                              : [...formData.lifecycle_stages, stage.value]
                            setFormData({ ...formData, lifecycle_stages: newStages })
                          }}
                        >
                          <HStack>
                            <Box
                              w={5}
                              h={5}
                              borderRadius="sm"
                              borderWidth="2px"
                              borderColor={isSelected ? 'blue.500' : 'gray.300'}
                              bg={isSelected ? 'blue.500' : 'white'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {isSelected && (
                                <Icon as={CheckIcon} w={3} h={3} color="white" />
                              )}
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight={isSelected ? 'semibold' : 'normal'}>
                                {stage.label}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {stage.subtitle}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )
                    })}
                  </VStack>
                </FormControl>

                <Divider />

                {/* 數據品質 - 卡片式單選 */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm">
                    數據品質等級 *
                  </FormLabel>
                  <VStack align="stretch" spacing={2}>
                    {[
                      { value: 'Secondary', label: 'Secondary', subtitle: '第二級 - 含部分實測數據或次級資料庫' },
                      { value: 'Primary', label: 'Primary', subtitle: '第一級 - 主要基於實際量測數據' }
                    ].map((quality) => {
                      const isSelected = formData.data_quality === quality.value
                      return (
                        <Box
                          key={quality.value}
                          borderWidth="2px"
                          borderRadius="md"
                          p={3}
                          cursor="pointer"
                          bg={isSelected ? 'blue.50' : 'white'}
                          borderColor={isSelected ? 'blue.400' : 'gray.200'}
                          transition="all 0.2s"
                          _hover={{ borderColor: isSelected ? 'blue.400' : 'blue.300' }}
                          onClick={() => {
                            setFormData({ ...formData, data_quality: quality.value as 'Secondary' | 'Primary' })
                          }}
                        >
                          <HStack>
                            <Box
                              w={5}
                              h={5}
                              borderRadius="full"
                              borderWidth="2px"
                              borderColor={isSelected ? 'blue.500' : 'gray.300'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {isSelected && (
                                <Box w={2.5} h={2.5} borderRadius="full" bg="blue.500" />
                              )}
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight={isSelected ? 'semibold' : 'normal'}>
                                {quality.label}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {quality.subtitle}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )
                    })}
                  </VStack>
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
