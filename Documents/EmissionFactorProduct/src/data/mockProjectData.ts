// 擴展的專案Mock資料
// 用於支援專案A（三個產品）和專案B（三年盤查）的詳細數據

// 產品碳足跡介面
interface ProductCarbonFootprintItem {
  id: number
  stage: '原物料' | '製造' | '配送' | '使用' | '廢棄'
  item_name: string
  quantity_spec: string
  additional_info: string
  factor_selection: string
  error_level: string
  product?: string // 新增產品標識
  year?: number // 新增年份
}

// 組織碳盤查介面
interface OrganizationalInventoryItem {
  id: number
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3'
  emission_source_category: string
  emission_source_name: string
  activity_data: number
  activity_data_unit: string
  factor_id: number // 直接儲存係數ID
  factor_selection: string // 保留作為顯示用途
  version: string
  error_level: string
  year?: number // 新增年份
}

// 專案A - 產品碳足跡資料（三個產品）
export const mockProductCarbonFootprintData: ProductCarbonFootprintItem[] = [
  // === 產品A1 - 智慧型手機 (2024) ===
  // 原物料階段
  {
    id: 1,
    stage: '原物料',
    item_name: '鋁合金外殼',
    quantity_spec: '0.15 公斤',
    additional_info: '海運-貨櫃',
    factor_selection: '鋁合金-初級生產-2024 v2.1',
    error_level: '自廠發展係數/質量平衡所得係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 2,
    stage: '原物料',
    item_name: '螢幕玻璃',
    quantity_spec: '0.08 公斤',
    additional_info: '康寧大猩猩玻璃',
    factor_selection: '特殊玻璃-強化-2024 v1.2',
    error_level: '製造廠提供係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 3,
    stage: '原物料',
    item_name: '鋰電池',
    quantity_spec: '0.045 公斤',
    additional_info: '鋰離子電池',
    factor_selection: '鋰電池-消費電子-2024 v3.1',
    error_level: '國際排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 4,
    stage: '原物料',
    item_name: '積體電路',
    quantity_spec: '0.025 公斤',
    additional_info: '7nm製程晶片',
    factor_selection: '半導體-先進製程-2024 v1.8',
    error_level: '製造廠提供係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 5,
    stage: '原物料',
    item_name: '塑膠元件',
    quantity_spec: '0.12 公斤',
    additional_info: 'ABS+PC混合材料',
    factor_selection: 'ABS塑膠-石化原料-2024 v1.3',
    error_level: '國家排放係數',
    product: 'smartphone',
    year: 2024
  },

  // 製造階段
  {
    id: 6,
    stage: '製造',
    item_name: '組裝製程',
    quantity_spec: '2.5 kWh',
    additional_info: '自動化產線',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 7,
    stage: '製造',
    item_name: '測試製程',
    quantity_spec: '0.8 kWh',
    additional_info: '功能測試+老化測試',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 8,
    stage: '製造',
    item_name: '包裝製程',
    quantity_spec: '0.15 公斤',
    additional_info: '紙盒+塑膠包材',
    factor_selection: '包裝材料-混合-2024 v1.1',
    error_level: '區域排放係數',
    product: 'smartphone',
    year: 2024
  },

  // 配送階段
  {
    id: 9,
    stage: '配送',
    item_name: '工廠→配送中心',
    quantity_spec: '1200 km',
    additional_info: '海運-貨櫃船',
    factor_selection: '海運-貨櫃-2024 v1.5',
    error_level: '國際排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 10,
    stage: '配送',
    item_name: '配送中心→零售店',
    quantity_spec: '150 km',
    additional_info: '陸運-電動貨車',
    factor_selection: '電動貨車-商用-2024 v1.0',
    error_level: '區域排放係數',
    product: 'smartphone',
    year: 2024
  },

  // 使用階段
  {
    id: 11,
    stage: '使用',
    item_name: '日常充電',
    quantity_spec: '1095 次',
    additional_info: '3年使用期，每日充電',
    factor_selection: '臺灣電力-家用-2024 v2.0',
    error_level: '國家排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 12,
    stage: '使用',
    item_name: '數據傳輸',
    quantity_spec: '36 GB/月',
    additional_info: '行動網路+WiFi',
    factor_selection: '數位服務-行動通信-2024 v1.3',
    error_level: '區域排放係數',
    product: 'smartphone',
    year: 2024
  },

  // 廢棄階段
  {
    id: 13,
    stage: '廢棄',
    item_name: '電子廢料回收',
    quantity_spec: '0.35 公斤',
    additional_info: '專業回收處理',
    factor_selection: '電子廢料-回收處理-2024 v1.4',
    error_level: '區域排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 14,
    stage: '廢棄',
    item_name: '包裝廢料處理',
    quantity_spec: '0.15 公斤',
    additional_info: '紙類回收+塑膠焚化',
    factor_selection: '包裝廢料-混合處理-2024 v1.2',
    error_level: '國家排放係數',
    product: 'smartphone',
    year: 2024
  },
  {
    id: 15,
    stage: '廢棄',
    item_name: '運輸至回收廠',
    quantity_spec: '25 km',
    additional_info: '回收車運輸',
    factor_selection: '廢料運輸-回收車-2024 v1.0',
    error_level: '區域排放係數',
    product: 'smartphone',
    year: 2024
  },

  // === 產品A2 - LED燈具 (2024) ===
  // 原物料階段
  {
    id: 16,
    stage: '原物料',
    item_name: 'LED晶片',
    quantity_spec: '0.005 公斤',
    additional_info: '高效能LED',
    factor_selection: 'LED半導體-2024 v2.0',
    error_level: '製造廠提供係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 17,
    stage: '原物料',
    item_name: '鋁合金散熱器',
    quantity_spec: '0.25 公斤',
    additional_info: '擠型鋁材',
    factor_selection: '鋁合金-擠型-2024 v1.8',
    error_level: '國際排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 18,
    stage: '原物料',
    item_name: '電源供應器',
    quantity_spec: '0.18 公斤',
    additional_info: '開關式電源',
    factor_selection: '電子電源-小型-2024 v1.5',
    error_level: '製造廠提供係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 19,
    stage: '原物料',
    item_name: '光學透鏡',
    quantity_spec: '0.08 公斤',
    additional_info: 'PC光學級塑膠',
    factor_selection: '光學塑膠-PC-2024 v1.2',
    error_level: '國際排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 20,
    stage: '原物料',
    item_name: '金屬外殼',
    quantity_spec: '0.35 公斤',
    additional_info: '鋁合金壓鑄',
    factor_selection: '鋁合金-壓鑄-2024 v1.6',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },

  // 製造階段
  {
    id: 21,
    stage: '製造',
    item_name: 'SMT貼片製程',
    quantity_spec: '1.2 kWh',
    additional_info: '表面貼裝技術',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 22,
    stage: '製造',
    item_name: '光學組裝',
    quantity_spec: '0.8 kWh',
    additional_info: '精密組裝',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 23,
    stage: '製造',
    item_name: '品質測試',
    quantity_spec: '0.3 kWh',
    additional_info: '光學+電氣測試',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },

  // 配送階段
  {
    id: 24,
    stage: '配送',
    item_name: '包裝材料',
    quantity_spec: '0.12 公斤',
    additional_info: '紙盒包裝',
    factor_selection: '紙類包材-瓦楞紙-2024 v1.3',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 25,
    stage: '配送',
    item_name: '物流運輸',
    quantity_spec: '200 km',
    additional_info: '貨車運輸',
    factor_selection: '貨運-中型卡車-2024 v1.1',
    error_level: '區域排放係數',
    product: 'led_light',
    year: 2024
  },

  // 使用階段
  {
    id: 26,
    stage: '使用',
    item_name: '照明用電',
    quantity_spec: '876 kWh',
    additional_info: '10年使用期，每日8小時',
    factor_selection: '臺灣電力-家用-2024 v2.0',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 27,
    stage: '使用',
    item_name: '維護更換',
    quantity_spec: '0.02 公斤',
    additional_info: '10年期間零件更換',
    factor_selection: 'LED維護-小零件-2024 v1.0',
    error_level: '區域排放係數',
    product: 'led_light',
    year: 2024
  },

  // 廢棄階段
  {
    id: 28,
    stage: '廢棄',
    item_name: '金屬回收',
    quantity_spec: '0.6 公斤',
    additional_info: '鋁合金回收',
    factor_selection: '金屬廢料-鋁回收-2024 v1.5',
    error_level: '國家排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 29,
    stage: '廢棄',
    item_name: '電子廢料',
    quantity_spec: '0.2 公斤',
    additional_info: '電路板回收',
    factor_selection: '電子廢料-小型-2024 v1.3',
    error_level: '區域排放係數',
    product: 'led_light',
    year: 2024
  },
  {
    id: 30,
    stage: '廢棄',
    item_name: '廢料運輸',
    quantity_spec: '15 km',
    additional_info: '回收廠運輸',
    factor_selection: '廢料運輸-回收車-2024 v1.0',
    error_level: '區域排放係數',
    product: 'led_light',
    year: 2024
  },

  // === 產品A3 - 筆記型電腦 (2024) ===
  // 原物料階段
  {
    id: 31,
    stage: '原物料',
    item_name: '鋁合金機身',
    quantity_spec: '1.2 公斤',
    additional_info: 'CNC加工',
    factor_selection: '鋁合金-精密加工-2024 v2.3',
    error_level: '製造廠提供係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 32,
    stage: '原物料',
    item_name: 'LCD螢幕',
    quantity_spec: '0.8 公斤',
    additional_info: '15.6吋IPS面板',
    factor_selection: 'LCD面板-大尺寸-2024 v1.7',
    error_level: '製造廠提供係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 33,
    stage: '原物料',
    item_name: '主機板',
    quantity_spec: '0.5 公斤',
    additional_info: '多層PCB',
    factor_selection: 'PCB電路板-多層-2024 v2.1',
    error_level: '製造廠提供係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 34,
    stage: '原物料',
    item_name: '鋰電池組',
    quantity_spec: '0.3 公斤',
    additional_info: '6cell鋰電池',
    factor_selection: '鋰電池-筆電用-2024 v2.5',
    error_level: '國際排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 35,
    stage: '原物料',
    item_name: '記憶體模組',
    quantity_spec: '0.1 公斤',
    additional_info: 'DDR4 16GB',
    factor_selection: '記憶體-DDR4-2024 v1.4',
    error_level: '製造廠提供係數',
    product: 'laptop',
    year: 2024
  },

  // 製造階段
  {
    id: 36,
    stage: '製造',
    item_name: '主機板組裝',
    quantity_spec: '8.5 kWh',
    additional_info: 'SMT+DIP製程',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 37,
    stage: '製造',
    item_name: '機構組裝',
    quantity_spec: '3.2 kWh',
    additional_info: '精密組裝',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 38,
    stage: '製造',
    item_name: '系統測試',
    quantity_spec: '2.8 kWh',
    additional_info: '燒機+品質測試',
    factor_selection: '臺灣電力-工業用-2024 v2.2',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  },

  // 配送階段
  {
    id: 39,
    stage: '配送',
    item_name: '產品包裝',
    quantity_spec: '0.4 公斤',
    additional_info: '保護包裝+配件',
    factor_selection: '包裝材料-筆電用-2024 v1.2',
    error_level: '區域排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 40,
    stage: '配送',
    item_name: '國際運輸',
    quantity_spec: '8000 km',
    additional_info: '空運配送',
    factor_selection: '航空貨運-國際-2024 v1.6',
    error_level: '國際排放係數',
    product: 'laptop',
    year: 2024
  },

  // 使用階段
  {
    id: 41,
    stage: '使用',
    item_name: '日常使用',
    quantity_spec: '1460 kWh',
    additional_info: '5年使用期，每日8小時',
    factor_selection: '臺灣電力-家用-2024 v2.0',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 42,
    stage: '使用',
    item_name: '雲端服務',
    quantity_spec: '60 GB/月',
    additional_info: '資料同步+備份',
    factor_selection: '雲端服務-資料中心-2024 v1.8',
    error_level: '國際排放係數',
    product: 'laptop',
    year: 2024
  },

  // 廢棄階段
  {
    id: 43,
    stage: '廢棄',
    item_name: '金屬回收',
    quantity_spec: '1.5 公斤',
    additional_info: '鋁+銅+鋼材回收',
    factor_selection: '金屬廢料-混合-2024 v1.8',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 44,
    stage: '廢棄',
    item_name: '電子廢料處理',
    quantity_spec: '1.2 公斤',
    additional_info: '專業拆解回收',
    factor_selection: '電子廢料-筆電-2024 v1.5',
    error_level: '區域排放係數',
    product: 'laptop',
    year: 2024
  },
  {
    id: 45,
    stage: '廢棄',
    item_name: '危廢處理',
    quantity_spec: '0.3 公斤',
    additional_info: '鋰電池專業處理',
    factor_selection: '危險廢料-鋰電池-2024 v1.3',
    error_level: '國家排放係數',
    product: 'laptop',
    year: 2024
  }
]

// 專案B - 組織碳盤查資料（三年）
export const mockOrganizationalInventoryData: OrganizationalInventoryItem[] = [
  // === 2024年度盤查 ===
  // Scope 1 直接排放
  {
    id: 46,
    scope: 'Scope 1',
    emission_source_category: '固定燃燒',
    emission_source_name: '天然氣鍋爐',
    activity_data: 45000,
    activity_data_unit: 'Nm³',
    factor_id: 6,
    factor_selection: '臺灣-天然氣-工業用-2024',
    version: 'v2024.1',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 47,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '公務車-汽油',
    activity_data: 8500,
    activity_data_unit: '公升',
    factor_id: 13,
    factor_selection: '臺灣-汽油-車用-2024',
    version: 'v2024.1',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 48,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '堆高機-柴油',
    activity_data: 2800,
    activity_data_unit: '公升',
    factor_id: 16,
    factor_selection: '臺灣-柴油-2024',
    version: 'v2024.1',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 49,
    scope: 'Scope 1',
    emission_source_category: '製程排放',
    emission_source_name: '化學製程逸散',
    activity_data: 156,
    activity_data_unit: '噸',
    factor_id: 131,
    factor_selection: '化工製程-有機溶劑-2024',
    version: 'v2024.1',
    error_level: '製造廠提供係數',
    year: 2024
  },
  {
    id: 50,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '冷媒逸散',
    activity_data: 25,
    activity_data_unit: 'kg',
    factor_id: 134,
    factor_selection: '冷媒-R134a-2024',
    version: 'v2024.1',
    error_level: '國際排放係數',
    year: 2024
  },
  {
    id: 51,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '廢水處理池',
    activity_data: 12000,
    activity_data_unit: 'm³',
    factor_id: 137,
    factor_selection: '廢水處理-厭氧-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },

  // Scope 2 間接排放
  {
    id: 52,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '廠區用電',
    activity_data: 850000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2024',
    version: 'v2024.2',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 53,
    scope: 'Scope 2',
    emission_source_category: '外購蒸氣',
    emission_source_name: '製程蒸氣',
    activity_data: 1200,
    activity_data_unit: '噸',
    factor_id: 140,
    factor_selection: '工業蒸氣-外購-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },
  {
    id: 54,
    scope: 'Scope 2',
    emission_source_category: '外購冷凍',
    emission_source_name: '中央空調',
    activity_data: 45000,
    activity_data_unit: 'RT-hr',
    factor_id: 143,
    factor_selection: '冷凍能-外購-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },
  {
    id: 55,
    scope: 'Scope 2',
    emission_source_category: '外購熱能',
    emission_source_name: '熱水供應',
    activity_data: 15000,
    activity_data_unit: 'GJ',
    factor_id: 146,
    factor_selection: '熱能-外購-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },
  {
    id: 56,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '辦公區用電',
    activity_data: 120000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2024',
    version: 'v2024.2',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 57,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '宿舍用電',
    activity_data: 180000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2024',
    version: 'v2024.2',
    error_level: '國家排放係數',
    year: 2024
  },

  // Scope 3 其他間接排放
  {
    id: 58,
    scope: 'Scope 3',
    emission_source_category: '原料運輸',
    emission_source_name: '原物料進貨運輸',
    activity_data: 2500,
    activity_data_unit: 'tkm',
    factor_id: 19,
    factor_selection: '貨運-陸運-柴油卡車-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },
  {
    id: 59,
    scope: 'Scope 3',
    emission_source_category: '員工通勤',
    emission_source_name: '員工交通補貼',
    activity_data: 28000,
    activity_data_unit: '人·km',
    factor_id: 25,
    factor_selection: '大眾運輸-捷運-2024',
    version: 'v2024.1',
    error_level: '製造廠提供係數',
    year: 2024
  },
  {
    id: 60,
    scope: 'Scope 3',
    emission_source_category: '商務旅行',
    emission_source_name: '國內出差',
    activity_data: 15000,
    activity_data_unit: '人·km',
    factor_id: 28,
    factor_selection: '航空運輸-國內-2024',
    version: 'v2024.1',
    error_level: '國際排放係數',
    year: 2024
  },
  {
    id: 61,
    scope: 'Scope 3',
    emission_source_category: '廢棄物處理',
    emission_source_name: '一般廢棄物',
    activity_data: 150,
    activity_data_unit: '噸',
    factor_id: 152,
    factor_selection: '一般廢棄物-焚化-2024',
    version: 'v2024.1',
    error_level: '國家排放係數',
    year: 2024
  },
  {
    id: 62,
    scope: 'Scope 3',
    emission_source_category: '下游運輸',
    emission_source_name: '產品配送',
    activity_data: 3200,
    activity_data_unit: 'tkm',
    factor_id: 19,
    factor_selection: '貨運-陸運-柴油卡車-2024',
    version: 'v2024.1',
    error_level: '區域排放係數',
    year: 2024
  },
  {
    id: 63,
    scope: 'Scope 3',
    emission_source_category: '水資源',
    emission_source_name: '自來水使用',
    activity_data: 25000,
    activity_data_unit: 'm³',
    factor_id: 149,
    factor_selection: '自來水-處理-2024',
    version: 'v2024.1',
    error_level: '國家排放係數',
    year: 2024
  },

  // === 2023年度盤查 ===
  // Scope 1 直接排放
  {
    id: 64,
    scope: 'Scope 1',
    emission_source_category: '固定燃燒',
    emission_source_name: '天然氣鍋爐',
    activity_data: 42000,
    activity_data_unit: 'Nm³',
    factor_id: 6,
    factor_selection: '臺灣-天然氣-工業用-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 65,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '公務車-汽油',
    activity_data: 7800,
    activity_data_unit: '公升',
    factor_id: 13,
    factor_selection: '臺灣-汽油-車用-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 66,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '堆高機-柴油',
    activity_data: 2600,
    activity_data_unit: '公升',
    factor_id: 16,
    factor_selection: '臺灣-柴油-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 67,
    scope: 'Scope 1',
    emission_source_category: '製程排放',
    emission_source_name: '化學製程逸散',
    activity_data: 145,
    activity_data_unit: '噸',
    factor_id: 131,
    factor_selection: '化工製程-有機溶劑-2023',
    version: 'v2023.1',
    error_level: '製造廠提供係數',
    year: 2023
  },
  {
    id: 68,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '冷媒逸散',
    activity_data: 22,
    activity_data_unit: 'kg',
    factor_id: 134,
    factor_selection: '冷媒-R134a-2023',
    version: 'v2023.1',
    error_level: '國際排放係數',
    year: 2023
  },
  {
    id: 69,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '廢水處理池',
    activity_data: 11500,
    activity_data_unit: 'm³',
    factor_id: 137,
    factor_selection: '廢水處理-厭氧-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },

  // Scope 2 間接排放 (2023)
  {
    id: 70,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '廠區用電',
    activity_data: 820000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 71,
    scope: 'Scope 2',
    emission_source_category: '外購蒸氣',
    emission_source_name: '製程蒸氣',
    activity_data: 1150,
    activity_data_unit: '噸',
    factor_id: 141,
    factor_selection: '工業蒸氣-外購-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },
  {
    id: 72,
    scope: 'Scope 2',
    emission_source_category: '外購冷凍',
    emission_source_name: '中央空調',
    activity_data: 43000,
    activity_data_unit: 'RT-hr',
    factor_id: 144,
    factor_selection: '冷凍能-外購-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },
  {
    id: 73,
    scope: 'Scope 2',
    emission_source_category: '外購熱能',
    emission_source_name: '熱水供應',
    activity_data: 14200,
    activity_data_unit: 'GJ',
    factor_id: 147,
    factor_selection: '熱能-外購-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },
  {
    id: 74,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '辦公區用電',
    activity_data: 115000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 75,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '宿舍用電',
    activity_data: 175000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },

  // Scope 3 其他間接排放 (2023)
  {
    id: 76,
    scope: 'Scope 3',
    emission_source_category: '原料運輸',
    emission_source_name: '原物料進貨運輸',
    activity_data: 2300,
    activity_data_unit: 'tkm',
    factor_id: 23,
    factor_selection: '貨運-陸運-柴油卡車-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },
  {
    id: 77,
    scope: 'Scope 3',
    emission_source_category: '員工通勤',
    emission_source_name: '員工交通補貼',
    activity_data: 26500,
    activity_data_unit: '人·km',
    factor_id: 26,
    factor_selection: '大眾運輸-捷運-2023',
    version: 'v2023.1',
    error_level: '製造廠提供係數',
    year: 2023
  },
  {
    id: 78,
    scope: 'Scope 3',
    emission_source_category: '商務旅行',
    emission_source_name: '國內出差',
    activity_data: 12000,
    activity_data_unit: '人·km',
    factor_id: 29,
    factor_selection: '航空運輸-國內-2023',
    version: 'v2023.1',
    error_level: '國際排放係數',
    year: 2023
  },
  {
    id: 79,
    scope: 'Scope 3',
    emission_source_category: '廢棄物處理',
    emission_source_name: '一般廢棄物',
    activity_data: 140,
    activity_data_unit: '噸',
    factor_id: 153,
    factor_selection: '一般廢棄物-焚化-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },
  {
    id: 80,
    scope: 'Scope 3',
    emission_source_category: '下游運輸',
    emission_source_name: '產品配送',
    activity_data: 2950,
    activity_data_unit: 'tkm',
    factor_id: 23,
    factor_selection: '貨運-陸運-柴油卡車-2023',
    version: 'v2023.1',
    error_level: '區域排放係數',
    year: 2023
  },
  {
    id: 81,
    scope: 'Scope 3',
    emission_source_category: '水資源',
    emission_source_name: '自來水使用',
    activity_data: 23500,
    activity_data_unit: 'm³',
    factor_id: 150,
    factor_selection: '自來水-處理-2023',
    version: 'v2023.1',
    error_level: '國家排放係數',
    year: 2023
  },

  // === 2022年度盤查 ===
  // Scope 1 直接排放
  {
    id: 82,
    scope: 'Scope 1',
    emission_source_category: '固定燃燒',
    emission_source_name: '天然氣鍋爐',
    activity_data: 38000,
    activity_data_unit: 'Nm³',
    factor_id: 6,
    factor_selection: '臺灣-天然氣-工業用-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 83,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '公務車-汽油',
    activity_data: 7200,
    activity_data_unit: '公升',
    factor_id: 13,
    factor_selection: '臺灣-汽油-車用-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 84,
    scope: 'Scope 1',
    emission_source_category: '移動燃燒',
    emission_source_name: '堆高機-柴油',
    activity_data: 2400,
    activity_data_unit: '公升',
    factor_id: 16,
    factor_selection: '臺灣-柴油-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 85,
    scope: 'Scope 1',
    emission_source_category: '製程排放',
    emission_source_name: '化學製程逸散',
    activity_data: 135,
    activity_data_unit: '噸',
    factor_id: 131,
    factor_selection: '化工製程-有機溶劑-2022',
    version: 'v2022.1',
    error_level: '製造廠提供係數',
    year: 2022
  },
  {
    id: 86,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '冷媒逸散',
    activity_data: 20,
    activity_data_unit: 'kg',
    factor_id: 134,
    factor_selection: '冷媒-R134a-2022',
    version: 'v2022.1',
    error_level: '國際排放係數',
    year: 2022
  },
  {
    id: 87,
    scope: 'Scope 1',
    emission_source_category: '逸散排放',
    emission_source_name: '廢水處理池',
    activity_data: 11000,
    activity_data_unit: 'm³',
    factor_id: 137,
    factor_selection: '廢水處理-厭氧-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },

  // Scope 2 間接排放 (2022)
  {
    id: 88,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '廠區用電',
    activity_data: 780000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 89,
    scope: 'Scope 2',
    emission_source_category: '外購蒸氣',
    emission_source_name: '製程蒸氣',
    activity_data: 1100,
    activity_data_unit: '噸',
    factor_id: 142,
    factor_selection: '工業蒸氣-外購-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },
  {
    id: 90,
    scope: 'Scope 2',
    emission_source_category: '外購冷凍',
    emission_source_name: '中央空調',
    activity_data: 40000,
    activity_data_unit: 'RT-hr',
    factor_id: 145,
    factor_selection: '冷凍能-外購-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },
  {
    id: 91,
    scope: 'Scope 2',
    emission_source_category: '外購熱能',
    emission_source_name: '熱水供應',
    activity_data: 13500,
    activity_data_unit: 'GJ',
    factor_id: 148,
    factor_selection: '熱能-外購-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },
  {
    id: 92,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '辦公區用電',
    activity_data: 110000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 93,
    scope: 'Scope 2',
    emission_source_category: '外購電力',
    emission_source_name: '宿舍用電',
    activity_data: 165000,
    activity_data_unit: 'kWh',
    factor_id: 2,
    factor_selection: '臺灣電力-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },

  // Scope 3 其他間接排放 (2022)
  {
    id: 94,
    scope: 'Scope 3',
    emission_source_category: '原料運輸',
    emission_source_name: '原物料進貨運輸',
    activity_data: 2100,
    activity_data_unit: 'tkm',
    factor_id: 24,
    factor_selection: '貨運-陸運-柴油卡車-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },
  {
    id: 95,
    scope: 'Scope 3',
    emission_source_category: '員工通勤',
    emission_source_name: '員工交通補貼',
    activity_data: 25000,
    activity_data_unit: '人·km',
    factor_id: 27,
    factor_selection: '大眾運輸-捷運-2022',
    version: 'v2022.1',
    error_level: '製造廠提供係數',
    year: 2022
  },
  {
    id: 96,
    scope: 'Scope 3',
    emission_source_category: '商務旅行',
    emission_source_name: '國內出差',
    activity_data: 9500,
    activity_data_unit: '人·km',
    factor_id: 31,
    factor_selection: '航空運輸-國內-2022',
    version: 'v2022.1',
    error_level: '國際排放係數',
    year: 2022
  },
  {
    id: 97,
    scope: 'Scope 3',
    emission_source_category: '廢棄物處理',
    emission_source_name: '一般廢棄物',
    activity_data: 130,
    activity_data_unit: '噸',
    factor_id: 154,
    factor_selection: '一般廢棄物-焚化-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  },
  {
    id: 98,
    scope: 'Scope 3',
    emission_source_category: '下游運輸',
    emission_source_name: '產品配送',
    activity_data: 2750,
    activity_data_unit: 'tkm',
    factor_id: 24,
    factor_selection: '貨運-陸運-柴油卡車-2022',
    version: 'v2022.1',
    error_level: '區域排放係數',
    year: 2022
  },
  {
    id: 99,
    scope: 'Scope 3',
    emission_source_category: '水資源',
    emission_source_name: '自來水使用',
    activity_data: 22000,
    activity_data_unit: 'm³',
    factor_id: 151,
    factor_selection: '自來水-處理-2022',
    version: 'v2022.1',
    error_level: '國家排放係數',
    year: 2022
  }
]

// 產品碳足跡摘要資料（預設值,僅供呈現）
import {
  ProductCarbonFootprintSummary,
  L2ProjectInfo,
  ProjectProductItem,
  ImportToCentralFormData,
  EmissionFactor,
} from '@/types/types'

export const mockProductCarbonFootprintSummaries: ProductCarbonFootprintSummary[] = [
  // 產品A1 - 智慧型手機
  {
    productId: 'smartphone',
    productName: '智慧型手機 (2024款)',
    functionalUnit: '1 支（含包裝，使用3年）',
    totalFootprint: 45.8,
    unit: 'kg CO₂e/支',
    stageBreakdown: [
      { stage: '原物料', emission: 18.5, percentage: 40 },
      { stage: '製造', emission: 12.3, percentage: 27 },
      { stage: '配送', emission: 2.1, percentage: 5 },
      { stage: '使用', emission: 9.8, percentage: 21 },
      { stage: '廢棄', emission: 3.1, percentage: 7 }
    ],
    calculationDate: '2024-01-15',
    standard: 'ISO 14067:2018',
    isImported: false
  },
  // 產品A2 - LED燈具
  {
    productId: 'led_light',
    productName: 'LED燈具 (2024款)',
    functionalUnit: '1 盞（含包裝，使用5年）',
    totalFootprint: 28.6,
    unit: 'kg CO₂e/盞',
    stageBreakdown: [
      { stage: '原物料', emission: 12.4, percentage: 43 },
      { stage: '製造', emission: 6.8, percentage: 24 },
      { stage: '配送', emission: 1.2, percentage: 4 },
      { stage: '使用', emission: 6.5, percentage: 23 },
      { stage: '廢棄', emission: 1.7, percentage: 6 }
    ],
    calculationDate: '2024-02-10',
    standard: 'ISO 14067:2018',
    isImported: false
  },
  // 產品A3 - 筆記型電腦
  {
    productId: 'laptop',
    productName: '筆記型電腦 (2024款)',
    functionalUnit: '1 台（含包裝，使用4年）',
    totalFootprint: 156.2,
    unit: 'kg CO₂e/台',
    stageBreakdown: [
      { stage: '原物料', emission: 68.7, percentage: 44 },
      { stage: '製造', emission: 39.1, percentage: 25 },
      { stage: '配送', emission: 7.8, percentage: 5 },
      { stage: '使用', emission: 32.4, percentage: 21 },
      { stage: '廢棄', emission: 8.2, percentage: 5 }
    ],
    calculationDate: '2024-03-05',
    standard: 'ISO 14067:2018',
    isImported: false
  }
]

// L2 專案概覽資訊
export const mockL2ProjectInfo: L2ProjectInfo = {
  projectId: 'project_1',
  projectName: '專案 A - 產品碳足跡',
  lastImportDate: '2024-03-15 14:30:25',
  version: 'v2024.1',
  status: 'locked',
  productCount: 3,
  pactProductCount: 8
}

// 專案產品統整表
export const mockProjectProducts: ProjectProductItem[] = [
  // 內部產品 A1, A2, A3
  {
    id: 'product_1_1',
    type: 'product',
    name: 'A1 - 智慧型手機 (2024)',
    carbonFootprint: 45.8,
    unit: 'kg CO₂e/支',
    projectStatus: 'locked',
    centralLibStatus: 'not_imported',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'product_1_2',
    type: 'product',
    name: 'A2 - LED燈具 (2024)',
    carbonFootprint: 28.6,
    unit: 'kg CO₂e/盞',
    projectStatus: 'locked',
    centralLibStatus: 'not_imported',
    lastUpdated: '2024-03-14'
  },
  {
    id: 'product_1_3',
    type: 'product',
    name: 'A3 - 筆記型電腦 (2024)',
    carbonFootprint: 156.2,
    unit: 'kg CO₂e/台',
    projectStatus: 'locked',
    centralLibStatus: 'imported',
    lastUpdated: '2024-03-10'
  },

  // PACT 產品
  {
    id: 'pact_100',
    type: 'pact',
    name: '工業馬達 - 標準效率',
    carbonFootprint: 15.2,
    unit: 'kg CO₂e/unit',
    projectStatus: 'verified',
    centralLibStatus: 'imported',
    lastUpdated: '2024-03-01'
  },
  {
    id: 'pact_101',
    type: 'pact',
    name: '聚合物樹脂',
    carbonFootprint: 2.34,
    unit: 'kg CO₂e/kg',
    projectStatus: 'verified',
    centralLibStatus: 'imported',
    lastUpdated: '2024-03-01'
  },
  {
    id: 'pact_102',
    type: 'pact',
    name: '鋁合金輪圈',
    carbonFootprint: 89.5,
    unit: 'kg CO₂e/unit',
    projectStatus: 'verified',
    centralLibStatus: 'not_imported',
    lastUpdated: '2024-02-28'
  },
  {
    id: 'pact_103',
    type: 'pact',
    name: '電子零件 - 晶片封裝',
    carbonFootprint: 12.8,
    unit: 'kg CO₂e/unit',
    projectStatus: 'verified',
    centralLibStatus: 'imported',
    lastUpdated: '2024-02-25'
  },
  {
    id: 'pact_104',
    type: 'pact',
    name: '建材 - 預製混凝土',
    carbonFootprint: 234.5,
    unit: 'kg CO₂e/m³',
    projectStatus: 'verified',
    centralLibStatus: 'not_imported',
    lastUpdated: '2024-02-20'
  },
  {
    id: 'pact_105',
    type: 'pact',
    name: '紡織 - 有機棉布',
    carbonFootprint: 5.6,
    unit: 'kg CO₂e/kg',
    projectStatus: 'verified',
    centralLibStatus: 'imported',
    lastUpdated: '2024-02-18'
  },
  {
    id: 'pact_106',
    type: 'pact',
    name: '包裝 - 可回收紙箱',
    carbonFootprint: 0.89,
    unit: 'kg CO₂e/unit',
    projectStatus: 'verified',
    centralLibStatus: 'not_imported',
    lastUpdated: '2024-02-15'
  },
  {
    id: 'pact_107',
    type: 'pact',
    name: '能源設備 - 太陽能板',
    carbonFootprint: 450.0,
    unit: 'kg CO₂e/unit',
    projectStatus: 'verified',
    centralLibStatus: 'imported',
    lastUpdated: '2024-02-10'
  }
]

// 匯入產品到中央庫的處理函數
export const handleImportProductToCentral = (
  productId: string,
  formData: ImportToCentralFormData
): EmissionFactor => {
  // 找到對應的產品摘要
  const summary = mockProductCarbonFootprintSummaries.find((s) => s.productId === productId)
  if (!summary) throw new Error('找不到產品')

  // 地理範圍映射
  const geoScopeMap: Record<string, { continent: string; country: string }> = {
    taiwan: { continent: '亞洲', country: '台灣' },
    asia: { continent: '亞洲', country: '亞洲' },
    global: { continent: '全球', country: '全球' },
  }
  const geoScope = geoScopeMap[formData.geographic_scope] || { continent: '亞洲', country: '台灣' }

  // 系統邊界映射
  const boundaryMap: Record<string, string> = {
    cradle_to_grave: '搖籃到墳墓（全生命週期）',
    cradle_to_gate: '搖籃到大門（至出廠）',
    gate_to_gate: '大門到大門（製造階段）',
  }
  const boundaryText = boundaryMap[formData.system_boundary] || formData.system_boundary

  // 建立詳細的描述和備註
  const description = `${summary.productName}的產品碳足跡係數。功能單位：${formData.functional_unit}。`

  const notes = [
    `【產品類別】${formData.product_categories.join('、')}`,
    `【計算標準】${summary.standard}`,
    `【系統邊界】${boundaryText}`,
    formData.exclusions ? `【排除項目】${formData.exclusions}` : null,
    `【數據來源】實測數據 ${formData.primary_data_percentage}%、次級資料庫 ${formData.secondary_data_percentage}%`,
    `【生命週期階段分解】`,
    `  - 原物料：${summary.stageBreakdown.find((s) => s.stage === '原物料')?.emission.toFixed(2) || 0} kg CO₂e`,
    `  - 製造：${summary.stageBreakdown.find((s) => s.stage === '製造')?.emission.toFixed(2) || 0} kg CO₂e`,
    `  - 配送：${summary.stageBreakdown.find((s) => s.stage === '配送')?.emission.toFixed(2) || 0} kg CO₂e`,
    `  - 使用：${summary.stageBreakdown.find((s) => s.stage === '使用')?.emission.toFixed(2) || 0} kg CO₂e`,
    `  - 廢棄：${summary.stageBreakdown.find((s) => s.stage === '廢棄')?.emission.toFixed(2) || 0} kg CO₂e`,
    formData.usage_notes ? `【使用建議】${formData.usage_notes}` : null,
    `【計算日期】${summary.calculationDate}`,
    `【來源專案】${mockL2ProjectInfo.projectName}`,
  ]
    .filter(Boolean)
    .join('\n')

  // 建立新的排放係數（轉換為標準 EmissionFactor 格式）
  const newFactorData: Omit<EmissionFactor, 'id'> = {
    source: mockL2ProjectInfo.projectName, // 專案名稱已包含「產品碳足跡」，不需重複
    name: formData.factor_name,
    effective_date: `${formData.valid_from}-01-01`,
    continent: geoScope.continent,
    country: geoScope.country,

    // 碳排放數據
    co2_factor: formData.carbon_footprint_value,
    co2_unit: formData.unit,
    value: formData.carbon_footprint_value,
    unit: formData.unit,

    // 年份和方法
    year: parseInt(formData.valid_from),
    method_gwp: 'GWP100',
    source_type: 'project_data',
    version: `v${formData.valid_from}.1`,

    // 詳細資訊
    description,
    notes,

    // 品質和驗證
    data_quality: formData.data_quality,
    validation_status: 'verified',

    // 時間戳（addEmissionFactor 會覆寫這些值）
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // 使用 addEmissionFactor 函數新增到中央係數庫
  const { addEmissionFactor } = require('./mockDatabase')
  const newFactor = addEmissionFactor(newFactorData)

  // 更新產品狀態為已匯入
  const productItem = mockProjectProducts.find((p) => p.id.includes(productId))
  if (productItem) {
    productItem.centralLibStatus = 'imported'
  }

  summary.isImported = true

  console.log(`[handleImportProductToCentral] 產品碳足跡已成功匯入中央係數庫: ID=${newFactor.id}, name="${newFactor.name}"`)

  return newFactor
}