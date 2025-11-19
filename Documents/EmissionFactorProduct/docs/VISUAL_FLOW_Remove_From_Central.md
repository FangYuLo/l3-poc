# 視覺化流程圖：從中央係數庫移除功能

## 1. 用戶交互流程

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          中央係數庫視圖                                    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────┐ ║
║  │ 係數列表                                                             │ ║
║  │ ┌────────────────────────────┐ ┌──────────────────────────────────┐ │ ║
║  │ │ 係數 ID: 201               │ │ 係數 ID: 301                     │ │ ║
║  │ │ 名稱: 我的組合係數         │ │ 名稱: 標準排放係數               │ │ ║
║  │ │ 類型: 組合係數             │ │ 類型: 排放係數                   │ │ ║
║  │ │                            │ │ 使用次數: 5 個專案               │ │ ║
║  │ │ [詳情] [選擇]              │ │ [詳情] [選擇]                    │ │ ║
║  │ └────────────────────────────┘ └──────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │ 詳情面板:                                                            │ ║
║  │ ┌──────────────────────────────────────────────────────────────────┐ │ ║
║  │ │ 係數詳情                                                        │ │ ║
║  │ │                                                                │ │ ║
║  │ │ [按鈕: 匯入到中央庫] [按鈕: 已匯入中央庫 (禁用)]             │ │ ║
║  │ │ [按鈕: 從中央係數庫移除] ← 用戶點擊這裡                      │ │ ║
║  │ └──────────────────────────────────────────────────────────────────┘ │ ║
║  └──────────────────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    ↓
                        點擊「從中央係數庫移除」
                                    ↓
╔════════════════════════════════════════════════════════════════════════════╗
║                    RemoveFromCentralDialog 對話框                          ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────┐ ║
║  │ ✅ 確認從中央係數庫移除？                                           │ ║
║  │                                                                      │ ║
║  │ 係數資訊:                                                            │ ║
║  │ ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │ │ 係數名稱：我的組合係數                                        │ │ ║
║  │ │ 來源：從自建係數匯入（ID: 101）                               │ │ ║
║  │ │ 當前版本：v1.0                                                │ │ ║
║  │ └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │ ⚠️ 移除後影響:                                                      │ ║
║  │ • 此係數將從中央係數庫中移除                                       │ ║
║  │ • 自建係數將恢復為「未匯入」狀態                                   │ ║
║  │ • 您可以稍後再次匯入此係數                                         │ ║
║  │ • 移除後，您將可以刪除自建係數                                     │ ║
║  │                                                                      │ ║
║  │ 📊 使用情況警告:                                                    │ ║
║  │ ⚠️ 此係數正被 5 個專案使用                                          │ ║
║  │ 使用專案：                                                          │ ║
║  │ • 專案 A                                                            │ ║
║  │ • 專案 B                                                            │ ║
║  │ • 專案 C                                                            │ ║
║  │                                                                      │ ║
║  │ [取消] [確認移除] ← 用戶點擊「確認移除」                           │ ║
║  └──────────────────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    ↓
                        調用 removeFromCentral()
                                    ↓
```

---

## 2. 後端處理流程（自建組合係數）

```
removeFromCentral(factor)
  ┌─ factor = {
  │    id: 201,
  │    name: "我的組合係數",
  │    source_composite_id: 101,  ← 這表示是自建組合係數
  │    ...
  │  }
  │
  └─ useComposites 中的 removeFromCentral Hook
      │
      ├─ setIsLoading(true)
      ├─ await new Promise(resolve => setTimeout(resolve, 1000))  [延遲]
      │
      └─→ 調用 removeFromCentralLibrary(factor)
           │                           ↑
           │                           │
           │    /src/hooks/useMockData.ts:86-153
           │
           ├─ 檢查：factor.source_composite_id 存在？
           │         ↓ (是，這是自建組合係數)
           │
           ├─ 步驟 1: 在中央庫陣列中查找
           │  └─ const index = importedCompositeFactors
           │                  .findIndex(f => f.id === factor.id)
           │     結果: index = 0 (找到了)
           │
           ├─ 步驟 2: 獲取中央庫中的記錄
           │  └─ const centralFactor = importedCompositeFactors[0]
           │     const sourceCompositeId = 101
           │
           ├─ 步驟 3: 硬刪除（只對自建組合係數）
           │  └─ importedCompositeFactors.splice(0, 1)
           │     ┌──────────────────────────────────────────┐
           │     │ 前: [Item_201, Item_202, Item_203]       │
           │     │ 後: [Item_202, Item_203]                 │
           │     │                                          │
           │     │ 該係數完全從陣列中刪除                   │
           │     └──────────────────────────────────────────┘
           │
           ├─ 步驟 4: 更新源係數狀態（關鍵！）
           │  └─ const sourceFactor = getUserDefinedCompositeFactorById(101)
           │     updateUserDefinedCompositeFactor(101, {
           │       ...sourceFactor,
           │       imported_to_central: false,    ← 恢復為未匯入
           │       central_library_id: undefined  ← 清除關聯
           │     })
           │
           ├─ 步驟 5: 返回成功信號
           │  └─ return {
           │       success: true,
           │       sourceCompositeId: 101  ← 用於後續刷新
           │     }
           │
           └─ setIsLoading(false)
              return result
```

---

## 3. 後端處理流程（非自建係數）

```
removeFromCentral(factor)
  ┌─ factor = {
  │    id: 301,
  │    name: "標準排放係數",
  │    source_composite_id: undefined  ← 不存在！
  │    ...
  │  }
  │
  └─→ 調用 removeFromCentralLibrary(factor)
      │
      ├─ 檢查：factor.source_composite_id 存在？
      │         ↓ (否，這是其他類型係數)
      │
      └─ 執行情況 2: 軟刪除
         │
         ├─ 標記為已從中央庫移除
         │  └─ removedFromCentralIds.add(301)
         │     ┌──────────────────────────────────────────┐
         │     │ 前: Set(201, 205, 209)                   │
         │     │ 後: Set(201, 205, 209, 301)              │
         │     │                                          │
         │     │ 該係數被添加到黑名單                     │
         │     │ 實際數據仍在各個來源中，只是被隱藏       │
         │     └──────────────────────────────────────────┘
         │
         └─ 返回成功信號
            return { success: true }
```

---

## 4. React 狀態更新與 UI 刷新

```
handleRemoveFromCentralConfirm()
  │
  ├─ const result = await removeFromCentral(factorToRemove)
  │
  ├─ if (result.success) {
  │   │
  │   ├─ toast({ title: '移除成功', ... })
  │   │
  │   ├─ 關閉UI組件
  │   │  ├─ setRemoveFromCentralDialogOpen(false)
  │   │  ├─ setIsDetailPanelOpen(false)
  │   │  ├─ setSelectedFactor(null)
  │   │  └─ setFactorToRemove(null)
  │   │
  │   ├─ refreshSelectedFactor()
  │   │  │
  │   │  ├─ 如果是自建係數，刷新其狀態
  │   │  │  └─ const updatedFactor = getUserDefinedCompositeFactorById(...)
  │   │  │     setSelectedFactor(updatedFactor)
  │   │  │
  │   │  └─ 觸發全局刷新
  │   │     ├─ setRefreshKey(prev => prev + 1)  ┐
  │   │     │                                    │
  │   │     │  這會觸發 FactorTable 重新掛載    │
  │   │     │  因為 key 值改變了                 │ 導致重新渲染
  │   │     │                                    │
  │   │     └─ setCentralLibraryUpdateKey(...) ┘
  │   │
  │   └─ ✅ 移除完成
  │  }
  │
  └─ else {
     └─ toast({ title: '移除失敗', ... })
    }
```

---

## 5. 數據刷新與列表更新

```
setRefreshKey(prev => prev + 1)
setCentralLibraryUpdateKey(prev => prev + 1)
          ↓
     組件重新渲染
          ↓
  <FactorTable
    key={`${centralLibraryUpdateKey}-${refreshKey}`}  ← key 變了，重新掛載
    collectionId="favorites"
    ...
  />
          ↓
    useFactors Hook 被重新初始化
          ↓
    useEffect(() => {
      loadFactors()
    }, [..., refreshKey, ...])  ← 依賴項中有 refreshKey
          ↓
    loadFactors() 被調用
          ↓
    ┌──────────────────────────────────────────────────────┐
    │ Mock 模式下，調用:                                    │
    │ const allFactors = useMockData().getCentralLibraryFactors()
    └──────────────────────────────────────────────────────┘
          ↓
    getCentralLibraryFactors() 執行
          ↓
    重新合併所有源
    ├─ usedFactorItems    [被專案使用的係數]
    ├─ productFootprintItems   [產品碳足跡係數]
    ├─ importedProductFactors   [匯入的產品係數]
    └─ importedComposites  [匯入的組合係數]  ← 該係數已被刪除！
          ↓
    過濾已移除的係數
    │
    ├─ allCentralItems = Array.from(allCentralItemsMap.values())
    │                   .filter(item => !removedFromCentralIds.has(item.id))
    │                             ↑
    │                 關鍵的過濾邏輯
    │
    ├─ 對於自建組合係數 (ID: 201):
    │  ├─ 已在 importedCompositeFactors 中被刪除
    │  └─ 如果還在，會被 removedFromCentralIds 過濾掉
    │
    └─ 對於標準排放係數 (ID: 301):
       └─ 被 removedFromCentralIds 過濾掉
          ↓
    排序
    ├─ 按使用次數降序
    └─ 次數相同時按名稱排序
          ↓
    返回過濾後的係數列表
          ↓
    setFactors(filteredFactors)  ← 更新 React 狀態
          ↓
    FactorTable 組件重新渲染
          ↓
    ✅ 中央係數庫列表刷新，移除的係數消失
```

---

## 6. 自建係數狀態恢復

```
自建係數狀態變更流程

移除前狀態:
┌─────────────────────────────────┐
│ ID: 101                          │
│ name: "我的組合係數"             │
│ imported_to_central: true  ✅   │
│ central_library_id: 201          │
│ imported_at: 2025-11-10T...      │
│ ...                              │
└─────────────────────────────────┘
          ↓
   removeFromCentralLibrary() 執行
          ↓
   getSourcFactor = getUserDefinedCompositeFactorById(101)
          ↓
   updateUserDefinedCompositeFactor(101, {
     ...sourceFactor,
     imported_to_central: false,     ← 改變狀態
     central_library_id: undefined   ← 清除關聯
   })
          ↓
移除後狀態:
┌─────────────────────────────────┐
│ ID: 101                          │
│ name: "我的組合係數"             │
│ imported_to_central: false ❌   │
│ central_library_id: undefined    │
│ imported_at: 2025-11-10T...      │
│ ...                              │
└─────────────────────────────────┘
          ↓
   自建係數庫列表刷新
          ↓
   檢查 imported_to_central:
   ├─ false? → 顯示藍色「匯入到中央庫」按鈕
   └─ true?  → 顯示灰色「已匯入中央庫」按鈕
          ↓
   ✅ 用戶現在可以再次匯入或刪除此係數
```

---

## 7. 完整時序圖

```
用戶                RemoveFromCentralDialog    removeFromCentral      useMockData          FactorTable
  │                      │                          │                    │                    │
  ├─ 點擊「移除」──────→ │                          │                    │                    │
  │                      │                          │                    │                    │
  │  ← 對話框打開────────│                          │                    │                    │
  │                      │                          │                    │                    │
  │  │顯示係數信息和警告          │                    │                    │
  │  │使用情況             │                    │                    │                    │
  │                      │                          │                    │                    │
  ├─ 點擊「確認移除」───→ │                          │                    │                    │
  │                      ├─ 調用 onConfirm()───→ │                    │                    │
  │                      │                    ├─ 調用 removeFromCentralLibrary()
  │                      │                    │                    │                    │
  │                      │                    │  ┌─ 檢查 source_composite_id
  │                      │                    │  │                    │                    │
  │                      │                    │  ├─ 硬刪除或軟刪除         │                    │
  │                      │                    │  │                    │                    │
  │                      │                    │  └─ 返回 result ──────→ │                    │
  │                      │                    │                    │                    │
  │                      │    ← result ──────────┤                    │                    │
  │                      │                         │ setRefreshKey()
  │                      │                         │ setCentralLibraryUpdateKey()
  │                      │                         │                    │                    │
  │  ← 關閉對話框────────│                          │                    │                    │
  │                      │                          │                    ├─ 重新掛載
  │                      │                          │                    │                    │
  │  ← Toast 提示────────│                          │                    │                    │
  │                      │                          │                    │─ useEffect 觸發
  │                      │                          │                    │                    │
  │                      │                          │                    ├─ getCentralLibraryFactors()
  │                      │                          │                    │                    │
  │                      │                          │                    ├─ 過濾已移除係數
  │                      │                          │                    │                    │
  │                      │                          │                    ├─ setFactors()
  │                      │                          │                    │                    │
  │                      │                          │                    ├─ 係數消失 ──→ ✅
  │                      │                          │                    │                    │
  │  ← 返回主視圖────────────────────────────────────────────────────┤                    │
  │                      │                          │                    │                    │
```

---

## 8. 狀態變更概覽

```
中央係數庫:
┌────────────────────────────────────────────────────────┐
│ 移除前:                                               │
│ ┌──────────────────┐   ┌──────────────────┐          │
│ │ 係數 201         │   │ 係數 301          │          │
│ │ (自建組合)       │   │ (標準排放)       │          │
│ │ ...              │   │ ...              │          │
│ └──────────────────┘   └──────────────────┘          │
│                                                      │
│ 移除中央庫中的 201:                                  │
│ ├─ importedCompositeFactors.splice(0, 1)  [硬刪除]   │
│ ├─ removedFromCentralIds.add(201)  [軟刪除]          │
│                                                      │
│ 移除中央庫中的 301:                                  │
│ └─ removedFromCentralIds.add(301)  [軟刪除]          │
│                                                      │
│ 移除後:                                              │
│ ┌──────────────────┐                                │
│ │ (其他係數)       │                                │
│ │ ...              │                                │
│ └──────────────────┘                                │
└────────────────────────────────────────────────────────┘

自建係數庫:
┌────────────────────────────────────────────────────────┐
│ 移除前:                                               │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ID: 101, 我的組合係數                            │ │
│ │ imported_to_central: true                        │ │
│ │ 按鈕: [已匯入中央庫] (灰色禁用)                  │ │
│ │ 按鈕: [從中央係數庫移除] (紅色)                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ 更新狀態: imported_to_central = false                │
│                                                      │
│ 移除後:                                              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ID: 101, 我的組合係數                            │ │
│ │ imported_to_central: false                       │ │
│ │ 按鈕: [匯入到中央庫] (藍色可點擊) ✅             │ │
│ └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 9. 數據結構變化視圖

```
removedFromCentralIds 變化:
┌─────────────────────────────────────────┐
│ 初始狀態:                                │
│ Set()  [空集合]                         │
└─────────────────────────────────────────┘
         ↓ 移除係數 301
┌─────────────────────────────────────────┐
│ Set(301)                                 │
│ size: 1                                 │
└─────────────────────────────────────────┘
         ↓ 再移除係數 201
┌─────────────────────────────────────────┐
│ Set(201, 301)                           │
│ size: 2                                 │
│                                         │
│ 查詢:                                   │
│ has(201) → true   (被過濾掉)           │
│ has(301) → true   (被過濾掉)           │
│ has(401) → false  (保留)               │
└─────────────────────────────────────────┘

importedCompositeFactors 變化:
┌─────────────────────────────────────────┐
│ 初始狀態:                                │
│ [                                       │
│   { id: 201, name: "組合係數1", ... },│
│   { id: 202, name: "組合係數2", ... } │
│ ]                                       │
│ length: 2                               │
└─────────────────────────────────────────┘
         ↓ 移除 ID 201
┌─────────────────────────────────────────┐
│ [                                       │
│   { id: 202, name: "組合係數2", ... } │
│ ]                                       │
│ length: 1                               │
│                                         │
│ 注: 完全刪除，無法恢復！                │
└─────────────────────────────────────────┘
```

---

## 10. Bug 表現與根本原因

```
表現 1: 移除後立即不消失
┌───────────────────────────────┐
│ 原因: useMemo 緩存            │
│ /src/hooks/useMockData.ts:560  │
└───────────────────────────────┘
        ↓
    useMemo 依賴項為 []
        ↓
    factorUsageMap 只計算一次
        ↓
    getCentralLibraryFactors() 使用過時數據
        ↓
    過濾邏輯執行但基於過時數據
        ↓
  ❌ 消失延遲或不消失

表現 2: 頁面刷新後係數重新出現
┌───────────────────────────────┐
│ 原因: 全局變量重置              │
└───────────────────────────────┘
        ↓
    用戶 F5 刷新頁面
        ↓
    JavaScript 運行時重新初始化
        ↓
    removedFromCentralIds = new Set()
        ↓
    之前的移除記錄全部丟失
        ↓
    下次調用 getCentralLibraryFactors()
        ↓
    過濾邏輯失效
        ↓
  ❌ 係數重新出現

修復方案:

方案 1️⃣: 移除 useMemo
┌─────────────────────────────────────────┐
│ - const factorUsageMap = useMemo(..., [])
│ + const factorUsageMap = calculateFactorUsage()
│                                         │
│ 效果: 每次都重新計算最新數據            │
│ 優先級: P0 (最高)                       │
└─────────────────────────────────────────┘

方案 2️⃣: 使用 localStorage 持久化
┌─────────────────────────────────────────┐
│ localStorage.setItem('removedIds',
│   JSON.stringify(Array.from(set)))      │
│                                         │
│ 效果: 頁面刷新不丟失移除記錄            │
│ 優先級: P1 (中等)                       │
└─────────────────────────────────────────┘

方案 3️⃣: 減少延遲
┌─────────────────────────────────────────┐
│ - setTimeout(..., 300)
│ + 直接執行                              │
│                                         │
│ 效果: 改善 UX，更快看到新列表           │
│ 優先級: P2 (低)                         │
└─────────────────────────────────────────┘
```

---

**文檔完成**

