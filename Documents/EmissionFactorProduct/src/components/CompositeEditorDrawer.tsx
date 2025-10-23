'use client'

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  Card,
  CardBody,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import {
  DeleteIcon,
  AddIcon,
  CheckIcon,
  WarningIcon,
  RepeatIcon,
  InfoIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons'
import { useState, Fragment, useMemo, useEffect } from 'react'
import { formatNumber } from '@/lib/utils'
import FactorSelectorModal from './FactorSelectorModal'
import FormulaBuilderContent from './formula-builder/FormulaBuilderContent'
import GWPConversionModal, { FactorWithGWPConversion } from './GWPConversionModal'
import { useMockData } from '@/hooks/useMockData'

interface CompositeEditorDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (compositeData: any) => void
  editingFactor?: any // 編輯模式：傳入現有係數資料
}

interface ComponentItem {
  id: number
  factorId?: number // 原始係數的 ID，用於排除已選擇的係數
  name: string
  value: number
  unit: string
  weight: number

  // GWP 轉換相關欄位
  gwpConversion?: {
    gwpVersion: 'AR4' | 'AR5' | 'AR6'
    originalCO2: number
    originalCH4?: number
    originalN2O?: number
    convertedValue: number
    breakdown: {
      co2_contribution: number
      ch4_contribution: number
      n2o_contribution: number
    }
    isExpanded?: boolean
  }

  // 單位轉換相關欄位
  unitConversion?: {
    mode: 'auto' | 'custom'
    fromUnit: string
    toUnit: string
    canAutoConvert: boolean           // 是否可使用 Auto 模式
    conversionFactor?: number
    convertedValue?: number
    isExpanded?: boolean
  }
}

// 單位分類結構
const UNIT_CATEGORIES = {
  mass: {
    label: '質量',
    units: [
      { value: 'kg', label: 'kg (公斤)' },
      { value: 'g', label: 'g (公克)' },
      { value: 't', label: 't (公噸)' },
      { value: 'ton', label: 'ton (噸)' },
      { value: 'lb', label: 'lb (磅)' },
    ]
  },
  energy: {
    label: '能量',
    units: [
      { value: 'kWh', label: 'kWh (千瓦時)' },
      { value: 'MJ', label: 'MJ (兆焦耳)' },
      { value: 'GJ', label: 'GJ (吉焦耳)' },
      { value: 'MWh', label: 'MWh (百萬瓦時)' },
      { value: 'TJ', label: 'TJ (兆兆焦耳)' },
    ]
  },
  volume: {
    label: '體積',
    units: [
      { value: 'L', label: 'L (公升)' },
      { value: 'mL', label: 'mL (毫升)' },
      { value: 'm³', label: 'm³ (立方公尺)' },
      { value: 'cm³', label: 'cm³ (立方公分)' },
      { value: 'gal', label: 'gal (加侖)' },
    ]
  },
  distance: {
    label: '距離',
    units: [
      { value: 'km', label: 'km (公里)' },
      { value: 'm', label: 'm (公尺)' },
      { value: 'cm', label: 'cm (公分)' },
      { value: 'mm', label: 'mm (公釐)' },
      { value: 'mi', label: 'mi (英里)' },
    ]
  },
  time: {
    label: '時間',
    units: [
      { value: 'hr', label: 'hr (小時)' },
      { value: 'min', label: 'min (分鐘)' },
      { value: 's', label: 's (秒)' },
      { value: 'day', label: 'day (天)' },
      { value: 'year', label: 'year (年)' },
    ]
  },
  area: {
    label: '面積',
    units: [
      { value: 'm²', label: 'm² (平方公尺)' },
      { value: 'km²', label: 'km² (平方公里)' },
      { value: 'ha', label: 'ha (公頃)' },
      { value: 'acre', label: 'acre (英畝)' },
    ]
  },
  count: {
    label: '數量',
    units: [
      { value: 'unit', label: 'unit (單位)' },
      { value: 'piece', label: 'piece (件)' },
      { value: 'item', label: 'item (項)' },
    ]
  },
  transport: {
    label: '運輸',
    units: [
      { value: 'passenger·km', label: 'passenger·km (人公里)' },
      { value: 'tkm', label: 'tkm (噸公里)' },
      { value: 'vehicle·km', label: 'vehicle·km (車公里)' },
    ]
  },
} as const

// 自動單位轉換對照表
const AUTO_CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  // 能源
  'kWh': { 'MJ': 3.6, 'GJ': 0.0036 },
  'MJ': { 'kWh': 0.277778, 'GJ': 0.001 },
  'GJ': { 'MJ': 1000, 'kWh': 277.778 },

  // 質量
  'kg': { 'g': 1000, 't': 0.001 },
  'g': { 'kg': 0.001, 't': 0.000001 },
  't': { 'g': 1000000, 'kg': 1000 },

  // 體積
  'L': { 'mL': 1000, 'm³': 0.001 },
  'mL': { 'L': 0.001, 'm³': 0.000001 },
  'm³': { 'mL': 1000000, 'L': 1000 },

  // 距離
  'km': { 'm': 1000, 'cm': 100000 },
  'm': { 'km': 0.001, 'cm': 100 },
}

export default function CompositeEditorDrawer({
  isOpen,
  onClose,
  onSave,
  editingFactor,
}: CompositeEditorDrawerProps) {
  const toast = useToast()

  // 使用 useMockData hook 獲取真實資料
  const mockData = useMockData()

  // 轉換係數資料為 FactorSelectorModal 需要的格式
  const centralFactors = useMemo(() => {
    return mockData.getAllEmissionFactors().map(f => ({
      id: f.id,
      type: 'emission_factor' as const,
      name: f.name,
      value: f.value,
      unit: f.unit,
      year: f.year,
      region: f.country,
      method_gwp: f.method_gwp,
      source_type: f.source_type,
      source_ref: f.source_ref,
      version: f.version,
      dataSource: 'local' as const,
      requires_gwp_conversion: f.requires_gwp_conversion,
      co2_factor: f.co2_factor,
      ch4_factor: f.ch4_factor,
      n2o_factor: f.n2o_factor,
    }))
  }, [mockData])

  const globalFactors = useMemo(() => {
    return mockData.getAllFactorItems().map(f => ({
      id: f.id,
      type: 'emission_factor' as const,
      name: f.name,
      value: f.value,
      unit: f.unit,
      year: f.year,
      region: f.region || '台灣',
      method_gwp: f.method_gwp || 'GWP100',
      source_type: f.source_type || 'standard',
      source_ref: f.source_ref || 'ecoinvent',
      version: f.version,
      dataSource: 'global' as const,
    }))
  }, [mockData])

  // Form state
  const [compositeName, setCompositeName] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')  // 國家/區域
  const [enabledDate, setEnabledDate] = useState(new Date().toISOString().split('T')[0])  // 啟用日期，預設今天
  const [formulaType, setFormulaType] = useState<'sum' | 'weighted'>('weighted')
  const [targetUnit, setTargetUnit] = useState('kg CO2e/kg')
  const [unitCategory, setUnitCategory] = useState('')  // 單位類別
  const [unitValue, setUnitValue] = useState('')        // 具體單位值
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 1,
      name: '鋼材原料',
      value: 1.85,
      unit: 'kg CO2e/kg',
      weight: 0.6,
    },
    {
      id: 2,
      name: '加工電力',
      value: 0.509,
      unit: 'kg CO2e/kWh',
      weight: 0.3,
    },
    {
      id: 3,
      name: '運輸排放',
      value: 0.156,
      unit: 'kg CO2e/km',
      weight: 0.1,
    },
  ])

  // 編輯模式：預填現有資料
  useEffect(() => {
    if (editingFactor && isOpen) {
      // 預填基本資訊
      setCompositeName(editingFactor.name || '')
      setDescription(editingFactor.description || '')
      setRegion(editingFactor.region || '')
      setEnabledDate(editingFactor.enabled_date || new Date().toISOString().split('T')[0])
      setFormulaType(editingFactor.formula_type || 'weighted')
      setTargetUnit(editingFactor.unit || 'kg CO2e/kg')

      // 預填組成係數
      if (editingFactor.components && editingFactor.components.length > 0) {
        const loadedComponents: ComponentItem[] = editingFactor.components.map((comp: any) => ({
          id: comp.id || Date.now() + Math.random(),
          factorId: comp.factorId,
          name: comp.name,
          value: comp.originalValue,
          unit: comp.originalUnit,
          weight: comp.weight,
          gwpConversion: comp.gwpConversion,
          unitConversion: comp.unitConversion,
        }))
        setComponents(loadedComponents)
      }
    } else if (!editingFactor && isOpen) {
      // 新建模式：使用預設值
      setCompositeName('')
      setDescription('')
      setRegion('')
      setEnabledDate(new Date().toISOString().split('T')[0])
      setFormulaType('weighted')
      setTargetUnit('kg CO2e/kg')
      setComponents([])
    }
  }, [editingFactor, isOpen])

  // 根據 unitValue 自動更新 targetUnit
  useEffect(() => {
    if (unitValue) {
      setTargetUnit(`kg CO₂e/${unitValue}`)
    } else {
      setTargetUnit('')
    }
  }, [unitValue])

  // 編輯模式：解析 targetUnit 到 unitCategory 和 unitValue
  useEffect(() => {
    if (editingFactor?.unit && isOpen) {
      // 解析 "kg CO₂e/kg" -> category: 'mass', value: 'kg'
      const unitPart = editingFactor.unit.replace(/kg CO[₂2]e\//i, '').trim()

      // 查找對應的類別
      for (const [catKey, category] of Object.entries(UNIT_CATEGORIES)) {
        const found = category.units.find((u: { value: string }) => u.value === unitPart)
        if (found) {
          setUnitCategory(catKey)
          setUnitValue(unitPart)
          break
        }
      }
    } else if (!editingFactor && isOpen) {
      // 新建模式：清空
      setUnitCategory('')
      setUnitValue('')
    }
  }, [editingFactor, isOpen])

  // Factor selector state
  const [isFactorSelectorOpen, setIsFactorSelectorOpen] = useState(false)

  // GWP conversion state
  const [isGWPModalOpen, setIsGWPModalOpen] = useState(false)
  const [factorsNeedingGWP, setFactorsNeedingGWP] = useState<any[]>([])
  const [selectedFactorsTemp, setSelectedFactorsTemp] = useState<any[]>([])

  // === 單位類別與轉換邏輯 ===

  // 從單位中提取類別
  const getUnitCategory = (unit: string): string | null => {
    const denominator = unit.split('/').pop()?.trim() || unit

    for (const [category, categoryData] of Object.entries(UNIT_CATEGORIES)) {
      if (categoryData.units.some((u: { value: string }) => denominator.toLowerCase().includes(u.value.toLowerCase()))) {
        return category
      }
    }

    return null
  }

  // 檢查兩個單位是否屬於同一類別
  const isSameCategory = (unit1: string, unit2: string): boolean => {
    const category1 = getUnitCategory(unit1)
    const category2 = getUnitCategory(unit2)

    return category1 !== null && category2 !== null && category1 === category2
  }

  // 檢查單位相容性
  const checkUnitCompatibility = (componentUnit: string, targetUnit: string) => {
    const extractDenominator = (unit: string) => {
      const parts = unit.split('/')
      return parts.length > 1 ? parts[1].trim() : parts[0].trim()
    }

    const fromDenom = extractDenominator(componentUnit)
    const toDenom = extractDenominator(targetUnit)

    const isExactMatch = fromDenom === toDenom
    const sameCategory = isSameCategory(fromDenom, toDenom)
    const fromCategory = getUnitCategory(fromDenom)
    const toCategory = getUnitCategory(toDenom)

    return {
      isCompatible: isExactMatch,
      sameCategory,
      canAutoConvert: sameCategory,
      fromDenom,
      toDenom,
      fromCategory,
      toCategory,
    }
  }

  // 取得自動轉換因子
  const getAutoConversionFactor = (from: string, to: string): number | null => {
    return AUTO_CONVERSION_FACTORS[from]?.[to] ?? null
  }

  // 處理單位轉換展開/收合
  const handleUnitConversionToggle = (componentId: number) => {
    setComponents(components.map(comp => {
      if (comp.id === componentId) {
        const check = checkUnitCompatibility(comp.unit, targetUnit)

        if (!comp.unitConversion) {
          // 初始化轉換設定
          let mode: 'auto' | 'custom' = 'custom'
          let autoFactor: number | undefined = undefined

          // 只有同類別才能使用 Auto 模式
          if (check.canAutoConvert) {
            const factor = getAutoConversionFactor(check.fromDenom, check.toDenom)
            if (factor !== null) {
              autoFactor = factor
              mode = 'auto'
            }
          }

          return {
            ...comp,
            unitConversion: {
              mode,
              fromUnit: comp.unit,
              toUnit: targetUnit,
              canAutoConvert: check.canAutoConvert,
              conversionFactor: autoFactor ?? undefined,
              convertedValue: autoFactor ? comp.value * autoFactor : undefined,
              isExpanded: true,
            }
          }
        } else {
          // 切換展開狀態
          return {
            ...comp,
            unitConversion: {
              ...comp.unitConversion,
              isExpanded: !comp.unitConversion.isExpanded,
            }
          }
        }
      }
      return comp
    }))
  }

  // 處理轉換模式切換
  const handleConversionModeChange = (componentId: number, mode: 'auto' | 'custom') => {
    setComponents(components.map(comp => {
      if (comp.id === componentId && comp.unitConversion) {
        const check = checkUnitCompatibility(comp.unit, targetUnit)

        if (mode === 'auto' && comp.unitConversion.canAutoConvert) {
          const factor = getAutoConversionFactor(check.fromDenom, check.toDenom)
          const autoFactor = factor !== null ? factor : undefined
          return {
            ...comp,
            unitConversion: {
              ...comp.unitConversion,
              mode: 'auto',
              conversionFactor: autoFactor,
              convertedValue: autoFactor ? comp.value * autoFactor : undefined,
            }
          }
        } else {
          return {
            ...comp,
            unitConversion: {
              ...comp.unitConversion,
              mode: 'custom',
            }
          }
        }
      }
      return comp
    }))
  }

  // 處理自訂轉換因子輸入
  const handleConversionFactorChange = (componentId: number, factor: number) => {
    setComponents(components.map(comp => {
      if (comp.id === componentId && comp.unitConversion) {
        return {
          ...comp,
          unitConversion: {
            ...comp.unitConversion,
            mode: 'custom',
            conversionFactor: factor,
            convertedValue: comp.value * factor,
          }
        }
      }
      return comp
    }))
  }

  // 檢查是否有單位不相容的情況
  const hasUnitIncompatibility = components.some(comp => {
    const check = checkUnitCompatibility(comp.unit, targetUnit)
    return !check.isCompatible
  })

  // === 結束單位類別與轉換邏輯 ===

  // Calculate composite value（支援 GWP 轉換和單位轉換）
  const calculateCompositeValue = () => {
    if (components.length === 0) return 0

    if (formulaType === 'sum') {
      return components.reduce((sum, comp) => {
        // 優先使用單位轉換值 → GWP 轉換值 → 原始值
        const effectiveValue =
          comp.unitConversion?.convertedValue ??
          comp.gwpConversion?.convertedValue ??
          comp.value
        return sum + effectiveValue * comp.weight
      }, 0)
    } else {
      // weighted average
      const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
      if (totalWeight === 0) return 0

      const weightedSum = components.reduce((sum, comp) => {
        // 優先使用單位轉換值 → GWP 轉換值 → 原始值
        const effectiveValue =
          comp.unitConversion?.convertedValue ??
          comp.gwpConversion?.convertedValue ??
          comp.value
        return sum + effectiveValue * comp.weight
      }, 0)
      return weightedSum / totalWeight
    }
  }

  const computedValue = calculateCompositeValue()

  const handleWeightChange = (id: number, weight: number) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, weight } : comp
    ))
  }

  const handleRemoveComponent = (id: number) => {
    setComponents(components.filter(comp => comp.id !== id))
  }

  const handleAddComponent = () => {
    setIsFactorSelectorOpen(true)
  }

  // 處理係數選擇完成
  const handleFactorSelect = (selectedFactors: any[]) => {
    // 檢查是否有需要 GWP 轉換的係數
    const needsGWP = selectedFactors.filter(f => f.requires_gwp_conversion)

    if (needsGWP.length > 0) {
      // 有需要 GWP 轉換的係數，先儲存選擇的係數，然後開啟 GWP Modal
      setSelectedFactorsTemp(selectedFactors)
      setFactorsNeedingGWP(needsGWP)
      setIsFactorSelectorOpen(false)
      setIsGWPModalOpen(true)
    } else {
      // 沒有需要 GWP 轉換的係數，直接加入
      addFactorsToComponents(selectedFactors)
      setIsFactorSelectorOpen(false)
    }
  }

  // 處理 GWP 轉換完成
  const handleGWPConversionComplete = (factorsWithGWP: FactorWithGWPConversion[]) => {
    // 建立 GWP 轉換後的係數 Map
    const gwpMap = new Map(factorsWithGWP.map(f => [f.id, f]))

    // 合併原始選擇和 GWP 轉換後的資料
    const allFactors = selectedFactorsTemp.map(factor => {
      const gwpFactor = gwpMap.get(factor.id)
      if (gwpFactor) {
        return {
          ...factor,
          gwpConversion: {
            gwpVersion: gwpFactor.gwpVersion,
            originalCO2: gwpFactor.co2_factor || 0,
            originalCH4: gwpFactor.ch4_factor,
            originalN2O: gwpFactor.n2o_factor,
            convertedValue: gwpFactor.convertedCO2eValue,
            breakdown: gwpFactor.conversionBreakdown,
          }
        }
      }
      return factor
    })

    addFactorsToComponents(allFactors)
    setIsGWPModalOpen(false)
    setSelectedFactorsTemp([])
    setFactorsNeedingGWP([])
  }

  // 將係數加入到組合中
  const addFactorsToComponents = (factors: any[]) => {
    const newComponents: ComponentItem[] = factors.map(factor => ({
      id: Date.now() + Math.random(), // 生成唯一 ID
      factorId: factor.id, // 保存原始係數 ID
      name: factor.name,
      value: factor.gwpConversion?.convertedValue || factor.value,
      unit: factor.gwpConversion ? `kg CO2e/${factor.unit.split('/')[1] || 'unit'}` : factor.unit,
      weight: factors.length > 0 ? 1.0 / factors.length : 1.0, // 平均分配權重
      gwpConversion: factor.gwpConversion,
    }))

    setComponents(prev => [...prev, ...newComponents])

    toast({
      title: '係數已加入',
      description: `成功加入 ${factors.length} 個係數到組合中`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const validateForm = () => {
    const errors = []
    
    if (!compositeName.trim()) {
      errors.push('請輸入組合係數名稱')
    }
    
    if (components.length === 0) {
      errors.push('至少需要一個組成係數')
    }
    
    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
    if (formulaType === 'weighted' && Math.abs(totalWeight - 1) > 0.001) {
      errors.push('權重總和應該等於 1.0')
    }
    
    const invalidWeights = components.filter(comp => comp.weight <= 0)
    if (invalidWeights.length > 0) {
      errors.push('所有權重必須大於 0')
    }
    
    return errors
  }

  const handleSave = () => {
    const errors = validateForm()
    
    if (errors.length > 0) {
      toast({
        title: '驗證失敗',
        description: errors.join('; '),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const compositeData = {
      ...(editingFactor?.id && { id: editingFactor.id }), // 編輯模式：傳遞 id
      name: compositeName,
      description,
      region,
      enabled_date: enabledDate,
      formula_type: formulaType,
      unit: targetUnit,
      computed_value: computedValue,
      components: components.map(comp => ({
        id: comp.id,
        factorId: comp.factorId, // 保存原始係數 ID
        name: comp.name, // 保存係數名稱
        originalValue: comp.value, // 保存原始值
        originalUnit: comp.unit, // 保存原始單位
        weight: comp.weight,

        // GWP 轉換資訊
        gwpConversion: comp.gwpConversion ? {
          gwpVersion: comp.gwpConversion.gwpVersion,
          originalCO2: comp.gwpConversion.originalCO2,
          originalCH4: comp.gwpConversion.originalCH4,
          originalN2O: comp.gwpConversion.originalN2O,
          convertedValue: comp.gwpConversion.convertedValue,
          breakdown: comp.gwpConversion.breakdown,
        } : null,

        // 單位轉換資訊
        unitConversion: comp.unitConversion ? {
          mode: comp.unitConversion.mode,
          fromUnit: comp.unitConversion.fromUnit,
          toUnit: comp.unitConversion.toUnit,
          canAutoConvert: comp.unitConversion.canAutoConvert,
          conversionFactor: comp.unitConversion.conversionFactor,
          convertedValue: comp.unitConversion.convertedValue,
        } : null,
      })),
    }

    console.log('Saving composite factor:', compositeData)

    // 呼叫父組件的儲存函數
    onSave?.(compositeData)

    toast({
      title: editingFactor ? '組合係數已更新' : '組合係數已建立',
      description: `「${compositeName}」已${editingFactor ? '更新' : '儲存到自建係數資料夾'}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // 清除表單
    setCompositeName('')
    setDescription('')
    setComponents([])
    onClose()
  }

  const handleReset = () => {
    setCompositeName('')
    setDescription('')
    setComponents([])
  }

  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
  const isWeightedFormula = formulaType === 'weighted'
  const weightError = isWeightedFormula && Math.abs(totalWeight - 1) > 0.001

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {editingFactor ? '編輯組合係數' : '自建組合係數編輯器'}
        </DrawerHeader>

        <DrawerBody>
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList mb={4}>
              <Tab>傳統模式</Tab>
              <Tab>🚀 公式建構器</Tab>
            </TabList>

            <TabPanels>
              {/* 傳統模式 - 原有功能 */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={4}>基本資訊</Text>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">組合係數名稱</FormLabel>
                  <Input
                    value={compositeName}
                    onChange={(e) => setCompositeName(e.target.value)}
                    placeholder="請輸入組合係數名稱"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">描述</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="請輸入組合係數的詳細描述..."
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">國家/區域</FormLabel>
                    <Select
                      placeholder="請選擇國家/區域"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="台灣">台灣</option>
                      <option value="美國">美國</option>
                      <option value="英國">英國</option>
                      <option value="中國">中國</option>
                      <option value="日本">日本</option>
                      <option value="歐盟">歐盟</option>
                      <option value="全球">全球</option>
                      <option value="國際">國際</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">啟用日期</FormLabel>
                    <Input
                      type="date"
                      value={enabledDate}
                      onChange={(e) => setEnabledDate(e.target.value)}
                    />
                  </FormControl>
                </HStack>

                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">計算方式</FormLabel>
                    <Select
                      value={formulaType}
                      onChange={(e) => setFormulaType(e.target.value as 'sum' | 'weighted')}
                    >
                      <option value="weighted">權重平均</option>
                      <option value="sum">權重加總</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">目標單位</FormLabel>
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2}>
                        {/* 固定分子 */}
                        <Text fontSize="sm" fontWeight="medium" minW="80px">
                          kg CO₂e /
                        </Text>

                        {/* 第一層：單位類別 */}
                        <Select
                          placeholder="請選擇類別"
                          value={unitCategory}
                          onChange={(e) => {
                            setUnitCategory(e.target.value)
                            setUnitValue('')  // 清空具體單位
                          }}
                          flex={1}
                          size="sm"
                        >
                          {Object.entries(UNIT_CATEGORIES).map(([key, category]) => (
                            <option key={key} value={key}>
                              {category.label}
                            </option>
                          ))}
                        </Select>

                        {/* 第二層：具體單位 */}
                        <Select
                          placeholder="請選擇單位"
                          value={unitValue}
                          onChange={(e) => setUnitValue(e.target.value)}
                          flex={1}
                          size="sm"
                          isDisabled={!unitCategory}
                        >
                          {unitCategory && UNIT_CATEGORIES[unitCategory as keyof typeof UNIT_CATEGORIES].units.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </Select>
                      </HStack>

                      {/* 顯示完整單位 */}
                      {unitValue && (
                        <Text fontSize="xs" color="gray.600">
                          完整單位：kg CO₂e/{unitValue}
                        </Text>
                      )}
                    </VStack>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Components */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="md" fontWeight="medium">組成係數</Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleAddComponent}
                >
                  新增係數
                </Button>
              </HStack>

              {components.length > 0 ? (
                <Box borderRadius="md" border="1px solid" borderColor="gray.200" overflow="hidden">
                  <Table size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>係數名稱</Th>
                        <Th isNumeric>值</Th>
                        <Th>單位</Th>
                        <Th isNumeric>權重</Th>
                        <Th width="60px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {components.map((component) => {
                        const check = checkUnitCompatibility(component.unit, targetUnit)
                        const hasWarning = !check.isCompatible && !component.unitConversion?.convertedValue

                        return (
                          <Fragment key={component.id}>
                            {/* 主要行 */}
                            <Tr bg={hasWarning ? 'orange.50' : undefined}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={2}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {component.name}
                                    </Text>
                                    {!check.isCompatible && (
                                      <Tooltip
                                        label={
                                          check.canAutoConvert
                                            ? `單位不一致，但可自動轉換（${check.fromCategory}）`
                                            : `單位類別不同（${check.fromCategory || '未知'} → ${check.toCategory || '未知'}），需手動輸入`
                                        }
                                        placement="top"
                                      >
                                        <Icon
                                          as={WarningIcon}
                                          color={check.canAutoConvert ? 'orange.400' : 'red.500'}
                                          boxSize={3}
                                          cursor="pointer"
                                          onClick={() => handleUnitConversionToggle(component.id)}
                                        />
                                      </Tooltip>
                                    )}
                                  </HStack>
                                  {component.gwpConversion && (
                                    <Badge size="xs" colorScheme="green">
                                      GWP {component.gwpConversion.gwpVersion} 轉換
                                    </Badge>
                                  )}
                                </VStack>
                              </Td>
                              <Td isNumeric>
                                <Text fontSize="sm" fontFamily="mono">
                                  {formatNumber(component.value)}
                                </Text>
                              </Td>
                              <Td>
                                <HStack spacing={1}>
                                  <Text fontSize="sm">{component.unit}</Text>
                                  {!check.isCompatible && (
                                    <Badge colorScheme="orange" fontSize="xs">不匹配</Badge>
                                  )}
                                </HStack>
                              </Td>
                              <Td isNumeric>
                                <NumberInput
                                  size="sm"
                                  min={0}
                                  max={isWeightedFormula ? 1 : undefined}
                                  step={0.1}
                                  value={component.weight}
                                  onChange={(_, value) => handleWeightChange(component.id, value)}
                                  w="80px"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </Td>
                              <Td>
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveComponent(component.id)}
                                  aria-label="Remove component"
                                />
                              </Td>
                            </Tr>

                            {/* 單位轉換展開行 */}
                            {component.unitConversion?.isExpanded && (
                              <Tr>
                                <Td colSpan={5} bg="blue.50" p={3}>
                                  <VStack align="stretch" spacing={2}>
                                    {/* 轉換模式選擇 */}
                                    <HStack>
                                      <Icon as={RepeatIcon} color="blue.600" />
                                      <Text fontSize="sm" fontWeight="medium">單位轉換:</Text>

                                      {/* 根據 canAutoConvert 決定顯示的選項 */}
                                      {component.unitConversion.canAutoConvert ? (
                                        <Select
                                          size="sm"
                                          width="120px"
                                          value={component.unitConversion.mode}
                                          onChange={(e) => handleConversionModeChange(component.id, e.target.value as 'auto' | 'custom')}
                                        >
                                          <option value="auto">Auto</option>
                                          <option value="custom">Custom</option>
                                        </Select>
                                      ) : (
                                        <HStack>
                                          <Badge colorScheme="orange" fontSize="xs">Custom Only</Badge>
                                          <Tooltip
                                            label={`單位類別不一致（${check.fromCategory || '未知'} → ${check.toCategory || '未知'}），僅能手動輸入轉換因子`}
                                            placement="top"
                                          >
                                            <Icon as={InfoIcon} color="orange.500" boxSize={3} />
                                          </Tooltip>
                                        </HStack>
                                      )}

                                      <Text fontSize="sm">→ {targetUnit}</Text>
                                    </HStack>

                                    {/* Auto 模式：顯示預設因子 */}
                                    {component.unitConversion.mode === 'auto' && component.unitConversion.canAutoConvert && (
                                      <HStack pl={6} spacing={2}>
                                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                                        <Text fontSize="sm" color="green.700">
                                          使用預設轉換因子: 1 {check.fromDenom} = {component.unitConversion.conversionFactor} {check.toDenom}
                                        </Text>
                                      </HStack>
                                    )}

                                    {/* Custom 模式：轉換因子輸入 */}
                                    {(component.unitConversion.mode === 'custom' || !component.unitConversion.canAutoConvert) && (
                                      <HStack pl={6} spacing={2}>
                                        <Text fontSize="sm">Convert: {check.fromDenom} → {check.toDenom} using ratio</Text>
                                        <NumberInput
                                          size="sm"
                                          width="100px"
                                          value={component.unitConversion.conversionFactor ?? ''}
                                          onChange={(_, val) => handleConversionFactorChange(component.id, val)}
                                          step={0.1}
                                          precision={4}
                                        >
                                          <NumberInputField placeholder="輸入因子" />
                                        </NumberInput>
                                        <Text fontSize="sm">{check.fromDenom}/{check.toDenom}</Text>
                                      </HStack>
                                    )}

                                    {/* 轉換後的值 */}
                                    {component.unitConversion.convertedValue !== undefined && (
                                      <HStack pl={6}>
                                        <Text fontSize="sm">Converted Value:</Text>
                                        <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color="green.600">
                                          {formatNumber(component.unitConversion.convertedValue)} {targetUnit}
                                        </Text>
                                      </HStack>
                                    )}

                                    {/* 類別不一致警告 */}
                                    {!component.unitConversion.canAutoConvert && (
                                      <Alert status="warning" size="sm" borderRadius="md">
                                        <AlertIcon />
                                        <Text fontSize="xs">
                                          單位類別不一致（{check.fromCategory || '未知'} ≠ {check.toCategory || '未知'}），請手動輸入轉換因子
                                        </Text>
                                      </Alert>
                                    )}
                                  </VStack>
                                </Td>
                              </Tr>
                            )}

                            {/* GWP 轉換顯示行 */}
                            {component.gwpConversion && (
                              <Tr>
                                <Td colSpan={5} bg="green.50" p={3}>
                                  <VStack align="stretch" spacing={2}>
                                    <HStack>
                                      <Icon as={CheckCircleIcon} color="green.600" />
                                      <Text fontSize="sm" fontWeight="medium" color="green.700">
                                        GWP {component.gwpConversion.gwpVersion} 轉換詳情
                                      </Text>
                                    </HStack>

                                    {/* 氣體分解 */}
                                    <VStack align="stretch" spacing={1} pl={6}>
                                      <HStack justify="space-between">
                                        <Text fontSize="xs">CO₂:</Text>
                                        <HStack>
                                          <Text fontSize="xs" fontFamily="mono">
                                            {formatNumber(component.gwpConversion.originalCO2)} × 1
                                          </Text>
                                          <Text fontSize="xs" fontFamily="mono" fontWeight="bold">
                                            = {formatNumber(component.gwpConversion.breakdown.co2_contribution)}
                                          </Text>
                                        </HStack>
                                      </HStack>

                                      {component.gwpConversion.originalCH4 && (
                                        <HStack justify="space-between">
                                          <Text fontSize="xs">CH₄:</Text>
                                          <HStack>
                                            <Text fontSize="xs" fontFamily="mono">
                                              {formatNumber(component.gwpConversion.originalCH4)} × {component.gwpConversion.gwpVersion === 'AR4' ? '25' : component.gwpConversion.gwpVersion === 'AR5' ? '28' : '27.9'}
                                            </Text>
                                            <Text fontSize="xs" fontFamily="mono" fontWeight="bold">
                                              = {formatNumber(component.gwpConversion.breakdown.ch4_contribution)}
                                            </Text>
                                          </HStack>
                                        </HStack>
                                      )}

                                      {component.gwpConversion.originalN2O && (
                                        <HStack justify="space-between">
                                          <Text fontSize="xs">N₂O:</Text>
                                          <HStack>
                                            <Text fontSize="xs" fontFamily="mono">
                                              {formatNumber(component.gwpConversion.originalN2O)} × {component.gwpConversion.gwpVersion === 'AR4' ? '298' : component.gwpConversion.gwpVersion === 'AR5' ? '265' : '273'}
                                            </Text>
                                            <Text fontSize="xs" fontFamily="mono" fontWeight="bold">
                                              = {formatNumber(component.gwpConversion.breakdown.n2o_contribution)}
                                            </Text>
                                          </HStack>
                                        </HStack>
                                      )}

                                      <Divider my={1} />

                                      <HStack justify="space-between">
                                        <Text fontSize="sm" fontWeight="bold">轉換後 CO₂e:</Text>
                                        <Text fontSize="sm" fontFamily="mono" fontWeight="bold" color="green.600">
                                          {formatNumber(component.gwpConversion.convertedValue)} {component.unit}
                                        </Text>
                                      </HStack>
                                    </VStack>
                                  </VStack>
                                </Td>
                              </Tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box
                  p={8}
                  textAlign="center"
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  color="gray.500"
                >
                  <Text fontSize="sm">尚未加入任何組成係數</Text>
                  <Text fontSize="xs" mt={1}>點擊「新增係數」開始建立組合</Text>
                </Box>
              )}

              {/* Weight Summary */}
              {components.length > 0 && (
                <HStack justify="space-between" mt={4} p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    權重總計:
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontFamily="mono">
                      {totalWeight.toFixed(3)}
                    </Text>
                    {weightError && (
                      <Badge colorScheme="red" size="sm">
                        應為 1.0
                      </Badge>
                    )}
                  </HStack>
                </HStack>
              )}

              {/* 單位相容性警告 */}
              {hasUnitIncompatibility && (
                <Alert status="warning" size="sm" borderRadius="md" mt={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">單位相容性警告</Text>
                    <Text fontSize="xs">
                      部分係數的單位類型不一致。建議使用「權重加總」方法或驗證計算邏輯。
                    </Text>
                  </VStack>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Calculation Result */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={4}>計算結果</Text>
              
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">計算方式:</Text>
                      <Badge colorScheme={formulaType === 'weighted' ? 'blue' : 'green'}>
                        {formulaType === 'weighted' ? '權重平均' : '權重加總'}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">組成係數數量:</Text>
                      <Text fontSize="sm">{components.length} 個</Text>
                    </HStack>

                    {/* 計算公式展示 */}
                    {components.length > 0 && (
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>計算公式:</Text>
                        <Text fontSize="xs" fontFamily="mono" color="gray.700">
                          {components.map((comp, idx) => {
                            const value = comp.unitConversion?.convertedValue ?? comp.value
                            return `(${formatNumber(value)}×${comp.weight})${idx < components.length - 1 ? ' + ' : ''}`
                          }).join('')}
                        </Text>
                      </Box>
                    )}

                    {/* 單位轉換摘要 */}
                    {components.some(c => c.unitConversion?.convertedValue) && (
                      <Box>
                        <Text fontSize="xs" color="blue.600">
                          ✓ {components.filter(c => c.unitConversion?.convertedValue).length} 個係數已進行單位轉換
                        </Text>
                      </Box>
                    )}

                    <Divider />

                    <HStack justify="space-between" align="center">
                      <Text fontSize="md" fontWeight="medium">組合係數值:</Text>
                      <Text fontSize="xl" fontWeight="bold" fontFamily="mono" color="brand.600">
                        {formatNumber(computedValue)} {targetUnit}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {weightError && (
                <Alert status="warning" size="sm" borderRadius="md" mt={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    權重總和應該等於 1.0，目前為 {totalWeight.toFixed(3)}
                  </Text>
                </Alert>
              )}
            </Box>
                </VStack>
              </TabPanel>

              {/* 公式建構器模式 - 新功能 */}
              <TabPanel px={0}>
                <FormulaBuilderContent onSave={onSave} onClose={onClose} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter borderTop="1px solid" borderColor="gray.200">
          <HStack w="100%" justify="space-between">
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSave}
                leftIcon={<CheckIcon />}
                isDisabled={components.length === 0 || !compositeName.trim()}
              >
                儲存組合係數
              </Button>
            </HStack>
          </HStack>
        </DrawerFooter>
      </DrawerContent>

      {/* 係數選擇器 Modal */}
      <FactorSelectorModal
        isOpen={isFactorSelectorOpen}
        onClose={() => setIsFactorSelectorOpen(false)}
        onConfirm={handleFactorSelect}
        excludeIds={components.map(comp => comp.factorId).filter(Boolean) as number[]}
        targetUnit={targetUnit}
        centralFactors={centralFactors}
        globalFactors={globalFactors}
      />

      {/* GWP 轉換 Modal */}
      <GWPConversionModal
        isOpen={isGWPModalOpen}
        onClose={() => {
          setIsGWPModalOpen(false)
          setSelectedFactorsTemp([])
          setFactorsNeedingGWP([])
        }}
        onConfirm={handleGWPConversionComplete}
        factors={factorsNeedingGWP}
      />
    </Drawer>
  )
}