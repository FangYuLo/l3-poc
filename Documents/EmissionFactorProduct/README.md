# 碳排放係數管理系統 (Emission Factor Product)
## 產品功能與系統架構說明文件

---

## 📋 目錄
1. [產品概述](#產品概述)
2. [核心功能架構](#核心功能架構)
3. [系統技術架構](#系統技術架構)
4. [資料模型設計](#資料模型設計)
5. [快速開始](#快速開始)
6. [開發指南](#開發指南)

---

## 產品概述

### 系統定位
類 **Zotero 書目管理系統**風格的企業級碳排放係數管理平台，採用**三欄式介面設計**，專為組織碳盤查（L1）與產品碳足跡（L2）計算提供一站式係數管理解決方案。

### 設計理念
- **書目管理風格**：借鑒 Zotero 的層級導航與詳情檢視模式
- **配置驅動**：表格欄位與顯示邏輯完全配置化，支援快速擴展
- **資料中心化**：統一的 Mock 資料管理層，確保資料一致性
- **版本控制**：係數版本追蹤與專案版本鎖定機制

### 核心價值
1. **大規模係數管理**：模擬 8-10 萬筆排放係數資料庫
2. **多源資料整合**：標準資料庫 + PACT交換 + 供應商係數 + 自建係數
3. **智慧追蹤系統**：係數使用追蹤、專案引用分析、版本歷史
4. **專業碳管理**：支援 ISO 14064、ISO 14067 標準的組織與產品碳盤查

---

## 核心功能架構

### 🏗️ 三欄式使用者介面

#### 左欄 - 樹狀導航 (SidebarTree)
```
結構層級：
├── 中央係數庫
│   └── 全庫搜尋
├── 自建係數
├── 資料集（動態新增）
│   ├── 資料集A
│   └── 資料集B
└── 專案
    ├── L4 - 供應商係數
    ├── L2 - 產品碳足跡
    │   ├── PACT交換
    │   ├── 產品A1 - 智慧型手機
    │   │   ├── 原物料採購
    │   │   ├── 製程加工
    │   │   └── 包裝運輸
    │   ├── 產品A2 - LED燈具
    │   └── 產品A3 - 筆記型電腦
    └── L1 - 組織碳盤查
        ├── 2024年度盤查
        │   ├── Scope 1 直接排放
        │   ├── Scope 2 間接排放
        │   └── Scope 3 其他間接
        ├── 2023年度盤查
        └── 2022年度盤查
```

**特色功能：**
- 動態統計：每個節點顯示包含的係數數量
- 自訂圖示：根據節點類型顯示不同 SVG 圖示
- 資料集管理：點擊 "+" 新增自訂資料集
- 展開收合：支援多層級展開狀態記憶

#### 中欄 - 智慧係數列表 (FactorTable)

**配置驅動表格系統** (`src/config/tableColumns.tsx`)：
```
支援的表格模式：
1. favorites: 中央係數庫（含引用專案追蹤）
2. user_defined: 自建係數（組合係數）
3. pact: PACT交換係數
4. supplier: 供應商係數
5. dataset: 動態資料集
6. global_search: 全庫搜尋（含多維篩選）
7. organizational_inventory: L1組織盤查
8. product_carbon_footprint: L2產品碳足跡
9. project_overview: L2專案概覽
10. inventory_overview: L1盤查概覽
```

**進階功能：**
- **搜尋過濾**：關鍵字即時搜尋
- **分頁導航**：支援 10/20/50 筆/頁，頁碼跳轉
- **多維篩選**（全庫搜尋）：地區/年份/單位/方法學/來源類型
- **空狀態處理**：資料集為空時顯示引導提示

#### 右欄 - 詳情面板 (FactorDetail)

**滑入式詳情檢視**：
```
顯示內容：
├── 基本資訊
│   ├── 係數名稱
│   ├── 排放係數值
│   ├── 單位
│   └── GWP方法學
├── 來源資訊
│   ├── 資料來源
│   ├── 國家/地區
│   ├── 有效日期
│   └── 版本號
├── 組合係數專屬
│   ├── 計算公式類型
│   ├── 組成係數列表
│   └── 權重設定
├── 數據品質
│   ├── 品質等級
│   ├── 驗證狀態
│   └── 品質評分
└── 使用追蹤
    ├── 引用專案列表
    ├── 使用次數統計
    └── 最後使用日期
```

---

### 📊 綜合係數管理

#### 中央係數庫 (Central Library)

**係數來源整合** (`src/hooks/useMockData.ts`):
```typescript
getCentralLibraryFactors() {
  // 1. 專案已使用的標準係數
  // 2. 產品碳足跡係數
  // 3. 從產品碳足跡匯入的係數
  // 合併去重 + 按使用次數排序
}
```

**引用追蹤系統** (`src/data/factorProjectMapping.ts`):
- 追蹤係數在各專案中的使用情況
- 格式化顯示：「用於 2 個專案：產品碳足跡-智慧型手機(1次)、組織盤查-2024(3次)」
- 支援版本鎖定機制

#### 版本控制機制
- 專案建立時鎖定係數版本
- 即使係數資料庫更新，專案計算結果不變
- 支援版本升級提示與一鍵更新

---

### ⚙️ 自建組合係數

#### 組合係數編輯器 (CompositeEditorDrawer)

**計算模式**：
```typescript
formula_type: 'sum' | 'weighted'

// 計算邏輯
computed_value =
  formula_type === 'sum'
    ? Σ(component.value × component.weight)
    : Σ(component.value × component.weight) / Σ(weight)
```

**使用流程**：
1. 選擇基礎係數（從全庫搜尋）
2. 設定權重值
3. 選擇計算公式（加總 or 平均）
4. 即時預覽計算結果
5. 儲存組合係數

---

### 📁 專案管理系統

#### L2 - 產品碳足跡專案

**專案概覽視圖** (`ProjectOverviewView.tsx`):
```
顯示內容：
├── 專案資訊卡片
│   ├── 專案名稱: L2 - 產品碳足跡
│   ├── 最後匯入時間: 2024-03-15 14:30:25
│   ├── 版本: v2024.1
│   ├── 狀態: 🔒已鎖定
│   ├── 產品數量: 3 個
│   ├── PACT產品: 8 個
│   └── [手動同步 L2 專案] 按鈕
└── 產品統整表
    ├── 搜尋與篩選
    └── 產品列表（名稱、碳足跡值、狀態）
```

**產品碳足跡摘要卡片** (`ProductCarbonFootprintCard.tsx`):
```
├── 總碳足跡值: 45.8 kg CO₂e/支
├── 功能單位: 1 支（含包裝，使用3年）
├── 計算標準: ISO 14067:2018
├── 階段分解圓餅圖
│   ├── 原物料: 40% (18.5 kg)
│   ├── 製造: 27% (12.3 kg)
│   ├── 配送: 5% (2.1 kg)
│   ├── 使用: 21% (9.8 kg)
│   └── 廢棄: 7% (3.1 kg)
└── [匯入中央係數庫] 按鈕
```

**匯入中央庫功能**：
- 填寫適用範圍（產品類別、地理範圍、有效期限）
- 設定計算邊界（系統邊界、排除項目）
- 標示數據品質（實測數據佔比、次級資料佔比）
- 轉換為標準 EmissionFactor 格式
- 自動加入中央係數庫

#### L1 - 組織碳盤查專案

**盤查概覽視圖** (`OrganizationalInventoryOverview.tsx`):
```
顯示內容：
├── 專案資訊卡片
│   ├── 專案名稱: L1 - 組織碳盤查
│   ├── 最後匯入時間: 2024-03-15 14:30:25
│   ├── 狀態: 🔒已鎖定
│   ├── 盤查年度數量: 3 個
│   ├── 總排放源數量: 54 個
│   ├── 已匯入中央庫: 2 / 3 年度
│   └── [手動同步 L1 專案] 按鈕
└── 年度盤查統整表
    ├── 年度列表
    ├── 總排放量
    ├── 組織盤查邊界
    ├── 排放源統計（Scope 1/2/3）
    └── 專案與中央庫狀態
```

**組織盤查資料表格**：
| 欄位 | 說明 |
|-----|------|
| 範疇 | Scope 1/2/3（彩色標籤） |
| 子類別名稱 | 固定燃燒/移動燃燒/外購電力等 |
| 排放源名稱 | 具體排放源（如「天然氣鍋爐」） |
| 氣體種類 | CO₂/CH₄/N₂O/HFCs等 |
| 排放係數 | 數值+單位 |
| 係數來源 | ecoinvent/其他 |

---

### 📦 資料集管理

**建立資料集** (`DatasetNameModal.tsx`):
```typescript
interface Dataset {
  id: string
  name: string
  description?: string
  factorIds: number[]      // 包含的係數ID
  created_at: string
  updated_at: string
}
```

**批次加入係數** (`FactorSelectorModal.tsx`):
- Tab 切換：中央係數庫 / 全庫搜尋
- 搜尋與篩選：關鍵字 + 多維度篩選
- 複選框選擇：批次選擇係數
- 自動排除已存在的係數

---

### 🔍 全庫搜尋系統

**進階多維篩選**：
```
[篩選] 按鈕 → 展開篩選面板
├── 地區 (Accordion)
├── 年份 (Accordion)
├── 單位 (Accordion)
├── 方法學 (Accordion)
└── 來源類型 (Accordion)
    ├── 標準資料庫
    ├── PACT交換
    ├── 供應商係數
    ├── 自建係數
    └── 產品碳足跡
```

**動態 Facets 生成**：
- 自動從資料庫提取可用的篩選選項
- 即時更新篩選結果
- 支援多條件 AND 組合

---

## 系統技術架構

### 前端技術棧

```
Framework & Language:
├── Next.js 14 (App Router)
├── TypeScript 5.5.4
└── React 18.3.1

UI & Styling:
├── Chakra UI 2.8.2
├── Emotion (CSS-in-JS)
└── Framer Motion 10.18.0

State Management:
└── Zustand 4.5.2

Icons:
├── Chakra UI Icons
└── React Icons 5.5.0
```

### 專案架構

```
emission-factor-mvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 根佈局
│   │   ├── page.tsx           # 主頁面（三欄式介面）
│   │   └── providers.tsx      # Chakra UI Provider
│   │
│   ├── components/            # UI 組件庫
│   │   ├── SidebarTree.tsx   # 左側樹狀導航
│   │   ├── FactorTable.tsx   # 中間係數列表
│   │   ├── FactorDetail.tsx  # 右側詳情面板
│   │   ├── CompositeEditorDrawer.tsx    # 組合係數編輯器
│   │   ├── FactorSelectorModal.tsx      # 係數選擇器
│   │   ├── ProductCarbonFootprintCard.tsx  # 產品碳足跡卡片
│   │   ├── ProjectOverviewView.tsx      # L2 專案概覽
│   │   ├── OrganizationalInventoryOverview.tsx  # L1 盤查概覽
│   │   └── ...
│   │
│   ├── config/                # 配置驅動系統
│   │   └── tableColumns.tsx  # 表格欄位配置
│   │
│   ├── hooks/                 # React Hooks
│   │   ├── useMockData.ts    # 統一資料管理
│   │   ├── useFactors.ts     # 係數資料邏輯
│   │   └── useComposites.ts  # 組合係數邏輯
│   │
│   ├── data/                  # 資料模組
│   │   ├── mockDatabase.ts            # 模擬資料庫
│   │   ├── mockProjectData.ts         # 專案 Mock 資料
│   │   ├── mockCollections.ts         # 集合 Mock 資料
│   │   └── factorProjectMapping.ts    # 係數引用映射
│   │
│   ├── utils/                 # 工具函數
│   │   └── tableRenderer.tsx # 表格渲染器
│   │
│   ├── types/                 # TypeScript 類型
│   │   └── types.ts          # 系統類型定義
│   │
│   ├── lib/                   # 工具程式庫
│   │   ├── apiClient.ts      # API 客戶端
│   │   ├── constants.ts      # 系統常數
│   │   └── store.ts          # Zustand Store
│   │
│   └── theme/                 # Chakra UI 主題
│       ├── index.ts
│       ├── colors.ts
│       └── components/
│           ├── Button.ts
│           └── Table.ts
│
├── public/                    # 靜態資源
├── package.json
└── tsconfig.json
```

### 配置驅動架構

#### 表格配置系統 (`src/config/tableColumns.tsx`)

**設計理念**：
- **單一真實來源**：所有表格欄位定義集中在一處
- **類型安全**：完整的 TypeScript 類型定義
- **可擴展性**：新增表格模式只需添加配置
- **一致性**：確保所有表格使用統一的渲染邏輯

**配置介面**：
```typescript
interface TableColumnConfig {
  key: string              // 資料鍵值
  label: string            // 欄位標題
  width: string            // 欄位寬度 (%)
  type: 'text' | 'number' | 'badge' | 'date' | 'custom'
  formatter?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  isNumeric?: boolean
}

interface FolderTableConfig {
  folderType: string
  displayName: string
  columns: TableColumnConfig[]
  searchPlaceholder: string
}
```

### 統一資料管理 (`src/hooks/useMockData.ts`)

**架構設計**：
```typescript
export function useMockData() {
  return {
    // 基礎資料
    getAllEmissionFactors: () => EmissionFactor[],
    getEmissionFactorById: (id) => EmissionFactor | undefined,

    // 集合類型
    getFavoriteFactors: () => FactorTableItem[],
    getPactFactors: () => FactorTableItem[],
    getSupplierFactors: () => FactorTableItem[],
    getUserDefinedFactors: () => FactorTableItem[],

    // 搜尋與篩選
    searchFactors: (keyword) => FactorTableItem[],
    getFactorsBySourceType: (type) => FactorTableItem[],

    // 專案資料
    getProjectDataByNodeId: (nodeId) => FactorTableItem[],

    // 中央係數庫（含引用追蹤）
    getCentralLibraryFactors: () => ExtendedFactorTableItem[],

    // 統計資訊
    getCollectionCounts: () => CollectionCounts,
    getSearchFacets: () => SearchFacets
  }
}
```

---

## 資料模型設計

### 核心實體類型

#### EmissionFactor（排放係數）

```typescript
interface EmissionFactor {
  // 識別資訊
  id: number
  name: string
  version: string

  // 地理資訊
  continent: string
  country: string
  region?: string

  // 時間資訊
  effective_date: string
  year?: number
  created_at: string
  updated_at: string

  // 排放數據
  co2_factor: number
  co2_unit: string
  ch4_factor?: number
  n2o_factor?: number
  value: number
  unit: string

  // 方法學
  method_gwp?: string    // GWP100 / GWP20

  // 來源資訊
  source: string
  source_type: SourceType
  source_ref?: string

  // 品質與驗證
  data_quality: DataQuality
  validation_status?: ValidationStatus
  quality_score?: number

  // 詳細資訊
  description?: string
  notes?: string

  // 使用追蹤
  usage_info?: FactorUsageInfo
}
```

#### CompositeFactor（組合係數）

```typescript
interface CompositeFactor {
  id: number
  name: string
  formula_type: 'sum' | 'weighted'
  computed_value: number
  unit: string
  components: CompositeFactorComponent[]
  data_quality: DataQuality
  usage_info?: FactorUsageInfo
}
```

#### ProductFootprintFactor（產品碳足跡係數）

```typescript
interface ProductFootprintFactor extends EmissionFactor {
  footprint_type: 'product_footprint'
  functional_unit: string
  product_name: string
  product_categories: string[]
  geographic_scope: string
  system_boundary: 'cradle_to_grave' | 'cradle_to_gate' | 'gate_to_gate'
  stage_breakdown: {
    raw_material: number
    manufacturing: number
    distribution: number
    use: number
    disposal: number
  }
  calculation_standard: string
  source_project_name: string
}
```

### 資料關係圖

```
係數引用追蹤系統：
factorProjectMapping.ts
  ↓
useMockData.ts (getCentralLibraryFactors)
  ↓
FactorTable.tsx
  ↓
顯示：引用專案資訊
```

---

## 快速開始

### 環境需求
- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安裝依賴
```bash
npm install
```

### 環境設定
```bash
cp .env.example .env.local
```

### 開發模式
```bash
npm run dev
```
開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 建置專案
```bash
npm run build
npm start
```

### 類型檢查
```bash
npm run type-check
```

### Lint 檢查
```bash
npm run lint
```

---

## 開發指南

### Mock 資料
目前使用 Mock 資料進行開發，包含：
- 模擬 API 回應
- 假資料生成
- 延遲模擬

### 類型安全
- 完整的 TypeScript 類型定義
- 嚴格的類型檢查
- 型別推論和自動完成

### 效能最佳化
- React.memo 和 useMemo 防止不必要的重渲染
- 分頁機制減少 DOM 節點數量
- 篩選計算在 useMemo 中快取結果

### 可訪問性
- 鍵盤導航支援
- 螢幕閱讀器友好
- ARIA 標籤和語意 HTML

---

## 🎯 核心功能演示

### 1. 查看產品碳足跡

```
步驟 1: 選擇專案
   左側樹狀導航 → 點擊「L2 - 產品碳足跡」
   ↓ 顯示專案概覽

步驟 2: 檢視專案概覽
   中間面板顯示：
   ├── 專案資訊卡片
   ├── 產品統整表
   └── [手動同步 L2 專案] 按鈕

步驟 3: 查看產品詳情
   點擊「A1 - 智慧型手機」的 [查看] 按鈕
   ↓ 導航到 product_1_1 節點

步驟 4: 檢視產品生命週期清單
   ├── 產品碳足跡摘要卡片
   └── 生命週期清單表格
```

### 2. 建立組合係數

```
步驟 1: 導航到自建係數
步驟 2: 開啟組合係數編輯器
步驟 3: 輸入基本資訊
步驟 4: 選擇組成係數
步驟 5: 預覽與儲存
```

### 3. 從產品碳足跡匯入中央庫

```
步驟 1: 導航到產品節點
步驟 2: 點擊匯入按鈕
步驟 3: 填寫適用範圍與品質資訊
步驟 4: 確認匯入
步驟 5: 驗證結果
```

---

## 🚀 後續開發計劃

### Phase 1: 完整後端整合
- PostgreSQL + Prisma ORM
- RESTful API 實作
- JWT 認證授權
- 檔案上傳功能
- Redis 快取策略

### Phase 2: 進階功能開發
- 批次操作
- Excel/CSV 匯入匯出
- 係數比較
- 使用統計分析
- 計算引擎
- 報表系統

### Phase 3: 協作與工作流
- 多使用者協作
- 評論註解
- 變更歷史
- 通知系統
- 審核工作流
- 權限管理

### Phase 4: 整合與生態
- 第三方資料庫整合（EPA、IPCC）
- GraphQL API
- PWA / 行動端支援
- 離線模式
- AI 輔助推薦

### Phase 5: 企業級功能
- 多租戶架構
- 高可用性
- ISO 14064 / GHG Protocol 認證
- ERP / PLM 整合
- 機器學習預測

---

## 📊 技術亮點

### ✅ 核心優勢

1. **可維護性**
   - 配置驅動表格系統
   - 統一資料管理層
   - 清晰的模組職責分離

2. **可擴展性**
   - 新增表格模式僅需添加配置
   - TypeScript 類型定義完整
   - 模組化設計易於擴展

3. **效能最佳化**
   - React.memo 與 useMemo
   - 分頁機制
   - 篩選結果快取

4. **使用者體驗**
   - 三欄式直覺導航
   - 即時搜尋與篩選
   - 平滑動畫與視覺回饋

---

## 授權條款

MIT License

---

## 👥 開發團隊

- **系統架構**：基於企業級碳管理需求設計
- **前端開發**：採用現代化 React 生態系統
- **UI/UX設計**：參考書目管理系統的使用者體驗

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request：

1. **Bug 回報**：使用 GitHub Issues 回報問題
2. **功能建議**：提出新功能需求
3. **程式碼貢獻**：Fork 專案後提交 Pull Request
4. **文件改善**：改善文件說明和範例

### 開發規範
- 遵循 ESLint 和 TypeScript 規範
- 提交前執行 `npm run lint` 和 `npm run type-check`
- Commit 訊息遵循 Conventional Commits 規範
- 新增功能需包含類型定義

---

**文件版本**: v2.0
**最後更新**: 2025-01-10
**系統版本**: v2024.1

**Emission Factor Management System** - 讓碳管理更簡單、更精確 🌱
