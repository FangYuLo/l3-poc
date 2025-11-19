# 執行摘要：從中央係數庫移除功能全面分析

## 快速概覽

**功能名稱**: 從中央係數庫移除 (Remove From Central Library)

**功能範圍**: 允許用戶移除任何類型的係數從中央係數庫中

**狀態**: 已實現，存在 Bug（移除後仍顯示）

**問題嚴重性**: 高（影響用戶體驗）

---

## 核心要點總結

### 1. 移除的兩種機制

#### 機制 A: 硬刪除（Hard Delete）
- **適用**: 自建組合係數
- **操作**: `importedCompositeFactors.splice(index, 1)`
- **效果**: 直接從陣列中刪除，數據完全消失
- **源碼**: `/src/hooks/useMockData.ts:111`

#### 機制 B: 軟刪除（Soft Delete）
- **適用**: 所有其他類型係數
- **操作**: `removedFromCentralIds.add(factor.id)`
- **效果**: 標記為已移除，實際數據保留
- **源碼**: `/src/hooks/useMockData.ts:140`

### 2. 三個關鍵存儲

```
┌─────────────────────────────────────────────────────────┐
│ userDefinedCompositeFactors                             │
│ - 用戶創建的自建組合係數                                │
│ - 包含 imported_to_central 標記                         │
│ - 可以導入到中央庫                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ importedCompositeFactors                                │
│ - 已匯入中央庫的自建組合係數副本                        │
│ - 包含 source_composite_id 指向原始係數                │
│ - 移除時直接刪除                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ removedFromCentralIds                                   │
│ - 黑名單：已移除係數的 ID                              │
│ - 用於過濾中央庫列表                                    │
│ - 頁面刷新時被清空（Bug！）                             │
└─────────────────────────────────────────────────────────┘
```

### 3. 自建係數的完整生命週期

```
創建               匯入               移除
  │                │                  │
  ├─ 新增          ├─ 設置元數據      ├─ 硬刪除中央副本
  ├─ imported_to_  ├─ imported_to_    ├─ 恢復自建狀態
  │  central: ❌  │  central: ✅      │  imported_to_
  │                ├─ central_library_│  central: ❌
  │                │  id: 中央ID      │
  │                └─ imported_at:時間└─ 可再次匯入或刪除
  │
  └─ 刪除
     └─ 硬刪除自建係數（只能在未匯入狀態）
```

---

## 移除流程概述

### 用戶操作流程

```
1️⃣  中央庫列表選擇係數
    └─ 點擊"從中央係數庫移除"按鈕
       
2️⃣  打開確認對話框
    └─ 顯示係數信息、移除影響、使用情況
       
3️⃣  用戶確認移除
    └─ 調用 removeFromCentralLibrary()
       
4️⃣  移除邏輯執行
    ├─ 自建係數 → 硬刪除 + 狀態恢復
    └─ 其他係數 → 軟刪除
       
5️⃣  觸發刷新
    ├─ setRefreshKey++
    └─ setCentralLibraryUpdateKey++
       
6️⃣  列表重新渲染
    ├─ getCentralLibraryFactors() 重新調用
    ├─ 過濾已移除係數
    └─ 新列表返回給 UI
       
7️⃣  UI 更新完成
    └─ 係數消失（如果 Bug 已修復）
```

---

## Bug 詳解

### 問題描述

**現象**: 移除係數後，列表中該係數仍然存在

### 根本原因鏈

```
根本原因                    中間過程                    最終症狀
    │                          │                          │
    ├─ useMemo 緩存 ──→ factorUsageMap 過時 ──→ 數據不一致
    │                                                    │
    ├─ 閉包中的舊數據 ──→ centralLibraryFactors ──→ 過濾失效
    │                     使用過時數據                   │
    │                                                    ├─ 係數不消失
    └─ removedFromCentralIds ──→ 頁面刷新時 ──→ 記錄丟失
       頁面刷新清空        被重置為 Set()        ├─ 系數重新出現
                                                └─ 無法恢復
```

### Bug 位置

**文件**: `/src/hooks/useMockData.ts:560`

```typescript
// ❌ 問題代碼
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
                                                               ^^
                                   這個空依賴項導致只計算一次！
```

### 修復方案

#### 優先級 1️⃣ (立即修復)
```typescript
// 修改 /src/hooks/useMockData.ts:560
- const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
+ const factorUsageMap = calculateFactorUsage()

工作量: 1 行代碼
效果: ⭐⭐⭐ (完全修復移除不消失的問題)
```

#### 優先級 2️⃣ (重要改進)
```typescript
// 修改 /src/hooks/useMockData.ts:63
使用 localStorage 持久化 removedFromCentralIds

工作量: 10 行代碼
效果: ⭐⭐ (防止頁面刷新後系數重新出現)
```

#### 優先級 3️⃣ (優化)
```typescript
// 修改 /src/hooks/useFactors.ts:151-202
移除 300ms setTimeout 延遲

工作量: 5 行代碼
效果: ⭐ (改善 UX，更快看到新列表)
```

---

## 關鍵代碼路徑

### 調用鏈 (從用戶點擊到列表更新)

```
page.tsx:280
handleRemoveFromCentralRequest(factor)
  │
  ├─→ setRemoveFromCentralDialogOpen(true)
  │
  └─→ RemoveFromCentralDialog 打開
      │
      └─→ 用戶點擊「確認移除」
          │
          ├─→ page.tsx:294
          │   handleRemoveFromCentralConfirm()
          │   │
          │   ├─→ useComposites Hook
          │   │   removeFromCentral(factor)
          │   │   │
          │   │   ├─→ useMockData.ts:86
          │   │   │   removeFromCentralLibrary(factor)
          │   │   │   │
          │   │   │   ├─ 情況 1 (自建組合): 硬刪除
          │   │   │   │  importedCompositeFactors.splice()
          │   │   │   │
          │   │   │   └─ 情況 2 (其他): 軟刪除
          │   │   │      removedFromCentralIds.add()
          │   │   │
          │   │   └─→ 返回 { success: true }
          │   │
          │   ├─→ refreshSelectedFactor()
          │   │   │
          │   │   ├─ setRefreshKey(prev => prev + 1)
          │   │   └─ setCentralLibraryUpdateKey(prev => prev + 1)
          │   │
          │   └─→ FactorTable 重新掛載 (key 變化)
          │
          └─→ useFactors Hook 重新初始化
              │
              ├─→ useEffect 監聽 refreshKey
              │
              ├─→ loadFactors() 執行
              │
              └─→ useMockData.ts:563
                  getCentralLibraryFactors()
                  │
                  ├─ 步驟 1: 合併所有源
                  │  ├─ usedFactorItems
                  │  ├─ productFootprintItems
                  │  ├─ importedProductFactors
                  │  └─ importedComposites (已經少一個)
                  │
                  ├─ 步驟 2: 過濾已移除係數
                  │  .filter(item => !removedFromCentralIds.has(item.id))
                  │
                  ├─ 步驟 3: 排序
                  │  ├─ 按使用次數降序
                  │  └─ 次數相同按名稱
                  │
                  └─ 步驟 4: 返回過濾列表
                     │
                     └─→ setFactors(filteredFactors)
                        │
                        └─→ ✅ FactorTable 重新渲染
                            係數消失
```

---

## 受影響的係數類型

### 自建組合係數

```
狀態前 → 移除操作 → 狀態後
      
未匯入 → (匯入) → 已匯入 → (移除) → 未匯入
  │      Dialog   │ Dialog   │  Dialog   │
  │    ImportCom  │ (無)    │ Remove   │
  │   pToCenter   │         │          │
  │              │         │          │
  └─ 可刪除       └─ 無法刪除 ← 保護 ─→ 可刪除
                  「已匯入，請先移除」
```

### 標準排放係數

```
中央庫數據 → 軟刪除 → 列表中消失（使用過濾）
  │            │
  ├─ ID: 301  removedFromCentralIds.add(301)
  │            │
  └─ 實際數據  └─ 仍在各個源中，只是隱藏
     保留
```

---

## 重要概念辨析

### 移除 vs 刪除

| 操作 | 適用範圍 | 效果 | 數據 | 可恢復 |
|------|---------|------|------|--------|
| **移除** | 中央庫 | 從列表消失 | 保留 | ✅ (再次匯入) |
| **刪除** | 自建係數 | 完全刪除 | 刪除 | ❌ 無法恢復 |

### 硬刪除 vs 軟刪除

| 方式 | 應用場景 | 實現 | 優點 | 缺點 |
|------|---------|------|------|------|
| **硬刪除** | 自建組合係數 | splice() | 完全清除 | 無法恢復 |
| **軟刪除** | 其他係數 | 黑名單 | 安全、可追溯 | 占用存儲 |

---

## 文件結構速查表

```
src/
├── components/
│   └── RemoveFromCentralDialog.tsx      ← UI 對話框
├── hooks/
│   ├── useMockData.ts                   ← 核心邏輯
│   │   ├─ removeFromCentralLibrary()    [L:86-153]
│   │   ├─ getCentralLibraryFactors()    [L:563-638]
│   │   ├─ importedCompositeFactors      [L:60]
│   │   └─ removedFromCentralIds         [L:63]
│   ├── useComposites.ts                 ← 業務邏輯
│   │   └─ removeFromCentral Hook        [L:354-392]
│   └── useFactors.ts                    ← 數據加載
└── app/
    └── page.tsx                         ← 頁面層
        ├─ handleRemoveFromCentralRequest [L:280-291]
        ├─ handleRemoveFromCentralConfirm [L:294-327]
        └─ refreshSelectedFactor         [L:387-402]

docs/
├── BUG_ANALYSIS_Remove_From_Central.md          [原始 Bug 分析]
├── IMPLEMENTATION_SUMMARY_Central_Library_Workflow.md [實現總結]
├── DETAILED_ANALYSIS_Remove_From_Central.md     [詳細分析]
├── VISUAL_FLOW_Remove_From_Central.md           [流程圖]
├── CODE_LOCATIONS_Remove_From_Central.md        [代碼位置]
└── EXECUTIVE_SUMMARY_Remove_From_Central.md     [本文件]
```

---

## 測試清單

### 功能測試

- [ ] **測試自建係數移除**
  - [ ] 創建自建組合係數
  - [ ] 匯入到中央庫
  - [ ] 在中央庫中移除
  - [ ] 驗證中央庫中消失
  - [ ] 驗證自建庫中狀態恢復為"未匯入"
  - [ ] 驗證按鈕變為藍色"匯入到中央庫"

- [ ] **測試標準排放係數移除**
  - [ ] 選擇被使用的標準排放係數
  - [ ] 在中央庫中移除
  - [ ] 驗證中央庫中消失
  - [ ] 驗證使用該係數的專案無變化

- [ ] **測試頁面刷新**
  - [ ] 移除係數後不刷新 ✅ 應消失
  - [ ] 移除係數後刷新頁面 ❌ 不應重新出現

### Debug 檢查

- [ ] 打開 F12 開發者工具
- [ ] 檢查 Console 日志
  - 應有 `[removeFromCentralLibrary] 開始移除係數`
  - 應有 `[getCentralLibraryFactors] 過濾掉係數`
- [ ] 檢查 removedFromCentralIds 的內容
  ```javascript
  // 在 console 執行
  window.removedFromCentralIds  // 應包含移除的 ID
  ```

---

## 推薦修復步驟

### Step 1: 修復 useMemo Bug

1. 打開 `/src/hooks/useMockData.ts`
2. 找到第 560 行
3. 修改:
   ```typescript
   // 修改前
   const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
   
   // 修改後
   const factorUsageMap = calculateFactorUsage()
   ```
4. 保存文件

### Step 2: 驗證修復

1. 刷新瀏覽器
2. 創建自建係數並匯入中央庫
3. 移除該係數
4. 驗證:
   - ✅ 立即消失
   - ✅ Console 有過濾日志
   - ✅ 自建庫狀態恢復

### Step 3: 可選改進

1. 添加 localStorage 持久化
2. 減少 setTimeout 延遲
3. 添加更詳細的日志

---

## 相關文檔引用

| 文檔 | 內容 | 對象 |
|------|------|------|
| BUG_ANALYSIS_*.md | Bug 根因分析 | 開發者 |
| DETAILED_ANALYSIS_*.md | 詳細代碼解析 | 開發者 |
| VISUAL_FLOW_*.md | 流程圖和圖示 | 所有人 |
| CODE_LOCATIONS_*.md | 代碼位置速查 | 開發者 |
| IMPLEMENTATION_SUMMARY_*.md | 功能實現概要 | 技術領導 |

---

## 結論

### 核心發現

1. **移除功能已完整實現** - UI、Hook、存儲都已就位
2. **存在明確的 Bug** - useMemo 緩存導致數據過時
3. **修復簡單** - 只需 1 行代碼改動
4. **影響重要** - 關係到用戶體驗和功能可用性

### 建議優先級

| 優先級 | 項目 | 完成時間 | 影響 |
|--------|------|---------|------|
| **P0** | 修復 useMemo | 5 分鐘 | 🔴 高 |
| **P1** | 添加 localStorage | 30 分鐘 | 🟡 中 |
| **P2** | 優化延遲 | 15 分鐘 | 🟢 低 |

### 預期效果

修復後，用戶將能夠:
- ✅ 從中央庫移除係數
- ✅ 立即看到列表更新
- ✅ 頁面刷新後保留移除狀態
- ✅ 自建係數狀態正確恢復
- ✅ 再次匯入或刪除自建係數

---

**文檔完成 - 2025-11-10**

