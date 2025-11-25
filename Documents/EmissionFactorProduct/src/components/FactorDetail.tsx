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
  Tbody,
  Tr,
  Td,
  Icon,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import {
  TimeIcon,
  InfoIcon,
  CheckIcon,
} from '@chakra-ui/icons'
import { formatNumber, formatDate } from '@/lib/utils'
import { getSyncStatus } from '@/hooks/useMockData'

// ISIC 分類格式化
const formatISICCode = (code: string): string => {
  const names: { [key: string]: string } = {
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
  return names[code] || code
}

// 生命週期階段格式化
const formatLifecycleStages = (stages: string[]): string => {
  const names: { [key: string]: string } = {
    'raw_material_acquisition': '原料取得階段',
    'production': '製造階段',
    'distribution': '配送銷售階段',
    'product_use': '使用階段',
    'end_of_life': '廢棄處理階段',
  }
  return stages.map(s => names[s] || s).join(' + ')
}

// 數據品質格式化
const formatDataQuality = (quality: string): string => {
  return quality === 'Primary'
    ? 'Primary（第一級 - 實際量測數據）'
    : 'Secondary（第二級 - 次級資料庫）'
}

// 彙整組合係數的所有組成係數來源
const getComponentSources = (components: any[]): string => {
  if (!components || components.length === 0) {
    return '無組成係數來源資訊'
  }

  const sources = components
    .map(comp => {
      // 優先使用 emission_factor.source，其次使用 source_ref
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

// 格式化引用專案資訊
const getReferencedProjects = (usageInfo?: any): string => {
  // 檢查是否有 usage_info
  if (!usageInfo) {
    return '未被引用'
  }

  const { project_references } = usageInfo

  // 沒有引用專案
  if (!project_references || project_references.length === 0) {
    return '未被引用'
  }

  // 有引用專案：顯示專案名稱
  const projectNames = project_references.map((ref: any) => ref.project_name)

  if (projectNames.length === 1) {
    return projectNames[0]
  }

  // 多個專案時，用頓號分隔
  return projectNames.join('、')
}

interface FactorDetailProps {
  selectedFactor?: any // 從父組件傳入的選中係數
  onEditFactor?: (updatedFactor: any) => void // 編輯係數回調
  onEditComposite?: (factor: any) => void // 編輯組合係數回調
  onEditCustomFactor?: (factor: any) => void // 編輯自訂係數回調
  onBlockEdit?: (factor: any) => void // 阻止編輯已匯入係數的回調
  isUserDefinedFactor?: boolean // 是否為自建係數
  isCentralLibrary?: boolean // 是否為中央係數庫
  onRemoveFromCentral?: (factor: any) => void // 從中央庫移除回調
  onImportToCentral?: (factor: any) => void // 匯入中央庫回調（自建組合係數用）
  onAddStandardToCentral?: (factor: any) => void // 加入中央庫回調（希達係數用）
}

export default function FactorDetail({
  selectedFactor,
  onEditFactor,
  onEditComposite,
  onEditCustomFactor,
  onBlockEdit,
  isUserDefinedFactor = false,
  isCentralLibrary = false,
  onRemoveFromCentral,
  onImportToCentral,
  onAddStandardToCentral
}: FactorDetailProps) {
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
      // 保留頂層的關鍵欄位（id, source_composite_id），用於從中央庫移除操作
      const baseData = selected.data || selected
      return {
        ...baseData,
        // 保留頂層的 id（中央庫係數的 ID），如果不同於 data.id 的話
        id: selected.id || baseData.id,
        // 保留頂層的 source_composite_id（自建係數的原始 ID）
        source_composite_id: selected.source_composite_id || baseData.source_composite_id,
        // 保留頂層的完整排放係數資訊（優先使用頂層，因為是從 FactorTable 映射的最新資料）
        co2_factor: selected.co2_factor !== undefined ? selected.co2_factor : baseData.co2_factor,
        ch4_factor: selected.ch4_factor !== undefined ? selected.ch4_factor : baseData.ch4_factor,
        n2o_factor: selected.n2o_factor !== undefined ? selected.n2o_factor : baseData.n2o_factor,
        co2_unit: selected.co2_unit || baseData.co2_unit,
        ch4_unit: selected.ch4_unit || baseData.ch4_unit,
        n2o_unit: selected.n2o_unit || baseData.n2o_unit,
        // 保留頂層的來源和地理資訊
        source: selected.source || baseData.source,
        effective_date: selected.effective_date || baseData.effective_date,
        continent: selected.continent || baseData.continent,
        country: selected.country || baseData.country,
      }
    }

    // 如果是自訂係數資料
    if (selected.type === 'custom_factor') {
      // selected.data 可能包含巢狀的 data 屬性
      // 需要找到實際的 CustomFactor 資料（包含 source, effective_date, co2_factor 等）
      let customData = selected.data

      // 如果 customData.data 存在且包含 source，則實際資料在 customData.data 裡
      if (customData?.data && customData.data.source !== undefined) {
        customData = customData.data
      }

      console.log('[transformSelectedData] custom_factor - 最終 customData:', customData)

      if (!customData || !customData.source) {
        console.error('[transformSelectedData] customData is invalid for custom_factor')
        // 嘗試直接從 selected 提取資料（備援方案）
        return {
          ...selected,
          type: 'custom_factor',
          source: selected.source_ref || selected.source || '-',
          effective_date: selected.effective_date || '-',
          continent: '-',
          country: '-',
        }
      }

      return {
        ...customData,
        // 確保所有必要欄位都存在
        id: customData.id,
        type: 'custom_factor', // 明確設定 type
        name: customData.name,
        source: customData.source,
        effective_date: customData.effective_date,
        continent: '-', // 自訂係數沒有 continent
        country: '-',   // 自訂係數沒有 country
        region: customData.region, // 保留 region（Area 欄位需要）
        // 保留所有 GHG 資料
        co2_factor: customData.co2_factor,
        co2_unit: customData.co2_unit,
        ch4_factor: customData.ch4_factor,
        ch4_unit: customData.ch4_unit,
        n2o_factor: customData.n2o_factor,
        n2o_unit: customData.n2o_unit,
        hfcs_factor: customData.hfcs_factor,
        hfcs_unit: customData.hfcs_unit,
        pfcs_factor: customData.pfcs_factor,
        pfcs_unit: customData.pfcs_unit,
        sf6_factor: customData.sf6_factor,
        sf6_unit: customData.sf6_unit,
        nf3_factor: customData.nf3_factor,
        nf3_unit: customData.nf3_unit,
      }
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

  // 版本歷史資料：優先使用真實資料，否則使用 mock 資料
  const versionHistory = mockFactor.version_history || [
    { version: mockFactor.version || '2.1', date: mockFactor.updated_at || '2024-01-15', isCurrent: true, changes: '目前版本' },
  ]

  const mockVersions = versionHistory.map((entry: any) => ({
    version: entry.version,
    date: entry.date,
    isCurrent: entry.isCurrent,
    hasUpdate: false,
    changes: entry.changes
  }))

  // 組合係數的組成資料 - 優先使用實際資料，否則使用 mock 資料
  const mockCompositeComponents = mockFactor.type === 'composite_factor'
    ? (mockFactor.components || [
        {
          id: 1,
          name: '鋼材原料',
          weight: 0.6,
          originalValue: 1.85,
          originalUnit: 'kg CO2e/kg',
          gwpConversion: {
            gwpVersion: 'AR5' as const,
            originalCO2: 1.82,
            originalCH4: 0.02,
            originalN2O: 0.01,
            convertedValue: 2.38,
            breakdown: {
              co2_contribution: 1.82,
              ch4_contribution: 0.56,
              n2o_contribution: 0
            }
          },
          unitConversion: null
        },
        {
          id: 2,
          name: '加工電力',
          weight: 0.3,
          originalValue: 0.509,
          originalUnit: 'kg CO2e/kWh',
          gwpConversion: null,
          unitConversion: {
            mode: 'auto' as const,
            fromUnit: 'kg CO2e/kWh',
            toUnit: 'kg CO2e/MJ',
            canAutoConvert: true,
            conversionFactor: 3.6,
            convertedValue: 1.832
          }
        },
        {
          id: 3,
          name: '運輸排放',
          weight: 0.1,
          originalValue: 0.156,
          originalUnit: 'kg CO2e/km',
          gwpConversion: null,
          unitConversion: null
        },
      ])
    : null

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
        {/* Header - 簡化版 */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Heading size="lg" color="gray.800">
              {mockFactor.name}
            </Heading>
            <Badge
              colorScheme={mockFactor.source_type === 'user_defined' ? 'purple' : 'yellow'}
              fontSize="sm"
              px={3}
              py={1}
            >
              {mockFactor.source_type === 'user_defined' ? 'Custom' : 'Secondary'}
            </Badge>
          </HStack>

          {/* 新版本通知區塊 */}
          <Box bg="gray.100" p={4} borderRadius="md" textAlign="center" mb={6}>
            <Text fontSize="sm" color="gray.700">
              新版本通知(not this time)
            </Text>
          </Box>
        </Box>

        {/* Factor Information */}
        <Box>
          <Text fontSize="md" fontWeight="bold" color="blue.600" mb={3}>
            Factor Information
          </Text>

          <Table variant="simple" size="sm">
            <Tbody>
              <Tr>
                <Td width="40%" bg="gray.50" fontWeight="medium">Source of Emission Factor</Td>
                <Td>
                  {mockFactor.type === 'composite_factor' && mockCompositeComponents
                    ? getComponentSources(mockCompositeComponents)
                    : mockFactor.source
                  }
                </Td>
              </Tr>
              <Tr>
                <Td bg="gray.50" fontWeight="medium">Enabled Date</Td>
                <Td>{mockFactor.effective_date}</Td>
              </Tr>
              <Tr>
                <Td bg="gray.50" fontWeight="medium">Continent</Td>
                <Td>{mockFactor.continent}</Td>
              </Tr>
              <Tr>
                <Td bg="gray.50" fontWeight="medium">Country</Td>
                <Td>{mockFactor.country || '-'}</Td>
              </Tr>
              <Tr>
                <Td bg="gray.50" fontWeight="medium">Area</Td>
                <Td>{mockFactor.region || '台灣'}</Td>
              </Tr>
              {mockFactor.type === 'composite_factor' && (
                <Tr>
                  <Td bg="gray.50" fontWeight="medium">引用專案</Td>
                  <Td>
                    <Text fontSize="sm" color={mockFactor.usage_info ? "gray.700" : "gray.500"}>
                      {getReferencedProjects(mockFactor.usage_info)}
                    </Text>
                  </Td>
                </Tr>
              )}
              <Tr>
                <Td bg="gray.50" fontWeight="medium" verticalAlign="top">Emission Factor</Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    {mockFactor.co2_factor !== undefined && mockFactor.co2_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">CO₂</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.co2_factor)} {mockFactor.co2_unit || 'kg CO₂'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.ch4_factor !== undefined && mockFactor.ch4_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">CH₄</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.ch4_factor)} {mockFactor.ch4_unit || 'kg CH₄'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.n2o_factor !== undefined && mockFactor.n2o_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">N₂O</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.n2o_factor)} {mockFactor.n2o_unit || 'kg N₂O'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.hfcs_factor !== undefined && mockFactor.hfcs_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">HFCs</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.hfcs_factor)} {mockFactor.hfcs_unit || 'kg HFCs'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.pfcs_factor !== undefined && mockFactor.pfcs_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">PFCs</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.pfcs_factor)} {mockFactor.pfcs_unit || 'kg PFCs'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.sf6_factor !== undefined && mockFactor.sf6_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">SF₆</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.sf6_factor)} {mockFactor.sf6_unit || 'kg SF₆'}
                        </Text>
                      </HStack>
                    )}
                    {mockFactor.nf3_factor !== undefined && mockFactor.nf3_factor !== null && (
                      <HStack>
                        <Badge colorScheme="blue">NF₃</Badge>
                        <Text fontSize="sm">
                          {formatNumber(mockFactor.nf3_factor)} {mockFactor.nf3_unit || 'kg NF₃'}
                        </Text>
                      </HStack>
                    )}
                    {(!mockFactor.co2_factor && !mockFactor.ch4_factor && !mockFactor.n2o_factor &&
                      !mockFactor.hfcs_factor && !mockFactor.pfcs_factor && !mockFactor.sf6_factor && !mockFactor.nf3_factor) && (
                      <Text fontSize="sm" color="gray.500">
                        無詳細排放係數資料
                      </Text>
                    )}
                  </VStack>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Component Factors - 僅組合係數顯示 */}
        {mockFactor.type === 'composite_factor' && mockFactor.formula_type && (
          <Box>
            <Text fontSize="md" fontWeight="bold" color="blue.600" mb={3}>
              Component Factors
            </Text>

            <Table variant="simple" size="sm" mb={4}>
              <Tbody>
                <Tr>
                  <Td width="40%" bg="gray.50" fontWeight="medium">Calculation Method</Td>
                  <Td>{mockFactor.formula_type === 'weighted' ? 'Weighted Average' : 'Weighted Sum'}</Td>
                </Tr>
                <Tr>
                  <Td bg="gray.50" fontWeight="medium">Target Unit</Td>
                  <Td fontFamily="mono">{mockFactor.unit}</Td>
                </Tr>
              </Tbody>
            </Table>

            {mockCompositeComponents && mockCompositeComponents.length > 0 && (
              <Box border="1px solid" borderColor="blue.200" borderRadius="md" p={4}>
                <Text fontSize="sm" mb={2}>
                  <Text as="span" fontWeight="bold">Calculation Formula</Text>
                  {' '}Formula: Σ(Factor Value × Conversion Ratio × Weight)
                </Text>

                <VStack align="stretch" spacing={2} my={3}>
                  {mockCompositeComponents.map((comp: any, idx: number) => {
                    const actualValue =
                      comp.unitConversion?.convertedValue ??
                      comp.gwpConversion?.convertedValue ??
                      comp.originalValue
                    const contribution = actualValue * comp.weight

                    return (
                      <HStack key={idx} justify="space-between" fontSize="sm">
                        <HStack spacing={2}>
                          <Text>{comp.name}</Text>
                          <Badge colorScheme="orange" fontSize="xs">
                            Weight: {(comp.weight * 100).toFixed(0)}%
                          </Badge>
                          {comp.gwpConversion && (
                            <Badge colorScheme="green" fontSize="xs">
                              {comp.gwpConversion.gwpVersion}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontFamily="mono">
                          {formatNumber(actualValue)}×{comp.weight} = {formatNumber(contribution)}
                        </Text>
                      </HStack>
                    )
                  })}
                </VStack>

                <Divider my={3} />

                <HStack justify="space-between">
                  <Text fontWeight="bold">Composite Value</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600" fontFamily="mono">
                    {formatNumber(mockFactor.value)} {mockFactor.unit}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
        )}

        {/* Other Information */}
        <Box>
          <Text fontSize="md" fontWeight="bold" color="blue.600" mb={3}>
            Other Information
          </Text>

          <Table variant="simple" size="sm">
            <Tbody>
              {/* System Boundary - 顯示生命週期階段 */}
              <Tr>
                <Td width="40%" bg="gray.50" fontWeight="medium">System Boundary</Td>
                <Td>
                  {mockFactor.system_boundary_detail ||
                   (mockFactor.lifecycle_stages && mockFactor.lifecycle_stages.length > 0
                     ? formatLifecycleStages(mockFactor.lifecycle_stages)
                     : 'Cradle-to-Grave')}
                </Td>
              </Tr>

              {/* 新增：適用產業分類 */}
              {mockFactor.isic_categories && mockFactor.isic_categories.length > 0 && (
                <Tr>
                  <Td bg="gray.50" fontWeight="medium" verticalAlign="top">Applicable ISIC Classification</Td>
                  <Td>
                    <HStack spacing={2} flexWrap="wrap">
                      {mockFactor.isic_categories.map((code: string) => (
                        <Badge key={code} colorScheme="purple" fontSize="xs">
                          {formatISICCode(code)}
                        </Badge>
                      ))}
                    </HStack>
                  </Td>
                </Tr>
              )}

              {/* 新增：數據品質等級 */}
              {mockFactor.data_quality && (
                <Tr>
                  <Td bg="gray.50" fontWeight="medium">Data Quality</Td>
                  <Td>
                    <Badge
                      colorScheme={mockFactor.data_quality === 'Primary' ? 'green' : 'blue'}
                      fontSize="sm"
                    >
                      {formatDataQuality(mockFactor.data_quality)}
                    </Badge>
                  </Td>
                </Tr>
              )}

              {/* Comment 欄位 */}
              {(mockFactor.notes || mockFactor.composition_notes) && (
                <Tr>
                  <Td bg="gray.50" fontWeight="medium" verticalAlign="top">Comment</Td>
                  <Td>
                    <Text fontSize="sm" whiteSpace="pre-line" lineHeight="1.8">
                      {mockFactor.composition_notes || mockFactor.notes}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>


        {/* 版本管理 */}
        <Box>
          <Text fontSize="md" fontWeight="bold" color="blue.600" mb={3}>
            版本管理
          </Text>

          <VStack spacing={2} align="stretch">
            {mockVersions.length === 0 ? (
              <Box bg="gray.100" p={4} borderRadius="md" textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  尚無版本歷史記錄
                </Text>
              </Box>
            ) : (
              mockVersions.map((version: any) => (
                <HStack key={version.version} justify="space-between" p={3}
                       bg={version.isCurrent ? 'blue.50' : 'gray.50'}
                       borderRadius="md"
                       border="1px solid"
                       borderColor={version.isCurrent ? 'blue.200' : 'gray.200'}>
                  <HStack>
                    <Icon as={version.isCurrent ? CheckIcon : TimeIcon}
                          color={version.isCurrent ? 'green.500' : 'gray.400'} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Text fontSize="sm" fontWeight={version.isCurrent ? 'medium' : 'normal'}>
                          {version.version}
                        </Text>
                        {version.isCurrent && (
                          <Tag size="sm" colorScheme="blue">
                            <TagLabel>目前使用</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(version.date)}
                      </Text>
                      {version.changes && (
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {version.changes}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {!version.isCurrent && mockFactor.type !== 'composite_factor' && (
                    <Button size="xs" variant="outline">
                      切換
                    </Button>
                  )}
                </HStack>
              ))
            )}
          </VStack>
        </Box>

        {/* Sync Status - For user-defined composite factors and imported central library factors */}
        {mockFactor.type === 'composite_factor' &&
         (isUserDefinedFactor || (isCentralLibrary && mockFactor.source_composite_id)) && (
          <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm">同步狀態</Heading>
                {/* 自建係數：檢查 imported_to_central */}
                {isUserDefinedFactor && mockFactor.imported_to_central && (
                  <Badge
                    colorScheme={
                      getSyncStatus(mockFactor) === 'synced' ? 'green' :
                      getSyncStatus(mockFactor) === 'needs_sync' ? 'orange' :
                      'gray'
                    }
                  >
                    {getSyncStatus(mockFactor) === 'synced' && '✓ 已同步'}
                    {getSyncStatus(mockFactor) === 'needs_sync' && '⚠️ 需要同步'}
                    {getSyncStatus(mockFactor) === 'not_imported' && '未匯入'}
                  </Badge>
                )}
                {/* 中央庫係數：檢查 source_composite_id 和版本同步狀態 */}
                {isCentralLibrary && mockFactor.source_composite_id && (
                  <Badge
                    colorScheme={
                      mockFactor.source_version === mockFactor.synced_version ? 'green' : 'orange'
                    }
                  >
                    {mockFactor.source_version === mockFactor.synced_version ? '✓ 已同步' : '⚠️ 來源已更新'}
                  </Badge>
                )}
              </HStack>
            </CardHeader>
            <CardBody pt={2}>
              <VStack spacing={3} align="stretch">
                {mockFactor.imported_to_central || mockFactor.source_composite_id ? (
                  <>
                    {/* 已匯入 - 顯示同步資訊 */}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">首次匯入：</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {mockFactor.imported_at ? formatDate(mockFactor.imported_at) : '-'}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">最後同步：</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {mockFactor.last_synced_at ? formatDate(mockFactor.last_synced_at) : '-'}
                      </Text>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {isCentralLibrary ? '來源版本：' : '當前版本：'}
                      </Text>
                      <Badge colorScheme="blue">
                        {isCentralLibrary
                          ? (mockFactor.source_version || mockFactor.version || 'v1.0')
                          : (mockFactor.version || 'v1.0')
                        }
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {isCentralLibrary ? '中央庫版本：' : '已同步版本：'}
                      </Text>
                      <Badge colorScheme="gray">
                        {isCentralLibrary
                          ? (mockFactor.synced_version || mockFactor.version || 'v1.0')
                          : (mockFactor.last_synced_version || 'v1.0')
                        }
                      </Badge>
                    </HStack>

                    {/* 中央庫係數：顯示來源係數資訊 */}
                    {isCentralLibrary && mockFactor.source_composite_id && (
                      <>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">來自自建係數：</Text>
                          <Text fontSize="sm" fontWeight="medium" color="blue.600">
                            ID: {mockFactor.source_composite_id}
                          </Text>
                        </HStack>
                      </>
                    )}

                    {/* 需要同步警告 - 自建係數 */}
                    {isUserDefinedFactor && getSyncStatus(mockFactor) === 'needs_sync' && (
                      <>
                        <Divider />
                        <Alert status="warning" borderRadius="md" fontSize="sm">
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle fontSize="sm">需要重新同步</AlertTitle>
                            <AlertDescription fontSize="xs" mt={1}>
                              係數已更新至 {mockFactor.version}，但中央庫仍為 {mockFactor.last_synced_version || 'v1.0'}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </>
                    )}

                    {/* 來源更新警告 - 中央庫係數 */}
                    {isCentralLibrary && mockFactor.source_composite_id &&
                     mockFactor.source_version !== mockFactor.synced_version && (
                      <>
                        <Divider />
                        <Alert status="warning" borderRadius="md" fontSize="sm">
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle fontSize="sm">來源係數已更新</AlertTitle>
                            <AlertDescription fontSize="xs" mt={1}>
                              來源係數已更新至 {mockFactor.source_version}，但此中央庫係數仍為 {mockFactor.synced_version}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </>
                    )}

                    {/* 同步按鈕 */}
                    {isUserDefinedFactor && (
                      <Button
                        size="sm"
                        colorScheme={getSyncStatus(mockFactor) === 'needs_sync' ? 'blue' : 'gray'}
                        variant={getSyncStatus(mockFactor) === 'needs_sync' ? 'solid' : 'outline'}
                        isDisabled={getSyncStatus(mockFactor) === 'synced'}
                      >
                        {getSyncStatus(mockFactor) === 'needs_sync'
                          ? '重新同步到中央庫'
                          : '已是最新版本'
                        }
                      </Button>
                    )}

                    {isCentralLibrary && mockFactor.source_composite_id && (
                      <Button
                        size="sm"
                        colorScheme={mockFactor.source_version !== mockFactor.synced_version ? 'blue' : 'gray'}
                        variant={mockFactor.source_version !== mockFactor.synced_version ? 'solid' : 'outline'}
                        isDisabled={mockFactor.source_version === mockFactor.synced_version}
                      >
                        {mockFactor.source_version !== mockFactor.synced_version
                          ? '從來源同步更新'
                          : '已是最新版本'
                        }
                      </Button>
                    )}
                  </>
                ) : !isCentralLibrary ? (
                  <>
                    {/* 未匯入 - 顯示匯入提示（僅自建係數庫） */}
                    <Text fontSize="sm" color="gray.600" textAlign="center" py={2}>
                      此組合係數尚未匯入中央庫
                    </Text>
                    <Button size="sm" colorScheme="blue" variant="outline">
                      匯入到中央庫
                    </Button>
                  </>
                ) : null}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Actions */}
        <VStack spacing={3}>
          {/* 自建係數庫：根據係數類型顯示編輯按鈕 */}
          {isUserDefinedFactor && (
            <>
              {mockFactor.type === 'composite_factor' ? (
                <Button
                  colorScheme="blue"
                  size="sm"
                  w="100%"
                  onClick={() => {
                    // 檢查是否已匯入中央庫
                    if (mockFactor.imported_to_central) {
                      onBlockEdit?.(mockFactor)
                    } else {
                      onEditComposite?.(mockFactor)
                    }
                  }}
                >
                  編輯組合係數
                </Button>
              ) : mockFactor.type === 'custom_factor' ? (
                <Button
                  colorScheme="blue"
                  size="sm"
                  w="100%"
                  onClick={() => {
                    // 檢查是否已匯入中央庫
                    if (mockFactor.imported_to_central) {
                      onBlockEdit?.(mockFactor)
                    } else {
                      onEditCustomFactor?.(mockFactor)
                    }
                  }}
                >
                  編輯自訂係數
                </Button>
              ) : null}
            </>
          )}

          {/* 在中央庫中：所有係數都可以移除 */}
          {isCentralLibrary ? (
            <Button
              colorScheme="red"
              size="sm"
              variant="outline"
              w="100%"
              onClick={() => onRemoveFromCentral?.(mockFactor)}
            >
              從中央係數庫移除
            </Button>
          ) : !isCentralLibrary && mockFactor.type === 'composite_factor' ? (
            /* 在自建係數庫且是組合係數時顯示匯入按鈕 */
            <Button
              colorScheme="brand"
              size="sm"
              w="100%"
              onClick={() => onImportToCentral?.(mockFactor)}
              isDisabled={mockFactor.imported_to_central}
            >
              {mockFactor.imported_to_central ? '已匯入中央庫' : '匯入到中央庫'}
            </Button>
          ) : !isCentralLibrary &&
              ['standard', 'pact', 'supplier'].includes(mockFactor.source_type) ? (
            /* 希達係數：直接加入中央庫，無需彈窗 */
            <Button
              colorScheme="brand"
              size="sm"
              w="100%"
              onClick={() => onAddStandardToCentral?.(mockFactor)}
            >
              加入中央係數庫
            </Button>
          ) : null}
        </VStack>
      </VStack>
    </Box>
  )
}