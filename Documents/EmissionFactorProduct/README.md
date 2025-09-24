# Emission Factor Management System

一個基於書目管理系統風格的碳排放係數管理平台，採用三欄式介面設計，支援組織碳盤查和產品碳足跡計算。

## 🌟 核心功能

### 🏗️ 三欄式介面架構
- **左欄**：樹狀資料夾導航（常用係數、自建係數、PACT交換、供應商係數、專案管理、資料集）
- **中欄**：智慧係數列表，支援搜尋、分頁、多重篩選
- **右欄**：詳情面板，顯示係數完整資訊、版本歷史、使用追蹤

### 📊 綜合係數管理
- **資料庫瀏覽**：模擬 8-10 萬筆排放係數資料庫
- **多源整合**：標準資料庫、PACT交換、供應商係數、自建係數
- **版本控制**：版本升級提示、歷史追蹤、版本鎖定
- **智慧分類**：收藏夾管理、標籤分類、使用頻率統計

### 🔍 進階搜尋與篩選
- **全庫搜尋**：跨平台關鍵字搜尋
- **多維度篩選**：地區、年份、單位、方法學 (GWP)、來源類型
- **即時統計**：搜尋結果即時統計與分析
- **搜尋記錄**：搜尋歷史與快速重複搜尋

### ⚙️ 自建組合係數
- **多係數組合**：支援複雜的係數組合計算
- **計算模式**：權重平均、權重加總兩種計算方式
- **即時預覽**：編輯時即時計算結果預覽
- **版本管理**：組合係數的版本控制與更新

### 📁 專案管理系統
- **層級結構**：專案 → 產品/年度 → 排放源的完整層級
- **係數引用**：係數與專案的關聯追蹤
- **版本鎖定**：專案係數版本固定，避免計算結果變動
- **使用追蹤**：係數在各專案中的使用情況分析

### 🏢 組織碳盤查支援
- **範疇分類**：Scope 1、Scope 2、Scope 3 完整支援
- **排放源管理**：固定燃燒源、移動燃燒源、外購電力等分類
- **活動數據**：支援多種單位的活動數據輸入
- **誤差等級**：六級誤差等級選擇與管理
- **年度盤查**：支援多年度碳盤查資料管理

### 🛍️ 產品碳足跡計算
- **生命週期**：原物料、製造、配送、使用、廢棄五階段
- **產品清單**：詳細的產品生命週期清單管理
- **階段分析**：各階段碳排放詳細追蹤
- **規格管理**：產品數量規格與補充資訊記錄

### 📦 資料集管理
- **自定義資料集**：建立專案或主題導向的係數集合
- **係數收藏**：從全庫搜尋選擇係數加入資料集
- **團隊協作**：資料集分享與協作功能
- **批次操作**：批次加入、移除、更新係數

## 技術架構

### 前端技術棧
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **State Management**: Zustand
- **Icons**: Chakra UI Icons

### 📁 專案架構
```
emission-factor-mvp/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx              # 根佈局 (多語言支援)
│   │   ├── page.tsx                # 主頁面 (三欄式介面)
│   │   └── providers.tsx           # 全域 Provider (Chakra UI)
│   ├── components/                 # UI 組件庫
│   │   ├── SidebarTree.tsx         # 左側樹狀導航
│   │   ├── FactorTable.tsx         # 中間係數列表 (支援多種表格模式)
│   │   ├── FactorDetail.tsx        # 右側詳情面板
│   │   ├── GlobalSearchModal.tsx   # 全庫搜尋 Modal (多模式)
│   │   ├── CompositeEditorDrawer.tsx  # 組合係數編輯器
│   │   ├── DatasetNameModal.tsx    # 資料集命名 Modal
│   │   ├── DeleteConfirmDialog.tsx # 刪除確認對話框
│   │   ├── FactorSelectorModal.tsx # 係數選擇器 Modal
│   │   ├── EmissionFactorCards.tsx # 係數卡片檢視
│   │   ├── LoadingSkeleton.tsx     # 載入骨架動畫
│   │   └── EmptyState.tsx          # 空狀態提示
│   ├── hooks/                      # React Hooks
│   │   ├── useCollections.ts       # 收藏集合管理
│   │   ├── useFactors.ts          # 係數資料管理
│   │   ├── useComposites.ts       # 組合係數管理
│   │   └── useMockData.ts         # Mock 資料管理
│   ├── data/                       # 資料模組
│   │   ├── mockDatabase.ts         # 模擬資料庫
│   │   ├── mockCollections.ts      # 模擬收藏集合
│   │   ├── mockProjectData.ts      # 模擬專案資料
│   │   └── factorProjectMapping.ts # 係數專案對應關係
│   ├── lib/                        # 工具程式庫
│   │   ├── apiClient.ts           # API 客戶端
│   │   ├── constants.ts           # 系統常數
│   │   ├── utils.ts               # 工具函數
│   │   └── store.ts               # Zustand 狀態管理
│   ├── types/                      # TypeScript 類型
│   │   └── types.ts               # 系統類型定義
│   └── theme/                      # Chakra UI 主題
│       ├── index.ts               # 主題入口
│       ├── colors.ts              # 品牌色彩
│       ├── foundations/           # 基礎主題
│       └── components/            # 組件主題
│           ├── Button.ts          # 按鈕主題
│           └── Table.ts           # 表格主題
├── public/                         # 靜態資源
├── .env.example                   # 環境變數範例
├── package.json                   # 依賴管理
├── tsconfig.json                  # TypeScript 配置
├── next.config.mjs               # Next.js 配置
└── README.md                     # 專案說明
```

## 快速開始

### 環境需求
- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安裝依賴
```bash
npm install
```

### 環境設定
1. 複製環境變數檔案：
```bash
cp .env.example .env.local
```

2. 設定 API 基礎 URL（可選）：
```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:3001
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

## 🎯 核心功能演示

### 1. 📁 資料夾導航與係數瀏覽
- **樹狀導航**：點擊左側資料夾節點，中間列表顯示對應係數
- **專案檢視**：選擇專案節點查看該專案引用的所有係數
- **排放源檢視**：點擊排放源節點查看該排放源的係數清單
- **智慧過濾**：根據節點類型自動切換表格模式（一般係數、組織盤查、產品碳足跡）

### 2. 🔍 全庫搜尋與篩選
- **快速搜尋**：頂部「全庫搜尋 🌍」按鈕開啟全庫搜尋 Modal
- **智慧篩選**：支援關鍵字搜尋和多維度篩選條件
- **即時操作**：搜尋結果可直接操作 - 加入常用、引用到專案、加入組合、加入資料集
- **搜尋模式**：支援一般搜尋模式和資料集新增模式

### 3. 📊 係數詳情檢視
- **詳情面板**：點擊係數，右側面板顯示完整資訊
- **多層資訊**：基本資訊、來源資訊、版本歷史、使用統計
- **組合係數**：特別顯示組合係數的組成明細和計算公式
- **動態更新**：資訊隨選擇係數即時更新

### 4. ⚙️ 自建組合係數
- **建立入口**：左側「+新增係數」→「自建組合係數」或全庫搜尋「加入組合」
- **智慧編輯器**：拖拉式組合係數編輯器，支援即時預覽
- **計算模式**：選擇權重平均或權重加總計算方式
- **版本管理**：自動版本控制，支援編輯和更新

### 5. 📦 資料集管理
- **建立資料集**：左側「+新增資料集」建立主題導向的係數集合
- **係數收藏**：從全庫搜尋選擇係數加入指定資料集
- **集合檢視**：選擇資料集節點檢視包含的所有係數
- **批次管理**：支援批次新增、移除資料集中的係數

### 6. 🏢 組織碳盤查功能
- **範疇管理**：自動依 Scope 1/2/3 分類顯示排放源
- **排放源編輯**：支援活動數據輸入和係數選擇
- **誤差等級**：六級誤差等級下拉選擇和即時更新
- **年度檢視**：支援多年度碳盤查資料檢視和比較

### 7. 🛍️ 產品碳足跡功能
- **生命週期檢視**：依五階段（原物料、製造、配送、使用、廢棄）顯示
- **階段分析**：各階段碳排放清單詳細檢視
- **規格管理**：產品數量規格和補充資訊即時編輯
- **係數追蹤**：追蹤各階段使用的係數選擇

### 8. 🎛️ 進階係數操作
- **收藏管理**：將係數加入常用資料夾，支援標籤分類
- **專案引用**：將係數關聯到特定專案的排放源，建立引用關係
- **版本升級**：檢視歷史版本，一鍵升級到新版本
- **使用追蹤**：查看係數在各專案、組合、資料集中的使用情況
- **刪除保護**：刪除自建係數前檢查使用狀況，避免誤刪

## 📊 資料模型

### 核心實體
- **EmissionFactor**: 排放係數 (基礎係數資料)
- **CompositeFactor**: 組合係數 (多係數組合計算)
- **Project**: 專案 (組織盤查/產品碳足跡專案)
- **EmissionSource**: 排放源 (專案下的具體排放源)
- **Collection**: 收藏集合 (常用係數、標籤分類)
- **Dataset**: 資料集 (主題導向的係數集合)
- **ProjectFactorLink**: 專案係數連結 (版本鎖定關係)
- **OrganizationalInventory**: 組織盤查資料 (範疇、排放源、活動數據)
- **ProductCarbonFootprint**: 產品碳足跡資料 (生命週期階段清單)

### 資料關係
```
Project (專案)
├── EmissionSource (排放源)
│   ├── ProjectFactorLink → EmissionFactor (係數引用)
│   └── ActivityData (活動數據)
├── OrganizationalInventory (組織盤查)
│   ├── Scope 1/2/3 分類
│   └── ErrorLevel (誤差等級)
└── ProductCarbonFootprint (產品碳足跡)
    ├── LifecycleStage (生命週期階段)
    └── ProductSpecification (產品規格)

Collection (收藏集合)
├── UserDefined (自建係數)
├── Favorites (常用係數)
├── PACT (PACT交換)
└── Supplier (供應商係數)

Dataset (資料集)
├── FactorIds[] (包含的係數ID)
├── Metadata (資料集元資料)
└── CollaborationSettings (協作設定)

CompositeFactor (組合係數)
├── Components[] → EmissionFactor (組成係數)
├── CalculationMethod (計算方式)
└── WeightingFactors (權重設定)
```

### 資料流程
1. **瀏覽流程**: 使用者選擇左側節點 → 載入對應係數資料 → 中間列表顯示 → 點擊係數顯示詳情
2. **搜尋流程**: 全庫搜尋 → 多維度篩選 → 結果操作 (收藏/引用/組合/加入資料集)
3. **專案流程**: 建立專案 → 添加排放源 → 選擇係數 → 版本鎖定 → 計算結果
4. **組合流程**: 選擇基礎係數 → 設定權重 → 選擇計算方式 → 即時預覽 → 儲存組合係數
5. **資料集流程**: 建立資料集 → 從全庫選擇係數 → 批次加入 → 團隊分享

## 狀態管理

使用 Zustand 進行全域狀態管理：

- **導航狀態**: 當前選中節點、展開節點
- **資料狀態**: 當前係數列表、選中係數
- **UI 狀態**: Modal 開關、載入狀態
- **搜尋狀態**: 搜尋結果、篩選條件
- **組合編輯**: 組成係數、計算公式

## API 設計

### 主要端點
- `GET /api/emission-factors` - 取得排放係數列表
- `POST /api/emission-factors/search` - 搜尋排放係數
- `GET /api/composite-factors` - 取得組合係數列表
- `POST /api/composite-factors` - 建立組合係數
- `GET /api/collections` - 取得收藏集合
- `GET /api/projects` - 取得專案列表

### API 客戶端
統一的 API 客戶端處理：
- 請求/回應格式化
- 錯誤處理
- TypeScript 類型支援

## 主題系統

基於 Chakra UI 的客製化主題：
- **品牌色彩**: 藍色系主色調
- **語意色彩**: 成功、警告、錯誤狀態
- **組件主題**: Button、Table 等組件樣式
- **響應式設計**: 支援不同螢幕尺寸

## 開發注意事項

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
- 虛擬化列表（大資料集）
- 懶載入和程式碼分割

### 可訪問性
- 鍵盤導航支援
- 螢幕閱讀器友好
- ARIA 標籤和語意 HTML

## 🚀 後續開發計劃

### Phase 1: 完整後端整合 (Q1)
- **資料庫實作**: PostgreSQL + Prisma ORM
- **API 端點**: RESTful API 完整實作
- **認證授權**: JWT + Role-based access control
- **檔案上傳**: 係數資料批次匯入功能
- **快取策略**: Redis 快取提升查詢效能

### Phase 2: 進階功能開發 (Q2)
- **批次操作**: 多選係數批次加入、移除、編輯
- **資料匯入匯出**: Excel/CSV 格式支援
- **係數比較**: 並排比較多個係數差異
- **使用統計**: 係數使用頻率、趨勢分析
- **計算引擎**: 碳排放計算結果即時預覽
- **報表系統**: 專案碳盤查報表產生

### Phase 3: 協作與工作流 (Q3)
- **多使用者協作**: 即時協作編輯
- **評論註解**: 係數評論、版本註解
- **變更歷史**: 完整的變更追蹤與版本控制
- **通知系統**: 係數更新、專案變更通知
- **工作流**: 係數審核、發布工作流
- **權限管理**: 細粒度的權限控制

### Phase 4: 整合與生態 (Q4)
- **第三方整合**:
  - EPA排放係數資料庫
  - IPCC係數資料
  - 國際碳足跡資料庫
- **API開放平台**:
  - GraphQL API
  - Webhook 支援
  - 開發者工具
- **行動端支援**:
  - PWA 漸進式網頁應用
  - 原生 App (React Native)
- **離線模式**: 本地資料同步
- **AI輔助**: 智慧係數推薦、自動分類

### Phase 5: 企業級功能 (Q1 Next Year)
- **多租戶架構**: SaaS 多組織支援
- **高可用性**: 負載平衡、災難恢復
- **合規認證**: ISO 14064、GHG Protocol 認證
- **整合平台**: ERP、PLM 系統整合
- **機器學習**: 係數預測、異常檢測

## 授權條款

MIT License

## 👥 開發團隊

- **系統架構**: 基於企業級碳管理需求設計
- **前端開發**: 採用現代化 React 生態系統
- **UI/UX設計**: 參考書目管理系統的使用者體驗

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改善這個專案：

1. **Bug 回報**: 使用 GitHub Issues 回報問題
2. **功能建議**: 提出新功能的需求和建議
3. **程式碼貢獻**: Fork 專案後提交 Pull Request
4. **文件改善**: 改善文件說明和範例

### 開發規範
- 遵循 ESLint 和 TypeScript 規範
- 提交前請執行 `npm run lint` 和 `npm run type-check`
- Commit 訊息使用英文，遵循 Conventional Commits 規範
- 新增功能需包含對應的類型定義

## 📞 聯絡資訊

- **專案首頁**: [GitHub Repository](https://github.com/your-org/emission-factor-mvp)
- **問題回報**: [GitHub Issues](https://github.com/your-org/emission-factor-mvp/issues)
- **功能討論**: [GitHub Discussions](https://github.com/your-org/emission-factor-mvp/discussions)

---

更多詳細資訊請參考各個模組的程式碼註解和類型定義。
如有任何問題，歡迎透過 GitHub Issues 與我們聯絡。

**Emission Factor Management System** - 讓碳管理更簡單、更精確 🌱