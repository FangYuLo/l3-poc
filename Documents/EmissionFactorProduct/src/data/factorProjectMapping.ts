// 係數與專案引用關係對應表
// 這個檔案建立係數ID與專案使用情況的對應關係

import { getAllEmissionFactors } from './mockDatabase'
import { mockProductCarbonFootprintData, mockOrganizationalInventoryData } from './mockProjectData'

// 專案引用資訊介面
export interface FactorUsage {
  factorId: number
  factorName: string
  usedInProjects: ProjectUsage[]
}

export interface ProjectUsage {
  projectId: string
  projectName: string
  productName?: string
  year?: number
  scope?: string
  stage?: string
  usageCount: number
}

// 建立factor_selection文字與係數ID的對應關係
const factorSelectionToIdMap: Record<string, number> = {
  // 能源相關係數 - 電力
  '臺灣電力-工業用-2024 v2.2': 2,
  '臺灣電力-家用-2024 v2.0': 2,
  '臺灣電力-2024': 2,
  '臺灣電力-2023': 2,
  '臺灣電力-2022': 2,

  // 能源相關係數 - 天然氣
  '臺灣-天然氣-工業用-2024': 6,
  '臺灣-天然氣-工業用-2023': 7,
  '臺灣-天然氣-工業用-2022': 8,

  // 能源相關係數 - 汽油
  '臺灣-汽油-車用-2024': 13,
  '臺灣-汽油-車用-2023': 14,
  '臺灣-汽油-車用-2022': 15,

  // 能源相關係數 - 柴油
  '臺灣-柴油-2024': 16,
  '臺灣-柴油-2023': 17,
  '臺灣-柴油-2022': 18,

  // 材料相關係數
  '鋁合金-初級生產-2024 v2.1': 120,
  '鋁合金-擠型-2024 v1.8': 121,
  '鋁合金-壓鑄-2024 v1.6': 122,
  '鋁合金-精密加工-2024 v2.3': 123,
  'ABS塑膠-石化原料-2024 v1.3': 22,
  '光學塑膠-PC-2024 v1.2': 126,
  '特殊玻璃-強化-2024 v1.2': 124,

  // 電子零件相關
  '半導體-先進製程-2024 v1.8': 125,
  'LED半導體-2024 v2.0': 127,
  '電子電源-小型-2024 v1.5': 201,
  'LCD面板-大尺寸-2024 v1.7': 128,
  'PCB電路板-多層-2024 v2.1': 129,
  '記憶體-DDR4-2024 v1.4': 130,

  // 電池相關
  '鋰電池-消費電子-2024 v3.1': 3,
  '鋰電池-筆電用-2024 v2.5': 3,

  // 運輸相關
  '海運-貨櫃-2024 v1.5': 12,
  '電動貨車-商用-2024 v1.0': 11,
  '貨運-中型卡車-2024 v1.1': 11,
  '航空貨運-國際-2024 v1.6': 10,
  '貨運-陸運-柴油卡車-2024': 19,
  '貨運-陸運-柴油卡車-2023': 23,
  '貨運-陸運-柴油卡車-2022': 24,
  '大眾運輸-捷運-2024': 25,
  '大眾運輸-捷運-2023': 26,
  '大眾運輸-捷運-2022': 27,
  '航空運輸-國內-2024': 28,
  '航空運輸-國內-2023': 29,
  '航空運輸-國內-2022': 31,

  // 包裝材料
  '包裝材料-混合-2024 v1.1': 21,
  '包裝材料-筆電用-2024 v1.2': 21,
  '紙類包材-瓦楞紙-2024 v1.3': 21,

  // 服務相關
  '數位服務-行動通信-2024 v1.3': 5,
  '雲端服務-資料中心-2024 v1.8': 5,

  // 廢料處理
  '電子廢料-回收處理-2024 v1.4': 30,
  '包裝廢料-混合處理-2024 v1.2': 30,
  '廢料運輸-回收車-2024 v1.0': 11,
  '金屬廢料-鋁回收-2024 v1.5': 30,
  '電子廢料-小型-2024 v1.3': 30,
  '金屬廢料-混合-2024 v1.8': 30,
  '電子廢料-筆電-2024 v1.5': 30,
  '危險廢料-鋰電池-2024 v1.3': 30,
  '一般廢棄物-焚化-2024': 152,
  '一般廢棄物-焚化-2023': 153,
  '一般廢棄物-焚化-2022': 154,

  // 其他工業製程
  'LED維護-小零件-2024 v1.0': 4,
  '化工製程-有機溶劑-2024': 131,
  '化工製程-有機溶劑-2023': 132,
  '化工製程-有機溶劑-2022': 133,
  '冷媒-R134a-2024': 134,
  '冷媒-R134a-2023': 135,
  '冷媒-R134a-2022': 136,
  '廢水處理-厭氧-2024': 137,
  '廢水處理-厭氧-2023': 138,
  '廢水處理-厭氧-2022': 139,
  '工業蒸氣-外購-2024': 140,
  '工業蒸氣-外購-2023': 141,
  '工業蒸氣-外購-2022': 142,
  '冷凍能-外購-2024': 143,
  '冷凍能-外購-2023': 144,
  '冷凍能-外購-2022': 145,
  '熱能-外購-2024': 146,
  '熱能-外購-2023': 147,
  '熱能-外購-2022': 148,
  '自來水-處理-2024': 149,
  '自來水-處理-2023': 150,
  '自來水-處理-2022': 151,

}

/**
 * 根據factor_selection文字取得係數ID
 */
export function getFactorIdBySelection(factorSelection: string): number | null {
  return factorSelectionToIdMap[factorSelection] || null
}

/**
 * 根據factor_selection文字取得完整的排放係數物件
 */
export function getEmissionFactorBySelection(factorSelection: string): ReturnType<typeof getAllEmissionFactors>[0] | null {
  const factorId = getFactorIdBySelection(factorSelection)
  if (!factorId) return null

  return getAllEmissionFactors().find(factor => factor.id === factorId) || null
}

/**
 * 計算每個係數的專案使用情況
 */
export function calculateFactorUsage(): FactorUsage[] {
  const usageMap = new Map<number, FactorUsage>()

  // 初始化所有係數的使用情況
  getAllEmissionFactors().forEach(factor => {
    usageMap.set(factor.id, {
      factorId: factor.id,
      factorName: factor.name,
      usedInProjects: []
    })
  })

  // 統計產品碳足跡專案中的使用情況
  mockProductCarbonFootprintData.forEach(item => {
    const factorId = getFactorIdBySelection(item.factor_selection)
    if (factorId && usageMap.has(factorId)) {
      const usage = usageMap.get(factorId)!
      
      // 尋找是否已經有相同專案的記錄
      let projectUsage = usage.usedInProjects.find(p => 
        p.projectId === 'project_1' && 
        p.productName === getProductDisplayName(item.product!) &&
        p.stage === item.stage
      )
      
      if (projectUsage) {
        projectUsage.usageCount++
      } else {
        usage.usedInProjects.push({
          projectId: 'project_1',
          projectName: 'L2 - 產品碳足跡',
          productName: getProductDisplayName(item.product!),
          year: item.year,
          stage: item.stage,
          usageCount: 1
        })
      }
    }
  })

  // 統計組織盤查專案中的使用情況
  mockOrganizationalInventoryData.forEach(item => {
    const factorId = getFactorIdBySelection(item.factor_selection)
    if (factorId && usageMap.has(factorId)) {
      const usage = usageMap.get(factorId)!
      
      // 尋找是否已經有相同專案的記錄
      let projectUsage = usage.usedInProjects.find(p => 
        p.projectId === 'project_2' && 
        p.year === item.year &&
        p.scope === item.scope
      )
      
      if (projectUsage) {
        projectUsage.usageCount++
      } else {
        usage.usedInProjects.push({
          projectId: 'project_2',
          projectName: 'L1 - 組織碳盤查',
          year: item.year,
          scope: item.scope,
          usageCount: 1
        })
      }
    }
  })

  return Array.from(usageMap.values()).filter(usage => usage.usedInProjects.length > 0)
}

/**
 * 取得產品顯示名稱
 */
function getProductDisplayName(product: string): string {
  switch (product) {
    case 'smartphone': return '智慧型手機'
    case 'led_light': return 'LED燈具'  
    case 'laptop': return '筆記型電腦'
    default: return product
  }
}

/**
 * 根據係數ID取得專案使用情況
 */
export function getFactorUsageById(factorId: number): ProjectUsage[] {
  const allUsage = calculateFactorUsage()
  const usage = allUsage.find(u => u.factorId === factorId)
  return usage ? usage.usedInProjects : []
}

/**
 * 取得所有被專案使用的係數
 */
export function getAllUsedFactors(): FactorUsage[] {
  return calculateFactorUsage()
}

/**
 * 格式化專案使用情況文字
 */
export function formatProjectUsage(usage: ProjectUsage[]): string {
  if (usage.length === 0) return '未被使用'
  
  const projectNames = usage.map(u => {
    let name = u.projectName
    if (u.productName) name += ` (${u.productName})`
    if (u.year) name += ` ${u.year}年`
    if (u.scope) name += ` ${u.scope}`
    if (u.stage) name += ` ${u.stage}`
    return name
  })
  
  return projectNames.join(', ')
}