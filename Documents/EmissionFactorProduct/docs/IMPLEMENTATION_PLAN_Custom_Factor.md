# 實作計畫：自訂係數功能

## 📋 任務概述

在「自建係數」資料夾的工具列中，於現有的「+ 自建組合係數」按鈕旁，新增「+ 自訂係數」按鈕，讓使用者能夠直接輸入自定義的排放係數。

---
 
## 🎯 核心需求

### 功能特點
1. **直接輸入係數值**：使用者無需組合現有係數，可直接輸入自行調查或計算的係數
2. **多種 GHG 支援**：支援 CO₂、CH₄、N₂O、HFCs、PFCs、SF₆、NF₃ 等 7 種溫室氣體
3. **佐證資料上傳**：可選上傳 PDF、Excel、圖片等佐證文件
4. **與組合係數一致的介面**：使用相同的 Country/Area 選擇器
5. **不自動計算 CO₂e**：使用者選擇哪些 GHG，就顯示對應的輸入欄位

### 重要約束
- ❌ **不需要自動計算 CO₂e 總值**
- ❌ **不需要 GWP 加權計算**
- ✅ **只需儲存使用者輸入的各 GHG 數值**
- ✅ **Country/Area 為必填欄位**

---

## 📂 檔案結構

需要新增/修改的檔案：

```
src/
├── types/types.ts                           # 新增 CustomFactor 型別
├── config/
│   ├── ghgOptions.ts                        # 新增：GHG 選項配置
│   └── regionOptions.ts                     # 新增：國家/區域選項（與組合係數共用）
├── components/
│   ├── CustomFactorModal.tsx                # 新增：自訂係數表單
│   ├── GhgSelector.tsx                      # 新增：GHG 多選組件
│   ├── FileUploadZone.tsx                   # 新增：檔案上傳組件
│   └── FactorTable.tsx                      # 修改：新增按鈕
├── hooks/
│   └── useMockData.ts                       # 修改：新增自訂係數管理函數
└── app/
    └── page.tsx                             # 修改：整合 CustomFactorModal
```

---

## 🔧 實作步驟

### Step 1: 定義資料型別

**檔案**: `src/types/types.ts`

**說明**: 新增 `CustomFactor` 介面，定義自訂係數的資料結構。

**實作內容**:
```typescript
/**
 * 自訂係數型別
 * 使用者直接輸入的排放係數（非組合計算）
 */
export interface CustomFactor {
  // 基本資訊
  id: number
  source: string                    // 係數來源（必填）
  name: string                      // 係數名稱（必填）
  region: string                    // 國家/區域（必填）
  effective_date: string            // 啟用日期（必填）ISO 8601 格式

  // 溫室氣體數值
  selected_ghgs: string[]           // 選中的 GHG 種類，例如：['CO2', 'CH4']

  // 各 GHG 的排放係數（可選，依 selected_ghgs 決定）
  co2_factor?: number
  co2_unit?: string
  ch4_factor?: number
  ch4_unit?: string
  n2o_factor?: number
  n2o_unit?: string
  hfcs_factor?: number
  hfcs_unit?: string
  pfcs_factor?: number
  pfcs_unit?: string
  sf6_factor?: number
  sf6_unit?: string
  nf3_factor?: number
  nf3_unit?: string

  // 佐證資料（可選）
  supporting_documents?: Array<{
    filename: string
    filepath: string
    upload_date: string
  }>

  // 元資料
  method_gwp: 'GWP100' | 'GWP20'
  source_type: 'user_defined'       // 固定為 'user_defined'
  type: 'custom_factor'             // 固定為 'custom_factor'
  version: string                   // 版本號，格式：v1.0
  description?: string              // 描述（可選）
  notes?: string                    // 備註（可選）
  created_at: string                // 建立時間 ISO 8601
  updated_at: string                // 更新時間 ISO 8601

  // 匯入中央庫相關（預設為 false）
  imported_to_central?: boolean
  central_library_id?: number
  imported_at?: string
}
```

**注意事項**:
- ❌ **不需要 `value` 和 `unit` 欄位**（因為不計算 CO₂e 總值）
- ✅ 每個 GHG 都有獨立的 `factor` 和 `unit` 欄位
- ✅ `selected_ghgs` 決定哪些 GHG 欄位有效

---

### Step 2: 建立配置檔案

#### 2.1 GHG 選項配置

**檔案**: `src/config/ghgOptions.ts`

**實作內容**:
```typescript
/**
 * 溫室氣體選項配置
 * 用於自訂係數表單的 GHG 多選器
 */
export const GHG_OPTIONS = [
  { value: 'CO2', label: 'CO₂' },
  { value: 'CH4', label: 'CH₄' },
  { value: 'N2O', label: 'N₂O' },
  { value: 'HFCs', label: 'HFCs' },
  { value: 'PFCs', label: 'PFCs' },
  { value: 'SF6', label: 'SF₆' },
  { value: 'NF3', label: 'NF₃' },
] as const

export type GHGType = typeof GHG_OPTIONS[number]['value']
```

#### 2.2 國家/區域選項配置

**檔案**: `src/config/regionOptions.ts`

**實作內容**:
```typescript
/**
 * 國家/區域選項配置
 * 與自建組合係數使用相同的選項
 */
export const REGION_OPTIONS = [
  { value: '全球', label: '全球' },
  { value: '台灣', label: '台灣' },
  { value: '美國', label: '美國' },
  { value: '英國', label: '英國' },
  { value: '中國', label: '中國' },
  { value: '日本', label: '日本' },
  { value: '歐盟', label: '歐盟' },
  { value: '國際', label: '國際' },
] as const
```

**說明**: 這些選項與 `CompositeEditorDrawer.tsx` 第 935-942 行使用的選項完全一致。

---

### Step 3: 建立 GHG 多選器組件

**檔案**: `src/components/GhgSelector.tsx`

**功能**: 提供可點擊的 Tag 來選擇溫室氣體種類。

**實作內容**:
```typescript
'use client'

import {
  Box,
  Text,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { GHG_OPTIONS } from '@/config/ghgOptions'

interface GhgSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function GhgSelector({ selected, onChange }: GhgSelectorProps) {
  const handleToggle = (ghgValue: string) => {
    if (selected.includes(ghgValue)) {
      // 取消選擇
      onChange(selected.filter(v => v !== ghgValue))
    } else {
      // 新增選擇
      onChange([...selected, ghgValue])
    }
  }

  return (
    <Box>
      <Text fontWeight="medium" fontSize="sm" mb={2}>
        產生之溫室氣體 *
      </Text>
      <Wrap spacing={2}>
        {GHG_OPTIONS.map(ghg => {
          const isSelected = selected.includes(ghg.value)

          return (
            <WrapItem key={ghg.value}>
              <Tag
                size="md"
                variant={isSelected ? 'solid' : 'outline'}
                colorScheme="blue"
                cursor="pointer"
                onClick={() => handleToggle(ghg.value)}
                _hover={{ opacity: 0.8 }}
              >
                <TagLabel>{ghg.label}</TagLabel>
                {isSelected && (
                  <TagCloseButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(ghg.value)
                    }}
                  />
                )}
              </Tag>
            </WrapItem>
          )
        })}
      </Wrap>
      <Text fontSize="xs" color="gray.500" mt={1}>
        依需選擇
      </Text>
    </Box>
  )
}
```

**UI 行為**:
- 未選中：灰色外框
- 選中：藍色填滿，顯示關閉按鈕
- 點擊 Tag 切換選中狀態
- 點擊關閉按鈕取消選擇

---

### Step 4: 建立檔案上傳組件

**檔案**: `src/components/FileUploadZone.tsx`

**功能**: 提供拖曳上傳和點擊上傳功能。

**實作內容**:
```typescript
'use client'

import {
  Box,
  Text,
  Icon,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
  List,
  ListItem,
} from '@chakra-ui/react'
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons'
import { useState } from 'react'

interface FileUploadZoneProps {
  files: File[]
  onChange: (files: File[]) => void
}

export default function FileUploadZone({ files, onChange }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer?.files || [])
    const validFiles = droppedFiles.filter(file => {
      // 驗證檔案類型
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]

      // 驗證檔案大小（50 MB）
      const maxSize = 50 * 1024 * 1024

      return validTypes.includes(file.type) && file.size <= maxSize
    })

    onChange([...files, ...validFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      onChange([...files, ...selectedFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <Box>
      <Text fontWeight="medium" fontSize="sm" mb={2}>
        📎 上傳佐證資料
      </Text>

      <Box
        border="2px dashed"
        borderColor={isDragging ? 'blue.400' : 'gray.300'}
        borderRadius="md"
        p={6}
        textAlign="center"
        bg={isDragging ? 'blue.50' : 'white'}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        transition="all 0.2s"
      >
        <Icon as={AttachmentIcon} boxSize={8} color="gray.400" mb={2} />
        <Text fontSize="sm" color="gray.600" mb={1}>
          📄 拖曳檔案至此或點擊上傳
        </Text>
        <Text fontSize="xs" color="gray.500" mb={3}>
          支援 PDF / Excel / 圖片 - 最大 50 MB
        </Text>

        <Input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          display="none"
          id="custom-factor-file-upload"
        />
        <Button
          as="label"
          htmlFor="custom-factor-file-upload"
          size="sm"
          colorScheme="blue"
          variant="outline"
          cursor="pointer"
        >
          選擇檔案
        </Button>
      </Box>

      <Text fontSize="xs" color="gray.500" mt={2}>
        ⓘ 支援檔案類型：pdf / xlsx / xls / jpeg / jpg / png - 檔案・大小最多 50 MB
      </Text>

      {/* 已上傳檔案列表 */}
      {files.length > 0 && (
        <List spacing={2} mt={3}>
          {files.map((file, index) => (
            <ListItem key={index}>
              <HStack
                p={2}
                bg="gray.50"
                borderRadius="md"
                justify="space-between"
              >
                <HStack spacing={2}>
                  <Icon as={AttachmentIcon} color="gray.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{file.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </VStack>
                </HStack>
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleRemoveFile(index)}
                  aria-label="移除檔案"
                />
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
```

**檔案驗證規則**:
- 支援類型：PDF、Excel (.xlsx, .xls)、圖片 (.jpg, .jpeg, .png)
- 最大檔案大小：50 MB
- 可上傳多個檔案

---

### Step 5: 建立自訂係數表單 Modal

**檔案**: `src/components/CustomFactorModal.tsx`

**功能**: 主要的自訂係數建立/編輯表單。

**實作內容**:
```typescript
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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { CustomFactor } from '@/types/types'
import { REGION_OPTIONS } from '@/config/regionOptions'
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
        <ModalHeader>📝 自訂係數</ModalHeader>
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
                  {REGION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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

            {/* 檔案上傳 */}
            <FileUploadZone
              files={supportingFiles}
              onChange={setSupportingFiles}
            />

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
```

**表單驗證規則**:
1. 必填欄位：來源、名稱、Country/Area、啟用日期、至少一種 GHG
2. 選中的每個 GHG 都必須輸入排放係數和單位
3. 排放係數必須為數值（可為 0）

---

### Step 6: 擴展資料管理 Hook

**檔案**: `src/hooks/useMockData.ts`

**說明**: 新增自訂係數的管理函數。

**實作內容**:

在檔案開頭新增：

```typescript
import { CustomFactor } from '@/types/types'

// 自訂係數儲存（全局變數）
let customFactors: CustomFactor[] = []
```

在檔案末尾的 `return` 區塊前新增以下函數：

```typescript
/**
 * 新增自訂係數
 */
export function addCustomFactor(factor: CustomFactor) {
  customFactors.push(factor)
  console.log('[addCustomFactor] 新增自訂係數:', factor.name)
}

/**
 * 更新自訂係數
 */
export function updateCustomFactor(id: number, updates: Partial<CustomFactor>) {
  const index = customFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    customFactors[index] = {
      ...customFactors[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    console.log('[updateCustomFactor] 更新自訂係數:', customFactors[index].name)
  }
}

/**
 * 刪除自訂係數
 */
export function deleteCustomFactor(id: number) {
  const index = customFactors.findIndex(f => f.id === id)
  if (index !== -1) {
    const deleted = customFactors.splice(index, 1)[0]
    console.log('[deleteCustomFactor] 刪除自訂係數:', deleted.name)
    return true
  }
  return false
}

/**
 * 取得所有自訂係數
 */
export function getCustomFactors(): CustomFactor[] {
  return customFactors
}

/**
 * 根據 ID 取得自訂係數
 */
export function getCustomFactorById(id: number): CustomFactor | undefined {
  return customFactors.find(f => f.id === id)
}

/**
 * 將自訂係數轉換為 FactorTableItem 格式
 */
function convertCustomFactorToTableItem(factor: CustomFactor): FactorTableItem {
  // 取得第一個 GHG 作為主要顯示值
  const firstGHG = factor.selected_ghgs[0]
  const ghgKey = firstGHG.toLowerCase()
  const mainValue = factor[`${ghgKey}_factor` as keyof CustomFactor] as number || 0
  const mainUnit = factor[`${ghgKey}_unit` as keyof CustomFactor] as string || ''

  return {
    id: factor.id,
    type: 'custom_factor',
    name: factor.name,
    value: mainValue,
    unit: mainUnit,
    year: new Date(factor.effective_date).getFullYear(),
    region: factor.region,
    method_gwp: factor.method_gwp,
    source_type: 'user_defined',
    source_ref: factor.source,
    version: factor.version,
    data: factor,
    imported_to_central: factor.imported_to_central,
    central_library_id: factor.central_library_id,
    imported_at: factor.imported_at,
  }
}
```

修改現有的 `getUserDefinedCompositeFactors` 函數名稱為 `getAllUserDefinedFactors`，並整合自訂係數：

```typescript
/**
 * 取得所有自建係數（組合係數 + 自訂係數）
 */
export function getAllUserDefinedFactors() {
  const compositeFactors = getUserDefinedCompositeFactors()
  const custom = getCustomFactors()

  return [
    ...compositeFactors,
    ...custom.map(convertCustomFactorToTableItem)
  ]
}
```

在 `useMockData` 的 return 物件中新增：

```typescript
return {
  // ... 現有的函數

  // 自訂係數管理
  addCustomFactor,
  updateCustomFactor,
  deleteCustomFactor,
  getCustomFactors,
  getCustomFactorById,
  getAllUserDefinedFactors,  // 替代原本的 getUserDefinedCompositeFactors
}
```

---

### Step 7: 更新 FactorTable 新增按鈕

**檔案**: `src/components/FactorTable.tsx`

**位置**: 第 993-1004 行附近

**修改前**:
```typescript
{/* 自建係數頁面顯示組合係數按鈕 */}
{selectedNodeType === 'user_defined' && (
  <Button
    leftIcon={<AddIcon />}
    colorScheme="blue"
    variant="outline"
    size="sm"
    onClick={onOpenComposite}
  >
    自建組合係數
  </Button>
)}
```

**修改後**:
```typescript
{/* 自建係數頁面顯示按鈕群組 */}
{selectedNodeType === 'user_defined' && (
  <HStack spacing={2}>
    <Button
      leftIcon={<AddIcon />}
      colorScheme="green"
      variant="outline"
      size="sm"
      onClick={onOpenCustomFactor}
    >
      自訂係數
    </Button>
    <Button
      leftIcon={<AddIcon />}
      colorScheme="blue"
      variant="outline"
      size="sm"
      onClick={onOpenComposite}
    >
      自建組合係數
    </Button>
  </HStack>
)}
```

在 `FactorTableProps` 介面中新增：

```typescript
interface FactorTableProps {
  // ... 現有的 props
  onOpenCustomFactor?: () => void  // 新增：開啟自訂係數 Modal
}
```

在組件參數中新增：

```typescript
export default function FactorTable({
  // ... 現有的參數
  onOpenCustomFactor,
}: FactorTableProps) {
```

---

### Step 8: 整合到主頁面

**檔案**: `src/app/page.tsx`

**步驟 8.1**: 匯入必要的組件和函數

在檔案開頭新增：

```typescript
import CustomFactorModal from '@/components/CustomFactorModal'
import {
  // ... 現有的匯入
  addCustomFactor,
  updateCustomFactor,
  getAllUserDefinedFactors,  // 新增
} from '@/hooks/useMockData'
```

**步驟 8.2**: 新增 Modal 狀態

在現有的 `useDisclosure` 群組中新增：

```typescript
const {
  isOpen: isCustomFactorOpen,
  onOpen: onCustomFactorOpen,
  onClose: onCustomFactorClose
} = useDisclosure()
```

**步驟 8.3**: 修改 userDefinedFactors 資料來源

找到現有的 `userDefinedFactors` 定義（約在第 100 行附近），修改為：

```typescript
// 修改前
const userDefinedFactors = getUserDefinedCompositeFactors()

// 修改後
const userDefinedFactors = getAllUserDefinedFactors()  // 包含組合係數和自訂係數
```

**步驟 8.4**: 新增儲存處理函數

在現有的 handler 群組中新增：

```typescript
// 處理自訂係數儲存
const handleCustomFactorSave = (factor: CustomFactor) => {
  if (factor.id && getCustomFactorById(factor.id)) {
    // 更新現有係數
    updateCustomFactor(factor.id, factor)
    console.log('[handleCustomFactorSave] 更新自訂係數:', factor.name)
  } else {
    // 新增係數
    addCustomFactor(factor)
    console.log('[handleCustomFactorSave] 新增自訂係數:', factor.name)
  }

  // 觸發重新渲染
  setRefreshKey(prev => prev + 1)
  onCustomFactorClose()

  toast({
    title: '自訂係數已儲存',
    description: `係數「${factor.name}」已成功建立`,
    status: 'success',
    duration: 3000,
    isClosable: true,
  })
}
```

**步驟 8.5**: 將 Modal 加入 JSX

在現有的 `<CompositeEditorDrawer>` 下方新增：

```typescript
{/* 自訂係數 Modal */}
<CustomFactorModal
  isOpen={isCustomFactorOpen}
  onClose={onCustomFactorClose}
  onSave={handleCustomFactorSave}
/>
```

**步驟 8.6**: 傳遞 onOpenCustomFactor 到 FactorTable

找到 `<FactorTable>` 組件（約在第 1000 行附近），新增 prop：

```typescript
<FactorTable
  // ... 現有的 props
  onOpenCustomFactor={onCustomFactorOpen}
/>
```

---

## ✅ 驗收標準

### 功能驗收
- [ ] 點擊「自訂係數」按鈕，彈出自訂係數表單
- [ ] 表單包含所有必填欄位：來源、名稱、Country/Area、啟用日期
- [ ] 可選擇一種或多種 GHG
- [ ] 選中的 GHG 顯示對應的排放係數和單位輸入欄位
- [ ] 可上傳佐證檔案（PDF、Excel、圖片）
- [ ] 儲存後係數出現在自建係數列表
- [ ] 自訂係數可匯入中央庫
- [ ] 自訂係數可編輯、刪除

### UI 驗收
- [ ] 按鈕顏色：自訂係數（綠色）、自建組合係數（藍色）
- [ ] GHG Tag 未選中為灰色外框，選中為藍色填滿
- [ ] 檔案上傳區域支援拖曳，拖曳時顯示藍色背景
- [ ] 表單驗證錯誤顯示紅色提示
- [ ] Country/Area 選項與組合係數完全一致

### 資料驗證
- [ ] 必填欄位未填寫時無法儲存
- [ ] 選中的 GHG 必須填寫排放係數和單位
- [ ] 儲存後的係數包含所有必要欄位
- [ ] 係數類型為 `custom_factor`
- [ ] source_type 為 `user_defined`

---

## 🚨 注意事項

### 重要約束
1. ❌ **不要計算 CO₂e 總值**：使用者選擇哪些 GHG，就只儲存那些 GHG 的數值
2. ❌ **不要使用 GWP 加權**：不需要 GWP100 或 GWP20 的轉換計算
3. ✅ **Country/Area 為必填**：與組合係數保持一致
4. ✅ **檔案上傳暫時只儲存檔案資訊**：實際檔案上傳需要後端 API 支援

### 資料結構約束
- `CustomFactor` 型別**不包含** `value` 和 `unit` 欄位（這些用於 CO₂e 總值）
- 每個 GHG 都有獨立的 `factor` 和 `unit` 欄位
- `selected_ghgs` 陣列決定哪些 GHG 欄位有效

### 與現有功能的差異
| 功能 | 自建組合係數 | 自訂係數 |
|------|-------------|---------|
| 建立方式 | 從現有係數組合 | 直接輸入 |
| GHG 支援 | 繼承組成係數 | 自由選擇 7 種 |
| 計算邏輯 | 加權平均 | 無計算 |
| 佐證資料 | 無 | 支援上傳 |

---

## 🧪 測試建議

### 手動測試流程
1. 進入「自建係數」頁面
2. 點擊「自訂係數」按鈕
3. 填寫表單：
   - 來源：環保署
   - 名稱：測試柴油車係數
   - Country/Area：台灣
   - 啟用日期：2024-01-01
   - 選擇 GHG：CO₂、CH₄
   - CO₂ 排放係數：2.6069，單位：kg CO₂/L
   - CH₄ 排放係數：0.00001，單位：kg CH₄/L
4. 上傳一個測試 PDF 檔案
5. 點擊「儲存係數」
6. 確認係數出現在自建係數列表
7. 點擊係數查看詳情
8. 測試匯入中央庫功能
9. 測試編輯功能
10. 測試刪除功能

---

## 📚 參考資料

- 自建組合係數實作：`src/components/CompositeEditorDrawer.tsx`
- Country/Area 選項：CompositeEditorDrawer.tsx 第 935-942 行
- 現有的自建係數管理：`src/hooks/useMockData.ts`
- 表單驗證範例：CompositeEditorDrawer.tsx 的驗證邏輯

---

## 🎯 實作完成檢查清單

開始實作前，請確認以下事項：

- [ ] 已閱讀完整的實作計畫
- [ ] 理解不需要計算 CO₂e 總值的約束
- [ ] 理解 Country/Area 為必填欄位
- [ ] 理解資料結構設計
- [ ] 準備好開始按照 Step 1-8 順序實作

實作完成後，請確認：

- [ ] 所有 8 個步驟都已完成
- [ ] 通過所有驗收標準
- [ ] 程式碼可以正常編譯
- [ ] 手動測試流程全部通過
- [ ] 沒有 console 錯誤

---

**祝實作順利！如有疑問，請參考現有的組合係數實作。**
