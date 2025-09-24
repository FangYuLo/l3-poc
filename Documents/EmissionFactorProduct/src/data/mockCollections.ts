// 定義各類型係數的集合歸類
// 這些ID對應 mockDatabase.ts 中的係數ID

// 常用係數集合 - 用戶最常使用的係數
export const favoriteFactorIds: number[] = [
  1,   // 英國-石油產品
  2,   // 台電電力排放係數
  3,   // 美國-電力-全國平均
  10,  // 航空運輸-國內短程
  11,  // 汽車運輸-小客車
  20,  // 鋼鐵-普通鋼材
  21,  // 水泥-普通矽酸鹽
  22,  // 塑膠-聚乙烯
  30,  // 牛肉-全球平均
  5,   // 日本-電力-全國平均
  4,   // 中國-電力-全國電網
  12,  // 海運-貨櫃船
]

// PACT交換係數集合 - 來自PACT網路的係數
export const pactFactorIds: number[] = [
  100, // PACT-工業馬達
  101, // PACT-化學品-聚合物樹脂
  102, // PACT-汽車零件-鋁合金輪圈
  103, // PACT-電子零件-晶片封裝
  104, // PACT-建材-預製混凝土
  105, // PACT-紡織-有機棉布
  106, // PACT-包裝-可回收紙箱
  107, // PACT-能源設備-太陽能板
]

// 供應商係數集合 - 來自供應商提供的專有係數
export const supplierFactorIds: number[] = [
  200, // 台積電-晶圓製造-12nm
  201, // 鴻海-電子組裝-SMT
  202, // 中鋼-特殊鋼材-高強度
  203, // 台塑-石化產品-PP樹脂
  204, // 聯電-晶圓製造-28nm
  205, // 和碩-筆電組裝-標準製程
  206, // 日月光-IC封裝-BGA封裝
  207, // 台化-化纖產品-聚酯纖維
  208, // 中油-石化基礎原料-乙烯
  209, // 台泥-水泥製品-高性能混凝土
  210, // 富士康-精密機械-CNC加工
  211, // 宏碁-電腦組裝-桌上型電腦
  212, // 華碩-主機板製造-標準ATX
  213, // 聯發科-晶片設計-5G晶片
  214, // 台達電-電源供應器-高效率
  215, // 研華-工控設備-嵌入式系統
  216, // 緯創-ODM製造-智慧手機
  217, // 仁寶-筆電代工-超薄型
  218, // 英業達-伺服器製造-雲端級
  219, // 廣達-雲端設備-資料中心
  220, // 和舰-面板製造-OLED面板
  221, // 友達-LCD面板-高解析度
  222, // 群創-顯示技術-觸控面板
  223, // 南亞-塑化產品-工程塑膠
  224, // 長春-石化材料-特用化學品
  225, // 奇美-材料科技-光學薄膜
]

// 組合係數ID集合 - 用戶自建的組合係數
export const compositeFactorIds: number[] = [
  1001, // 筆記型電腦組裝製程
  1002, // 混合動力車輛製造
  1003, // 智慧手機生產線
  1004, // 太陽能發電系統
  1005, // 電動車電池組
  1006, // 資料中心機櫃
  1007, // LED照明設備
  1008, // 風力發電機組
  1009, // 工業機器人系統
  1010, // 5G基站設備
]

// 係數類型對應表
export const factorTypeMapping = {
  favorites: favoriteFactorIds,
  pact: pactFactorIds,
  supplier: supplierFactorIds,
  composite: compositeFactorIds,
} as const

// 取得各類型係數的數量
export function getCollectionCounts() {
  return {
    favorites: favoriteFactorIds.length,
    pact: pactFactorIds.length,
    supplier: supplierFactorIds.length,
    composite: compositeFactorIds.length,
  }
}

// 檢查係數是否屬於特定類型
export function isFactorInCollection(factorId: number, collection: keyof typeof factorTypeMapping): boolean {
  return factorTypeMapping[collection].includes(factorId)
}

// 取得係數所屬的集合類型
export function getFactorCollectionTypes(factorId: number): string[] {
  const types: string[] = []
  
  if (favoriteFactorIds.includes(factorId)) types.push('favorites')
  if (pactFactorIds.includes(factorId)) types.push('pact')
  if (supplierFactorIds.includes(factorId)) types.push('supplier')
  if (compositeFactorIds.includes(factorId)) types.push('composite')
  
  return types
}