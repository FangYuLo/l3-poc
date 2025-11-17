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
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  SimpleGrid,
  Text,
  NumberInput,
  NumberInputField,
  useToast,
  Box,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { CustomFactor } from '@/types/types'
import { GHG_OPTIONS } from '@/config/ghgOptions'
import GhgSelector from './GhgSelector'
import FileUploadZone from './FileUploadZone'

interface CustomFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (factor: CustomFactor) => void
  editingFactor?: CustomFactor | null
}

export default function CustomFactorModal({
  isOpen,
  onClose,
  onSave,
  editingFactor
}: CustomFactorModalProps) {
  const toast = useToast()

  // 表單資料
  const [formData, setFormData] = useState<Partial<CustomFactor>>({
    source: '',
    name: '',
    region: '',
    effective_date: '',
    selected_ghgs: [],
    method_gwp: 'GWP100',
    description: '',
  })

  // 檔案上傳
  const [supportingFiles, setSupportingFiles] = useState<File[]>([])

  // 表單驗證錯誤
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 編輯模式：載入現有資料
  useEffect(() => {
    if (editingFactor) {
      setFormData(editingFactor)
    } else {
      // 新增模式：重置表單
      setFormData({
        source: '',
        name: '',
        region: '',
        effective_date: '',
        selected_ghgs: [],
        method_gwp: 'GWP100',
        description: '',
      })
      setSupportingFiles([])
      setErrors({})
    }
  }, [editingFactor, isOpen])

  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.source?.trim()) {
      newErrors.source = '請輸入係數來源'
    }

    if (!formData.name?.trim()) {
      newErrors.name = '請輸入係數名稱'
    }

    if (!formData.region) {
      newErrors.region = '請選擇國家/區域'
    }

    if (!formData.effective_date) {
      newErrors.effective_date = '請選擇啟用日期'
    }

    if (!formData.selected_ghgs || formData.selected_ghgs.length === 0) {
      newErrors.selected_ghgs = '請至少選擇一種溫室氣體'
    }

    // 驗證選中的 GHG 是否都有輸入數值
    formData.selected_ghgs?.forEach(ghg => {
      const ghgKey = ghg.toLowerCase()
      const factorValue = formData[`${ghgKey}_factor` as keyof CustomFactor]

      if (factorValue === undefined || factorValue === null) {
        newErrors[`${ghgKey}_factor`] = `請輸入 ${ghg} 排放係數`
      }

      const unitValue = formData[`${ghgKey}_unit` as keyof CustomFactor]
      if (!unitValue) {
        newErrors[`${ghgKey}_unit`] = `請輸入 ${ghg} 單位`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 儲存係數
  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: '表單驗證失敗',
        description: '請檢查必填欄位',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // 建立係數物件
    const newFactor: CustomFactor = {
      id: editingFactor?.id || Date.now(),
      source: formData.source!,
      name: formData.name!,
      region: formData.region!,
      effective_date: formData.effective_date!,
      selected_ghgs: formData.selected_ghgs!,

      // 各 GHG 數值
      co2_factor: formData.co2_factor,
      co2_unit: formData.co2_unit,
      ch4_factor: formData.ch4_factor,
      ch4_unit: formData.ch4_unit,
      n2o_factor: formData.n2o_factor,
      n2o_unit: formData.n2o_unit,
      hfcs_factor: formData.hfcs_factor,
      hfcs_unit: formData.hfcs_unit,
      pfcs_factor: formData.pfcs_factor,
      pfcs_unit: formData.pfcs_unit,
      sf6_factor: formData.sf6_factor,
      sf6_unit: formData.sf6_unit,
      nf3_factor: formData.nf3_factor,
      nf3_unit: formData.nf3_unit,

      // 佐證資料（TODO: 實作檔案上傳後端）
      supporting_documents: supportingFiles.map(file => ({
        filename: file.name,
        filepath: '', // 需要後端上傳 API
        upload_date: new Date().toISOString(),
      })),

      // 元資料
      method_gwp: formData.method_gwp || 'GWP100',
      source_type: 'user_defined',
      type: 'custom_factor',
      version: editingFactor?.version || 'v1.0',
      description: formData.description,
      created_at: editingFactor?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // 匯入中央庫相關
      imported_to_central: editingFactor?.imported_to_central || false,
      central_library_id: editingFactor?.central_library_id,
      imported_at: editingFactor?.imported_at,
    }

    onSave(newFactor)
    onClose()

    toast({
      title: editingFactor ? '自訂係數已更新' : '自訂係數已建立',
      description: `「${newFactor.name}」已儲存`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>自訂係數</ModalHeader>
        <ModalCloseButton />

        <ModalBody overflowY="auto">
          <VStack spacing={4} align="stretch">
            {/* 係數來源 */}
            <FormControl isRequired isInvalid={!!errors.source}>
              <FormLabel fontSize="sm">係數來源 *</FormLabel>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="例：環保署、內部調查、供應商提供..."
              />
              <FormErrorMessage>{errors.source}</FormErrorMessage>
            </FormControl>

            {/* 係數名稱 */}
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel fontSize="sm">係數名稱 *</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：柴油車運輸-自有車隊"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            {/* Country/Area 和 啟用日期 */}
            <HStack spacing={4} align="start">
              {/* Country/Area */}
              <FormControl isRequired isInvalid={!!errors.region} flex={1}>
                <FormLabel fontSize="sm">Country/Area *</FormLabel>
                <Select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Search for keywords"
                >
                  <option value="全球">全球</option>
                  <option value="台灣">台灣</option>
                  <option value="美國">美國</option>
                  <option value="英國">英國</option>
                  <option value="中國">中國</option>
                  <option value="日本">日本</option>
                  <option value="歐盟">歐盟</option>
                  <option value="國際">國際</option>
                </Select>
                <FormErrorMessage>{errors.region}</FormErrorMessage>
              </FormControl>

              {/* 啟用日期 */}
              <FormControl isRequired isInvalid={!!errors.effective_date} flex={1}>
                <FormLabel fontSize="sm">啟用日期 *</FormLabel>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
                <FormErrorMessage>{errors.effective_date}</FormErrorMessage>
              </FormControl>
            </HStack>

            {/* GHG 選擇器 */}
            <FormControl isRequired isInvalid={!!errors.selected_ghgs}>
              <GhgSelector
                selected={formData.selected_ghgs || []}
                onChange={(selected) => setFormData({ ...formData, selected_ghgs: selected })}
              />
              <FormErrorMessage>{errors.selected_ghgs}</FormErrorMessage>
            </FormControl>

            {/* 排放係數輸入 */}
            <Box>
              <Text fontWeight="medium" fontSize="sm" mb={3}>排放係數 *</Text>

              {!formData.selected_ghgs || formData.selected_ghgs.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  請先選擇溫室氣體 GHG
                </Text>
              ) : (
                <SimpleGrid columns={2} spacing={4}>
                  {formData.selected_ghgs.map(ghg => {
                    const ghgKey = ghg.toLowerCase()
                    const factorKey = `${ghgKey}_factor` as keyof CustomFactor
                    const unitKey = `${ghgKey}_unit` as keyof CustomFactor

                    return (
                      <VStack key={ghg} align="stretch" spacing={2} p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          {GHG_OPTIONS.find(opt => opt.value === ghg)?.label}
                        </Text>

                        {/* 排放係數數值 */}
                        <FormControl isRequired isInvalid={!!errors[factorKey]}>
                          <FormLabel fontSize="xs">排放係數（小數點10位）</FormLabel>
                          <NumberInput
                            precision={10}
                            value={formData[factorKey] as number || ''}
                            onChange={(_, valueNumber) =>
                              setFormData({
                                ...formData,
                                [factorKey]: valueNumber
                              })
                            }
                          >
                            <NumberInputField placeholder="0" />
                          </NumberInput>
                          <FormErrorMessage>{errors[factorKey]}</FormErrorMessage>
                        </FormControl>

                        {/* 單位 */}
                        <FormControl isRequired isInvalid={!!errors[unitKey]}>
                          <FormLabel fontSize="xs">單位</FormLabel>
                          <Input
                            value={(formData[unitKey] as string) || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [unitKey]: e.target.value
                              })
                            }
                            placeholder={`例：kg ${ghg}/kWh`}
                            size="sm"
                          />
                          <FormErrorMessage>{errors[unitKey]}</FormErrorMessage>
                        </FormControl>
                      </VStack>
                    )
                  })}
                </SimpleGrid>
              )}
            </Box>

            {/* 檔案上傳 */}
            <FileUploadZone
              files={supportingFiles}
              onChange={setSupportingFiles}
            />

            {/* 備註（可選） */}
            <FormControl>
              <FormLabel fontSize="sm">備註</FormLabel>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="請輸入備註..."
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            儲存係數
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
