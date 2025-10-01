'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Icon,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react'
import {
  ExternalLinkIcon,
  StarIcon,
  EditIcon,
  TimeIcon,
  InfoIcon,
  UpDownIcon,
  CheckIcon,
} from '@chakra-ui/icons'
import { useState } from 'react'
import { formatNumber, formatDate } from '@/lib/utils'
import EmissionFactorCards from './EmissionFactorCards'

interface FactorDetailProps {
  selectedFactor?: any // 從父組件傳入的選中係數
  onEditFactor?: (updatedFactor: any) => void // 編輯係數回調
  isUserDefinedFactor?: boolean // 是否為自建係數
}

export default function FactorDetail({ 
  selectedFactor, 
  onEditFactor, 
  isUserDefinedFactor = false 
}: FactorDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToast()
  // 根據係數選擇欄位獲取對應的完整係數資料
  const getFactorDetailsBySelection = (factorSelection: string) => {
    // 這裡模擬根據係數選擇名稱獲取完整的係數詳細資料
    // 實際應用中會從 API 根據係數名稱查詢完整資料
    const factorMappings: { [key: string]: any } = {
      '臺灣-天然氣-工業用-2024': {
        id: 101,
        source: '臺灣 - 經濟部能源局 2024',
        name: '臺灣-天然氣-工業用-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 2.0896,
        co2_unit: '公斤 CO₂/Nm³',
        ch4_factor: 0.0000324,
        ch4_unit: '公斤 CH₄/Nm³',
        n2o_factor: 0.0000065,
        n2o_unit: '公斤 N₂O/Nm³',
        value: 2.0896,
        unit: '公斤 CO₂/Nm³',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '經濟部能源局 2024',
        version: '2024.1',
        description: '臺灣工業用天然氣排放係數',
        notes: '數據來源：經濟部能源局，適用於工業用天然氣燃燒排放計算'
      },
      '臺灣-汽油-車用-2024': {
        id: 102,
        source: '臺灣 - 交通部統計處 2024',
        name: '臺灣-汽油-車用-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 2.2637,
        co2_unit: '公斤 CO₂/公升',
        ch4_factor: 0.0000865,
        ch4_unit: '公斤 CH₄/公升',
        n2o_factor: 0.0000173,
        n2o_unit: '公斤 N₂O/公升',
        value: 2.2637,
        unit: '公斤 CO₂/公升',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '交通部統計處 2024',
        version: '2024.1',
        description: '臺灣車用汽油排放係數',
        notes: '數據來源：交通部統計處，適用於一般汽油車輛排放計算'
      },
      '臺灣電力-2024': {
        id: 103,
        source: '臺灣 - 台灣電力公司 2024',
        name: '臺灣電力-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 0.502,
        co2_unit: '公斤 CO₂/kWh',
        ch4_factor: 0.0000084,
        ch4_unit: '公斤 CH₄/kWh',
        n2o_factor: 0.0000017,
        n2o_unit: '公斤 N₂O/kWh',
        value: 0.502,
        unit: '公斤 CO₂/kWh',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '台灣電力公司 2024',
        version: '2024.2',
        description: '臺灣電網排放係數',
        notes: '數據來源：台灣電力公司，為臺灣電網平均排放係數'
      },
      '貨運-陸運-柴油卡車-2024': {
        id: 104,
        source: '臺灣 - 交通部運輸研究所 2024',
        name: '貨運-陸運-柴油卡車-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 0.0712,
        co2_unit: '公斤 CO₂/tkm',
        ch4_factor: 0.0000028,
        ch4_unit: '公斤 CH₄/tkm',
        n2o_factor: 0.0000006,
        n2o_unit: '公斤 N₂O/tkm',
        value: 0.0712,
        unit: '公斤 CO₂/tkm',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '交通部運輸研究所 2024',
        version: '2024.1',
        description: '臺灣柴油卡車貨運排放係數',
        notes: '數據來源：交通部運輸研究所，適用於柴油卡車貨運排放計算'
      },
      '大眾運輸-捷運-2024': {
        id: 105,
        source: '臺灣 - 台北捷運公司 2024',
        name: '大眾運輸-捷運-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '台北',
        co2_factor: 0.0187,
        co2_unit: '公斤 CO₂/人·km',
        ch4_factor: 0.0000003,
        ch4_unit: '公斤 CH₄/人·km',
        n2o_factor: 0.0000001,
        n2o_unit: '公斤 N₂O/人·km',
        value: 0.0187,
        unit: '公斤 CO₂/人·km',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '台北捷運公司 2024',
        version: '2024.1',
        description: '臺灣捷運系統排放係數',
        notes: '數據來源：台北捷運公司，適用於捷運系統乘客運輸排放計算'
      },
      '化工製程-有機溶劑-2024': {
        id: 106,
        source: '臺灣 - 環保署 2024',
        name: '化工製程-有機溶劑-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 1.8765,
        co2_unit: '公斤 CO₂/噸',
        ch4_factor: 0.0145,
        ch4_unit: '公斤 CH₄/噸',
        n2o_factor: 0.0023,
        n2o_unit: '公斤 N₂O/噸',
        value: 1.8765,
        unit: '公斤 CO₂/噸',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '環保署 2024',
        version: '2024.1',
        description: '臺灣化工製程有機溶劑排放係數',
        notes: '數據來源：環保署，適用於有機溶劑使用的化工製程排放計算'
      },
      // 產品碳足跡相關係數
      '鋁合金-初級生產-2024 v2.1': {
        id: 107,
        source: '國際鋁業協會 - IAI 2024',
        name: '鋁合金-初級生產-2024',
        effective_date: '2024-01-01',
        continent: '全球',
        country: '國際',
        region: '',
        co2_factor: 11.45,
        co2_unit: '公斤 CO₂/公斤',
        ch4_factor: 0.0234,
        ch4_unit: '公斤 CH₄/公斤',
        n2o_factor: 0.0045,
        n2o_unit: '公斤 N₂O/公斤',
        value: 11.45,
        unit: '公斤 CO₂/公斤',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '國際鋁業協會 2024',
        version: '2.1',
        description: '鋁合金初級生產排放係數',
        notes: '包含鋁土礦開採、氧化鋁精煉、電解鋁生產等完整生產鏈排放'
      },
      'ABS塑膠-石化原料-2024 v1.3': {
        id: 108,
        source: '歐洲塑膠協會 - PlasticsEurope 2024',
        name: 'ABS塑膠-石化原料-2024',
        effective_date: '2024-01-01',
        continent: '歐洲',
        country: '歐盟',
        region: '',
        co2_factor: 3.2,
        co2_unit: '公斤 CO₂/公斤',
        ch4_factor: 0.0089,
        ch4_unit: '公斤 CH₄/公斤',
        n2o_factor: 0.0012,
        n2o_unit: '公斤 N₂O/公斤',
        value: 3.2,
        unit: '公斤 CO₂/公斤',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '歐洲塑膠協會 2024',
        version: '1.3',
        description: 'ABS塑膠原料生產排放係數',
        notes: '包含石化原料提煉、聚合反應等ABS塑膠生產過程排放'
      },
      '電子元件-混合-2024 v1.0': {
        id: 109,
        source: '國際電子工業協會 - IEC 2024',
        name: '電子元件-混合-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '中國',
        region: '',
        co2_factor: 25.6,
        co2_unit: '公斤 CO₂/公斤',
        ch4_factor: 0.056,
        ch4_unit: '公斤 CH₄/公斤',
        n2o_factor: 0.0087,
        n2o_unit: '公斤 N₂O/公斤',
        value: 25.6,
        unit: '公斤 CO₂/公斤',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '國際電子工業協會 2024',
        version: '1.0',
        description: '混合電子元件生產排放係數',
        notes: '包含半導體製造、封裝測試等電子元件完整生產鏈排放'
      },
      '臺灣電力-工業用-2024 v2.2': {
        id: 110,
        source: '臺灣 - 台灣電力公司 2024',
        name: '臺灣電力-工業用-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 0.509,
        co2_unit: '公斤 CO₂/kWh',
        ch4_factor: 0.0000085,
        ch4_unit: '公斤 CH₄/kWh',
        n2o_factor: 0.0000017,
        n2o_unit: '公斤 N₂O/kWh',
        value: 0.509,
        unit: '公斤 CO₂/kWh',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '台灣電力公司 2024',
        version: '2.2',
        description: '臺灣工業用電網排放係數',
        notes: '數據來源：台灣電力公司，適用於工業用電排放計算'
      },
      '工業溶劑-有機化合物-2024 v1.5': {
        id: 111,
        source: '臺灣 - 環保署 2024',
        name: '工業溶劑-有機化合物-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 2.45,
        co2_unit: '公斤 CO₂/公升',
        ch4_factor: 0.0078,
        ch4_unit: '公斤 CH₄/公升',
        n2o_factor: 0.0012,
        n2o_unit: '公斤 N₂O/公升',
        value: 2.45,
        unit: '公斤 CO₂/公升',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '環保署 2024',
        version: '1.5',
        description: '工業有機溶劑排放係數',
        notes: '適用於表面處理等工業溶劑使用過程排放計算'
      },
      '貨運-陸運-柴油卡車-2024 v1.8': {
        id: 112,
        source: '臺灣 - 交通部運輸研究所 2024',
        name: '貨運-陸運-柴油卡車-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 0.0712,
        co2_unit: '公斤 CO₂/tkm',
        ch4_factor: 0.0000028,
        ch4_unit: '公斤 CH₄/tkm',
        n2o_factor: 0.0000006,
        n2o_unit: '公斤 N₂O/tkm',
        value: 0.0712,
        unit: '公斤 CO₂/tkm',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '交通部運輸研究所 2024',
        version: '1.8',
        description: '柴油卡車貨運排放係數',
        notes: '適用於中長程柴油卡車貨運運輸排放計算'
      },
      '電動車-商用貨車-2024 v1.2': {
        id: 113,
        source: '臺灣 - 工研院 2024',
        name: '電動車-商用貨車-2024',
        effective_date: '2024-01-01',
        continent: '亞洲',
        country: '臺灣',
        region: '',
        co2_factor: 0.035,
        co2_unit: '公斤 CO₂/tkm',
        ch4_factor: 0.0000001,
        ch4_unit: '公斤 CH₄/tkm',
        n2o_factor: 0.00000005,
        n2o_unit: '公斤 N₂O/tkm',
        value: 0.035,
        unit: '公斤 CO₂/tkm',
        year: 2024,
        method_gwp: 'GWP100',
        source_type: 'standard',
        source_ref: '工研院 2024',
        version: '1.2',
        description: '電動商用貨車排放係數',
        notes: '考慮電網排放間接影響的電動貨車運輸排放係數'
      }
    }
    
    return factorMappings[factorSelection] || null
  }

  // 資料轉換函數：處理不同類型的選中項目
  const transformSelectedData = (selected: any) => {
    if (!selected) return null

    // 如果是一般排放係數資料（從 FactorTable mockData）
    if (selected.type === 'emission_factor' || selected.type === 'composite_factor') {
      return selected.data || selected
    }
    
    // 如果是產品碳足跡資料（ProductCarbonFootprintItem）
    if (selected.data && selected.data.type === 'product_carbon_footprint') {
      // 優先使用已經查找到的係數資料
      if (selected.data.emission_factor) {
        return {
          ...selected.data.emission_factor,
          product_context: {
            stage: selected.data.stage,
            item_name: selected.data.item_name,
            quantity_spec: selected.data.quantity_spec,
            additional_info: selected.data.additional_info,
            error_level: selected.data.error_level,
            product_name: selected.data.product_name
          }
        }
      }

      // 後備方案：根據係數選擇獲取完整的係數詳細資料
      const factorDetails = getFactorDetailsBySelection(selected.data.factor_selection)

      if (factorDetails) {
        return {
          ...factorDetails,
          product_context: {
            stage: selected.data.stage,
            item_name: selected.data.item_name,
            quantity_spec: selected.data.quantity_spec,
            additional_info: selected.data.additional_info,
            error_level: selected.data.error_level,
            product_name: selected.data.product_name
          }
        }
      } else {
        // 如果找不到對應的係數詳細資料，返回基本資訊
        return {
          id: selected.id,
          source: `產品碳足跡 - ${selected.data.stage}階段`,
          name: selected.data.factor_selection,
          effective_date: '2024-01-01',
          continent: '未知',
          country: '未知',
          region: '',
          co2_factor: 0,
          co2_unit: 'kg CO₂/單位',
          ch4_factor: 0,
          ch4_unit: 'kg CH₄/單位',
          n2o_factor: 0,
          n2o_unit: 'kg N₂O/單位',
          value: 0,
          unit: 'kg CO₂/單位',
          year: selected.data.year || 2024,
          method_gwp: 'GWP100',
          source_type: 'product_carbon_footprint',
          source_ref: selected.data.factor_selection,
          version: '1.0',
          description: `${selected.data.stage}階段 - ${selected.data.item_name}`,
          notes: `此係數詳細資料尚未找到對應。項目：${selected.data.item_name}，補充資訊：${selected.data.additional_info}，誤差等級：${selected.data.error_level}`,
          created_at: '2024-01-01T08:00:00Z',
          updated_at: '2024-01-01T10:30:00Z',
          product_context: {
            stage: selected.data.stage,
            item_name: selected.data.item_name,
            quantity_spec: selected.data.quantity_spec,
            additional_info: selected.data.additional_info,
            error_level: selected.data.error_level,
            product_name: selected.data.product_name
          }
        }
      }
    }
    
    // 如果是組織溫盤資料（OrganizationalInventoryItem）
    if (selected.data && selected.data.type === 'organizational_inventory') {
      // 優先使用已經查找到的係數資料
      if (selected.data.emission_factor) {
        return {
          ...selected.data.emission_factor,
          organizational_context: {
            scope: selected.data.scope,
            emission_source_category: selected.data.emission_source_category,
            emission_source_name: selected.data.emission_source_name,
            activity_data: selected.data.activity_data,
            activity_data_unit: selected.data.activity_data_unit,
            error_level: selected.data.error_level,
            year: selected.data.year
          }
        }
      }

      // 後備方案：根據係數選擇獲取完整的係數詳細資料
      const factorDetails = getFactorDetailsBySelection(selected.data.factor_selection)

      if (factorDetails) {
        return {
          ...factorDetails,
          organizational_context: {
            scope: selected.data.scope,
            emission_source_category: selected.data.emission_source_category,
            emission_source_name: selected.data.emission_source_name,
            activity_data: selected.data.activity_data,
            activity_data_unit: selected.data.activity_data_unit,
            error_level: selected.data.error_level,
            year: selected.data.year
          }
        }
      } else {
        // 如果找不到對應的係數詳細資料，返回基本資訊
        return {
          id: selected.id,
          source: `組織溫盤 - ${selected.data.scope}`,
          name: selected.data.factor_selection,
          effective_date: '2024-01-01',
          continent: '未知',
          country: '未知',
          region: '',
          co2_factor: 0,
          co2_unit: 'kg CO₂/單位',
          ch4_factor: 0,
          ch4_unit: 'kg CH₄/單位',
          n2o_factor: 0,
          n2o_unit: 'kg N₂O/單位',
          value: 0, // 改為顯示係數值而非活動數據
          unit: 'kg CO₂/單位',
          year: selected.data.year || 2024,
          method_gwp: 'GWP100',
          source_type: 'organizational_inventory',
          source_ref: selected.data.factor_selection,
          version: selected.data.version || '1.0',
          description: `${selected.data.emission_source_category} - ${selected.data.emission_source_name}`,
          notes: `此係數詳細資料尚未找到對應。排放源類別：${selected.data.emission_source_category}，誤差等級：${selected.data.error_level}`,
          created_at: '2024-01-01T08:00:00Z',
          updated_at: '2024-01-01T10:30:00Z',
          organizational_context: {
            scope: selected.data.scope,
            emission_source_category: selected.data.emission_source_category,
            emission_source_name: selected.data.emission_source_name,
            activity_data: selected.data.activity_data,
            activity_data_unit: selected.data.activity_data_unit,
            error_level: selected.data.error_level,
            year: selected.data.year
          }
        }
      }
    }

    return selected
  }

  const processedFactor = transformSelectedData(selectedFactor)
  
  // 處理開始編輯
  const handleStartEdit = () => {
    if (processedFactor) {
      setEditForm({
        name: processedFactor.name || '',
        description: processedFactor.description || '',
        notes: processedFactor.notes || ''
      })
      setIsEditing(true)
    }
  }

  // 處理取消編輯
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({ name: '', description: '', notes: '' })
  }

  // 處理保存編輯
  const handleSaveEdit = async () => {
    if (!processedFactor || !onEditFactor) return
    
    try {
      setIsSaving(true)
      
      // 模擬保存 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedFactor = {
        ...processedFactor,
        name: editForm.name,
        description: editForm.description,
        notes: editForm.notes,
        updated_at: new Date().toISOString()
      }
      
      onEditFactor(updatedFactor)
      setIsEditing(false)
      
      toast({
        title: '編輯成功',
        description: '係數資訊已更新',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: '編輯失敗',
        description: '請稍後重試',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Mock data based on the provided images (作為後備資料)
  const mockFactor = processedFactor || {
    id: 1,
    source: '英國 - GHG Emission Factors Hub 2024',
    name: '英國-石油產品-Distillate Fuel Oil No. 1',
    effective_date: '2024-01-01',
    continent: '北美洲',
    country: '英國',
    region: '',
    co2_factor: 3.0209492544,
    co2_unit: '公斤 CO₂/公升',
    ch4_factor: 0.0001256040,
    ch4_unit: '公斤 CH₄/公升',
    n2o_factor: 0.0000251208,
    n2o_unit: '公斤 N₂O/公升',
    // 向後相容欄位
    value: 3.0209492544,
    unit: '公斤 CO₂/公升',
    year: 2024,
    method_gwp: 'GWP100',
    source_type: 'standard' as const,
    source_ref: 'GHG Emission Factors Hub 2024',
    version: '2024.1',
    description: '英國石油產品蒸餾燃料油No.1的排放係數',
    notes: 'The units of the CH4 and N2O factors originally published were in grams. In order to be consistent with the units of the CO2 factor, the units have been converted. CH4 Factor (g CH4 per gallon):0.42, N2O Factor (g N2O per gallon):0.08 Distillate Fuel No. 1 has a maximum distillation temperature of 550 °F at the 90 percent recovery point and a minimum flash point of 100 °F and includes fuels commonly known as Diesel Fuel No. 1 and Fuel Oil No. 1, but excludes kerosene. United States Environmental Protection Agency-EPA Center for Corporate Climate Leadership announced 2024 GHG Emission Factors Hub',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T10:30:00Z',
  }

  const mockVersions = [
    { version: '2.1', date: '2024-01-15', isCurrent: true, hasUpdate: false },
    { version: '2.0', date: '2023-12-01', isCurrent: false, hasUpdate: false },
    { version: '1.9', date: '2023-06-15', isCurrent: false, hasUpdate: false },
  ]

  const mockCompositeComponents = mockFactor.type === 'composite_factor' ? [
    { id: 1, name: '鋼材原料', weight: 0.6, value: 1.85, unit: 'kg CO2e/kg' },
    { id: 2, name: '加工電力', weight: 0.3, value: 0.509, unit: 'kg CO2e/kWh' },
    { id: 3, name: '運輸排放', weight: 0.1, value: 0.156, unit: 'kg CO2e/km' },
  ] : null

  const getSourceTypeBadge = (sourceType: string) => {
    const configs = {
      standard: { label: '標準資料庫', colorScheme: 'blue' },
      pact: { label: 'PACT交換', colorScheme: 'green' },
      supplier: { label: '供應商係數', colorScheme: 'purple' },
      user_defined: { label: '自建係數', colorScheme: 'orange' },
    }
    
    const config = configs[sourceType as keyof typeof configs] || { label: '未知', colorScheme: 'gray' }
    return (
      <Badge colorScheme={config.colorScheme} size="lg">
        {config.label}
      </Badge>
    )
  }

  if (!selectedFactor && !mockFactor) {
    return (
      <Box p={6} textAlign="center" color="gray.500">
        <InfoIcon boxSize={12} mb={4} />
        <Text fontSize="lg" fontWeight="medium" mb={2}>
          選擇一個係數
        </Text>
        <Text fontSize="sm">
          點擊左側列表中的係數查看詳細資訊
        </Text>
      </Box>
    )
  }

  return (
    <Box h="100%" overflow="auto">
      <VStack spacing={6} p={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={3} flex="1">
              {isEditing ? (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                    係數名稱
                  </FormLabel>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    size="sm"
                    borderRadius="md"
                  />
                </FormControl>
              ) : (
                <>
                  <HStack spacing={2}>
                    <Heading size="lg" color="gray.800" lineHeight="1.3">
                      {mockFactor.name}
                    </Heading>
                    {isEditing && (
                      <Badge colorScheme="blue" variant="subtle" size="sm">
                        編輯模式
                      </Badge>
                    )}
                  </HStack>
                  <HStack spacing={3}>
                    {getSourceTypeBadge(mockFactor.source_type)}
                    {mockFactor.type === 'composite_factor' && (
                      <Badge colorScheme="orange" variant="outline" size="md">
                        組合係數
                      </Badge>
                    )}
                  </HStack>
                </>
              )}
            </VStack>
            
            <VStack spacing={2}>
              {isUserDefinedFactor && !isEditing && (
                <Button 
                  leftIcon={<EditIcon />} 
                  size="sm" 
                  variant="outline" 
                  colorScheme="blue"
                  borderRadius="lg"
                  onClick={handleStartEdit}
                >
                  編輯
                </Button>
              )}
              
              {isEditing && (
                <>
                  <Button 
                    leftIcon={<CheckIcon />} 
                    size="sm" 
                    colorScheme="green"
                    borderRadius="lg"
                    onClick={handleSaveEdit}
                    isLoading={isSaving}
                    loadingText="儲存中..."
                  >
                    儲存
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    borderRadius="lg"
                    onClick={handleCancelEdit}
                  >
                    取消
                  </Button>
                </>
              )}
              
              {!isUserDefinedFactor && (
                <Button 
                  leftIcon={<StarIcon />} 
                  size="sm" 
                  variant="outline" 
                  colorScheme="yellow"
                  borderRadius="lg"
                >
                  收藏
                </Button>
              )}
            </VStack>
          </HStack>
          
          {/* New version alert */}
          <Alert status="info" borderRadius="lg" mb={6} bg="blue.50" border="1px solid" borderColor="blue.200">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm" color="blue.800">新版本可用！</AlertTitle>
              <AlertDescription fontSize="sm" color="blue.700" mt={1}>
                有較新的 v2.2 版本可供升級
              </AlertDescription>
            </Box>
            <Button size="xs" colorScheme="blue" variant="solid" borderRadius="md">
              升級並替換
            </Button>
          </Alert>
        </Box>

        {/* 係數資訊區塊 */}
        <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <CardHeader pb={3}>
            <Heading size="md" color="gray.800">係數資訊</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                  係數來源
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="medium" lineHeight="1.5">
                  {mockFactor.source}
                </Text>
              </Box>
              
              {isEditing ? (
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    描述
                  </FormLabel>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    size="sm"
                    borderRadius="md"
                    placeholder="輸入係數描述..."
                    rows={3}
                  />
                </FormControl>
              ) : (
                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    係數名稱
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium" lineHeight="1.5">
                    {mockFactor.name}
                  </Text>
                </Box>
              )}
              
              <HStack spacing={6}>
                <Box flex="1">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    啟用日期
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {mockFactor.effective_date}
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    大洲
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {mockFactor.continent}
                  </Text>
                </Box>
              </HStack>
              
              <HStack spacing={6}>
                <Box flex="1">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    國家
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {mockFactor.country}
                  </Text>
                </Box>
                {mockFactor.region && (
                  <Box flex="1">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider" mb={2}>
                      地區
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="medium">
                      {mockFactor.region}
                    </Text>
                  </Box>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 排放係數卡片區塊 */}
        <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <CardBody p={6}>
            <EmissionFactorCards
              co2_factor={mockFactor.co2_factor}
              co2_unit={mockFactor.co2_unit}
              ch4_factor={mockFactor.ch4_factor}
              ch4_unit={mockFactor.ch4_unit}
              n2o_factor={mockFactor.n2o_factor}
              n2o_unit={mockFactor.n2o_unit}
            />
          </CardBody>
        </Card>

        {/* 備註區塊 */}
        {(mockFactor.notes || isEditing) && (
          <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <CardHeader pb={3}>
              <Heading size="md" color="gray.800">備註</Heading>
            </CardHeader>
            <CardBody pt={0}>
              {isEditing ? (
                <FormControl>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    size="sm"
                    borderRadius="md"
                    placeholder="輸入備註資訊..."
                    rows={4}
                  />
                </FormControl>
              ) : (
                <Text fontSize="sm" color="gray.700" lineHeight="1.6" letterSpacing="0.3px">
                  {mockFactor.notes}
                </Text>
              )}
            </CardBody>
          </Card>
        )}

        {/* Composite Components (if applicable) */}
        {mockCompositeComponents && (
          <Card>
            <CardHeader pb={2}>
              <Heading size="sm">組合係數組成</Heading>
            </CardHeader>
            <CardBody pt={2}>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>組成係數</Th>
                    <Th isNumeric>權重</Th>
                    <Th isNumeric>值</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockCompositeComponents.map((component) => (
                    <Tr key={component.id}>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {component.name}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="sm">{component.weight}</Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="sm" fontFamily="mono">
                          {formatNumber(component.value)} {component.unit}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">計算結果：</Text>
                  <Text fontSize="md" fontWeight="bold" fontFamily="mono">
                    {formatNumber(mockFactor.value)} {mockFactor.unit}
                  </Text>
                </HStack>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Version History */}
        <Card>
          <CardHeader pb={2}>
            <HStack justify="space-between">
              <Heading size="sm">版本歷史</Heading>
              <Button size="xs" variant="ghost" leftIcon={<UpDownIcon />}>
                檢查更新
              </Button>
            </HStack>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={2} align="stretch">
              {mockVersions.map((version, index) => (
                <HStack key={version.version} justify="space-between" p={2} 
                       bg={version.isCurrent ? 'blue.50' : 'transparent'} 
                       borderRadius="md">
                  <HStack>
                    <Icon as={version.isCurrent ? CheckIcon : TimeIcon} 
                          color={version.isCurrent ? 'green.500' : 'gray.400'} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight={version.isCurrent ? 'medium' : 'normal'}>
                        v{version.version}
                        {version.isCurrent && (
                          <Tag size="sm" colorScheme="blue" ml={2}>
                            <TagLabel>目前使用</TagLabel>
                          </Tag>
                        )}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(version.date)}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {!version.isCurrent && (
                    <Button size="xs" variant="outline">
                      切換
                    </Button>
                  )}
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Actions */}
        <VStack spacing={3}>
          <Button colorScheme="brand" size="sm" leftIcon={<EditIcon />} w="100%">
            引用到專案
          </Button>
          <Button variant="outline" size="sm" leftIcon={<EditIcon />} w="100%">
            加入組合係數
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}