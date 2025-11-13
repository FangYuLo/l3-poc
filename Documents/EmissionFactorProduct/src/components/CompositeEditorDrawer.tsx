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
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Button,
  Text,
  Box,
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
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react'
import {
  DeleteIcon,
  AddIcon,
  WarningIcon,
  RepeatIcon,
  InfoIcon,
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
  const [region, setRegion] = useState('全球')  // 國家/區域，預設為「全球」
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

  // 驗證錯誤狀態
  const [validationErrors, setValidationErrors] = useState<{
    compositeName?: string
    region?: string
    components?: string
    weightTotal?: string
    weightValues?: string
  }>({})

  // 編輯模式：預填現有資料
  useEffect(() => {
    if (editingFactor && isOpen) {
      // 預填基本資訊
      setCompositeName(editingFactor.name || '')
      setDescription(editingFactor.description || '')
      setRegion(editingFactor.region || '全球')  // 如果沒有值則預設為「全球」
      setEnabledDate(editingFactor.enabledDate || editingFactor.enabled_date || new Date().toISOString().split('T')[0])  // 優先使用駝峰格式，向後兼容下劃線格式
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
      setRegion('全球')  // 新建時預設為「全球」
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
      if (comp.id === componentId) {
        const check = checkUnitCompatibility(comp.unit, targetUnit)

        if (mode === 'auto' && check.canAutoConvert) {
          const factor = getAutoConversionFactor(check.fromDenom, check.toDenom)
          const autoFactor = factor !== null ? factor : undefined

          return {
            ...comp,
            unitConversion: {
              mode: 'auto',
              fromUnit: comp.unit,
              toUnit: targetUnit,
              canAutoConvert: true,
              conversionFactor: autoFactor,
              convertedValue: autoFactor ? comp.value * autoFactor : undefined,
              isExpanded: true,
            }
          }
        } else {
          // 切換到 custom 模式
          if (comp.unitConversion) {
            return {
              ...comp,
              unitConversion: {
                ...comp.unitConversion,
                mode: 'custom',
              }
            }
          } else {
            // 如果還沒有 unitConversion，創建一個新的
            return {
              ...comp,
              unitConversion: {
                mode: 'custom',
                fromUnit: comp.unit,
                toUnit: targetUnit,
                canAutoConvert: check.canAutoConvert,
                conversionFactor: undefined,
                convertedValue: undefined,
                isExpanded: true,
              }
            }
          }
        }
      }
      return comp
    }))
  }

  // 處理自訂轉換因子輸入
  const handleConversionFactorChange = (componentId: number, factor: number | undefined) => {
    setComponents(components.map(comp => {
      if (comp.id === componentId) {
        const check = checkUnitCompatibility(comp.unit, targetUnit)

        // 如果 factor 是 undefined，清除 unitConversion
        if (factor === undefined) {
          return {
            ...comp,
            unitConversion: undefined,
          }
        }

        // 如果 unitConversion 不存在，創建一個新的
        if (!comp.unitConversion) {
          return {
            ...comp,
            unitConversion: {
              mode: 'custom',
              fromUnit: comp.unit,
              toUnit: targetUnit,
              canAutoConvert: check.canAutoConvert,
              conversionFactor: factor,
              convertedValue: comp.value * factor,
              isExpanded: true,
            }
          }
        }

        // 如果已存在，更新它
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

    // 清除權重相關錯誤
    if (validationErrors.weightTotal || validationErrors.weightValues) {
      setValidationErrors(prev => ({
        ...prev,
        weightTotal: undefined,
        weightValues: undefined
      }))
    }
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
    const newComponents: ComponentItem[] = factors.map(factor => {
      const factorUnit = factor.gwpConversion ? `kg CO2e/${factor.unit.split('/')[1] || 'unit'}` : factor.unit
      const factorValue = factor.gwpConversion?.convertedValue || factor.value

      // 檢查單位相容性
      const extractDenominator = (unit: string) => {
        const parts = unit.split('/')
        return parts.length > 1 ? parts[1].trim() : parts[0].trim()
      }

      const fromDenom = extractDenominator(factorUnit)
      const toDenom = extractDenominator(targetUnit)
      const isExactMatch = fromDenom === toDenom
      const sameCategory = isSameCategory(fromDenom, toDenom)

      // 如果單位不完全相同但屬於同類別，自動初始化 auto 模式的 unitConversion
      let unitConversion = undefined
      if (!isExactMatch && sameCategory) {
        const autoFactor = getAutoConversionFactor(fromDenom, toDenom)
        if (autoFactor !== null) {
          unitConversion = {
            mode: 'auto' as const,
            fromUnit: factorUnit,
            toUnit: targetUnit,
            canAutoConvert: true,
            conversionFactor: autoFactor,
            convertedValue: factorValue * autoFactor,
            isExpanded: true,
          }
        }
      }

      return {
        id: Date.now() + Math.random(), // 生成唯一 ID
        factorId: factor.id, // 保存原始係數 ID
        name: factor.name,
        value: factorValue,
        unit: factorUnit,
        weight: factors.length > 0 ? 1.0 / factors.length : 1.0, // 平均分配權重
        gwpConversion: factor.gwpConversion,
        unitConversion,
      }
    })

    setComponents(prev => [...prev, ...newComponents])

    // 清除組成係數錯誤
    if (validationErrors.components) {
      setValidationErrors(prev => ({ ...prev, components: undefined }))
    }

    toast({
      title: '係數已加入',
      description: `成功加入 ${factors.length} 個係數到組合中`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const validateForm = () => {
    const errors: {
      compositeName?: string
      region?: string
      components?: string
      weightTotal?: string
      weightValues?: string
    } = {}

    if (!compositeName.trim()) {
      errors.compositeName = '請輸入組合係數名稱'
    }

    if (!region || !region.trim()) {
      errors.region = '請選擇國家/區域'
    }

    if (components.length === 0) {
      errors.components = '至少需要一個組成係數'
    }

    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
    if (formulaType === 'weighted' && Math.abs(totalWeight - 1) > 0.001) {
      errors.weightTotal = '權重總和應該等於 1.0'
    }

    const invalidWeights = components.filter(comp => comp.weight <= 0)
    if (invalidWeights.length > 0) {
      errors.weightValues = '所有權重必須大於 0'
    }

    return errors
  }

  const handleSave = () => {
    const errors = validateForm()

    // 設定驗證錯誤狀態
    setValidationErrors(errors)

    // 如果有任何錯誤，不執行儲存
    if (Object.keys(errors).length > 0) {
      return
    }

    const compositeData = {
      ...(editingFactor?.id && { id: editingFactor.id }), // 編輯模式：傳遞 id
      name: compositeName,
      description,
      region,
      enabledDate: enabledDate,  // 使用駝峰格式，與前端其他地方一致
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

    // 清除表單和驗證錯誤
    setCompositeName('')
    setDescription('')
    setComponents([])
    setValidationErrors({})
    onClose()
  }

  const handleReset = () => {
    setCompositeName('')
    setDescription('')
    setComponents([])
    setValidationErrors({}) // 清除所有驗證錯誤
  }

  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
  const isWeightedFormula = formulaType === 'weighted'
  const weightError = isWeightedFormula && Math.abs(totalWeight - 1) > 0.001

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          Create Composite Factor
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
              <Text fontSize="md" fontWeight="medium" mb={4} color="blue.600">Basic Information</Text>

              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!validationErrors.compositeName}>
                  <FormLabel fontSize="sm">Composite Factor Name</FormLabel>
                  <Input
                    value={compositeName}
                    onChange={(e) => {
                      setCompositeName(e.target.value)
                      // 清除錯誤訊息
                      if (validationErrors.compositeName) {
                        setValidationErrors(prev => ({ ...prev, compositeName: undefined }))
                      }
                    }}
                    placeholder="Please enter"
                  />
                  <FormErrorMessage>{validationErrors.compositeName}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Comment</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please enter"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired isInvalid={!!validationErrors.region}>
                    <FormLabel fontSize="sm">Country/Area</FormLabel>
                    <Select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value)
                        // 清除錯誤訊息
                        if (validationErrors.region) {
                          setValidationErrors(prev => ({ ...prev, region: undefined }))
                        }
                      }}
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
                    <FormErrorMessage>{validationErrors.region}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Enabled Date</FormLabel>
                    <Input
                      type="date"
                      value={enabledDate}
                      onChange={(e) => setEnabledDate(e.target.value)}
                      placeholder="(yyyy/mm/dd)"
                    />
                  </FormControl>
                </HStack>

                <HStack align="start" spacing={6}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">Calculation Method</FormLabel>
                    <RadioGroup
                      value={formulaType}
                      onChange={(value) => setFormulaType(value as 'sum' | 'weighted')}
                    >
                      <Stack direction="row" spacing={4}>
                        <Radio value="weighted">Weighted Average</Radio>
                        <Radio value="sum">Weighted Sum</Radio>
                      </Stack>
                    </RadioGroup>
                    <Text fontSize="xs" color="gray.600" mt={2}>
                      If weighted average is selected, the total weight must equal 1.
                    </Text>
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">
                      Target Unit <Text as="span" color="gray.500" fontWeight="normal">(Preview: kg CO₂e/{unitValue || '(unit)'})</Text>
                    </FormLabel>
                    <HStack spacing={2}>
                      {/* 第一層：單位類別 */}
                      <Select
                        placeholder="Weight"
                        value={unitCategory}
                        onChange={(e) => {
                          setUnitCategory(e.target.value)
                          setUnitValue('')  // 清空具體單位
                        }}
                        flex={1}
                      >
                        {Object.entries(UNIT_CATEGORIES).map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.label}
                          </option>
                        ))}
                      </Select>

                      {/* 第二層：具體單位 */}
                      <Select
                        placeholder="kg"
                        value={unitValue}
                        onChange={(e) => setUnitValue(e.target.value)}
                        flex={1}
                        isDisabled={!unitCategory}
                      >
                        {unitCategory && UNIT_CATEGORIES[unitCategory as keyof typeof UNIT_CATEGORIES].units.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </Select>
                    </HStack>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Components */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="md" fontWeight="medium" color="blue.600">組合係數組成</Text>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Reset all"
                    icon={<RepeatIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setComponents([])}
                    isDisabled={components.length === 0}
                  />
                  <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleAddComponent}
                  >
                    + Add Factor
                  </Button>
                </HStack>
              </HStack>

              {components.length > 0 ? (
                <VStack spacing={0} align="stretch">
                  {components.map((component, index) => {
                    const check = checkUnitCompatibility(component.unit, targetUnit)
                    const hasWarning = !check.isCompatible && !component.unitConversion?.convertedValue

                    return (
                      <Fragment key={component.id}>
                        {/* Factor Card */}
                        <Box
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={4}
                        >
                          <HStack justify="space-between" mb={2}>
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack spacing={2}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {component.name}
                                </Text>
                                {!check.isCompatible && (
                                  <Icon
                                    as={WarningIcon}
                                    color="orange.500"
                                    boxSize={3}
                                    cursor="pointer"
                                    onClick={() => handleUnitConversionToggle(component.id)}
                                  />
                                )}
                              </HStack>

                              <Text fontSize="sm" fontFamily="mono" color="gray.600">
                                {formatNumber(component.value)} {component.unit}
                              </Text>

                              {/* GWP Conversion Badge */}
                              {component.gwpConversion && (
                                <Badge size="sm" colorScheme="green">
                                  已轉換至 GWP {component.gwpConversion.gwpVersion}
                                </Badge>
                              )}

                              {/* Unit Warning */}
                              {!check.isCompatible && !component.unitConversion?.convertedValue && (
                                <HStack spacing={1}>
                                  <Icon
                                    as={check.canAutoConvert ? InfoIcon : WarningIcon}
                                    color={check.canAutoConvert ? "blue.500" : "orange.500"}
                                    boxSize={3}
                                  />
                                  <Text fontSize="xs" color={check.canAutoConvert ? "blue.600" : "orange.600"}>
                                    {check.canAutoConvert
                                      ? `單位可自動轉換 (${check.fromDenom} → ${check.toDenom})`
                                      : '單位不一致，請輸入轉換因子'}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>

                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveComponent(component.id)}
                              aria-label="Remove component"
                            />
                          </HStack>

                          <HStack spacing={4} mt={3} align="start">
                            {/* Conversion Ratio (if needed) */}
                            {!check.isCompatible && (
                              <FormControl flex={1}>
                                <FormLabel fontSize="xs" mb={1}>
                                  Conversion ratio <Icon as={InfoIcon} boxSize={2.5} color="gray.500" />
                                </FormLabel>

                                <HStack spacing={2} align="start">
                                  {/* 模式選擇下拉選單 */}
                                  {check.canAutoConvert && (
                                    <Select
                                      size="sm"
                                      value={component.unitConversion?.mode || 'auto'}
                                      onChange={(e) => {
                                        const newMode = e.target.value as 'auto' | 'custom'
                                        handleConversionModeChange(component.id, newMode)
                                      }}
                                      width="90px"
                                    >
                                      <option value="auto">Auto</option>
                                      <option value="custom">Custom</option>
                                    </Select>
                                  )}

                                  {/* 轉換因子輸入框 */}
                                  <Box flex={1}>
                                    <NumberInput
                                      size="sm"
                                      value={component.unitConversion?.conversionFactor ?? ''}
                                      onChange={(valueString, valueNumber) => {
                                        // 只有在 custom 模式下才允許修改
                                        if (component.unitConversion?.mode === 'custom' || !check.canAutoConvert) {
                                          // 情況 1：空字串 - 清除轉換因子
                                          if (valueString === '' || valueString === undefined || valueString === null) {
                                            handleConversionFactorChange(component.id, undefined)
                                            return
                                          }

                                          // 情況 2：有效數字且大於 0
                                          if (!isNaN(valueNumber) && valueNumber > 0) {
                                            handleConversionFactorChange(component.id, valueNumber)
                                            return
                                          }
                                        }
                                      }}
                                      step={0.1}
                                      precision={4}
                                      min={0.0001}
                                      max={1000000}
                                      isDisabled={check.canAutoConvert && component.unitConversion?.mode === 'auto'}
                                    >
                                      <NumberInputField placeholder="輸入因子" />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>

                                    {/* 轉換提示文字 */}
                                    {component.unitConversion?.conversionFactor && (
                                      <HStack spacing={1} mt={1}>
                                        <Icon as={InfoIcon} color="green.500" boxSize={3} />
                                        <Text fontSize="2xs" color="green.600">
                                          Automatically applied conversion ratio: {component.unitConversion.conversionFactor} {check.toDenom} = 1 {check.fromDenom}
                                        </Text>
                                      </HStack>
                                    )}
                                  </Box>
                                </HStack>
                              </FormControl>
                            )}

                            {/* Weight */}
                            <FormControl width="140px">
                              <FormLabel fontSize="xs" mb={1}>Weight</FormLabel>
                              <NumberInput
                                size="sm"
                                min={0}
                                max={isWeightedFormula ? 1 : undefined}
                                step={0.1}
                                value={component.weight}
                                onChange={(_, value) => handleWeightChange(component.id, value)}
                              >
                                <NumberInputField />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                            </FormControl>
                          </HStack>
                        </Box>

                        {/* Separator Button */}
                        {index < components.length - 1 && (
                          <HStack justify="center" my={2}>
                            <IconButton
                              aria-label="Add factor"
                              icon={<AddIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={handleAddComponent}
                            />
                          </HStack>
                        )}
                      </Fragment>
                    )
                  })}
                </VStack>
              ) : (
                <Box
                  p={8}
                  textAlign="center"
                  border="2px dashed"
                  borderColor={validationErrors.components ? "red.300" : "gray.300"}
                  borderRadius="md"
                  color="gray.500"
                >
                  <Text fontSize="sm">尚未加入任何組成係數</Text>
                  <Text fontSize="xs" mt={1}>點擊「新增係數」開始建立組合</Text>
                </Box>
              )}

              {/* 組成係數錯誤訊息 */}
              {validationErrors.components && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  {validationErrors.components}
                </Text>
              )}

            </Box>

            <Divider />

            {/* Weight Statistics */}
            {components.length > 0 && (
              <Box
                border="2px solid"
                borderColor="blue.200"
                borderRadius="md"
                p={4}
              >
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="md" fontWeight="bold" color="gray.700">權重統計</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {totalWeight.toFixed(2)}
                  </Text>
                </HStack>

                <Text fontSize="xs" color="gray.600" mb={2}>
                  公式：Σ(係數值 × 轉換因子 × 權重)/{formulaType === 'weighted' ? 'Σ權重' : '1'}
                </Text>

                <VStack align="stretch" spacing={1} fontSize="xs" color="gray.700">
                  {components.map((comp, idx) => {
                    const value = comp.unitConversion?.convertedValue ?? comp.gwpConversion?.convertedValue ?? comp.value
                    const contribution = value * comp.weight
                    return (
                      <HStack key={idx} justify="space-between">
                        <Text>{comp.name}</Text>
                        <Text fontFamily="mono">
                          {formatNumber(value)}×{comp.weight} = {formatNumber(contribution)}
                        </Text>
                      </HStack>
                    )
                  })}
                </VStack>

                {weightError && (
                  <Alert status="warning" size="sm" borderRadius="md" mt={3}>
                    <AlertIcon />
                    <Text fontSize="xs">
                      權重總和應該等於 1.0，目前為 {totalWeight.toFixed(3)}
                    </Text>
                  </Alert>
                )}
              </Box>
            )}

            {/* Composite Factor Value */}
            {components.length > 0 && (
              <Box
                border="2px solid"
                borderColor="blue.200"
                borderRadius="md"
                p={4}
              >
                <HStack justify="space-between" align="center">
                  <Text fontSize="md" fontWeight="bold" color="gray.700">組合係數值</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600" fontFamily="mono">
                    {formatNumber(computedValue)} {targetUnit}
                  </Text>
                </HStack>
              </Box>
            )}
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
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
            >
              Submit
            </Button>
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