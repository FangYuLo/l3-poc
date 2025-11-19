# 詳細分析："從中央係數庫移除" 功能深度探索

## 文檔信息
- **版本**: v2.0（詳細分析版）
- **更新日期**: 2025-11-10
- **範圍**: 移除功能實現、流程、狀態管理、Bug根因分析

---

## 目錄
1. [功能概覽](#功能概覽)
2. [移除功能的完整實現](#移除功能的完整實現)
3. [非自建係數的移除流程](#非自建係數的移除流程)
4. [自建組合係數的移除流程](#自建組合係數的移除流程)
5. [中央庫列表的過濾機制](#中央庫列表的過濾機制)
6. [自建係數在列表中仍顯示的根本原因](#自建係數在列表中仍顯示的根本原因)
7. [狀態管理詳解](#狀態管理詳解)
8. [Bug根因分析與修復方案](#bug根因分析與修復方案)

---

## 功能概覽

### 什麼是"從中央係數庫移除"？

**從中央係數庫移除**是一個操作，允許用戶將任何係數從中央係數庫（Central Library / Favorites 節點）的列表中移除。

### 支持的係數類型

| 係數類型 | 來源 | 移除邏輯 | 備註 |
|---------|------|---------|------|
| **自建組合係數** | 自建係數庫匯入 | 軟刪除 + 狀態恢復 | 原始係數保留，自建庫中恢復"未匯入"狀態 |
| **標準排放係數** | 中央數據庫 | 軟刪除 | 只標記為已移除，不刪除實際數據 |
| **產品碳足跡係數** | 專案數據 | 軟刪除 | 標記為已移除 |
| **其他類型係數** | 各種來源 | 軟刪除 | 統一標記為已移除 |

### 關鍵概念：軟刪除 vs 硬刪除

```typescript
// ✅ 軟刪除：只標記為已移除，不真正刪除數據
removedFromCentralIds.add(factor.id)  // 添加到黑名單

// ❌ 硬刪除：直接從數組中刪除
importedCompositeFactors.splice(index, 1)  // 只對自建組合係數執行
```

---

## 移除功能的完整實現

### 1. UI 層 - RemoveFromCentralDialog 組件

**文件位置**: `/src/components/RemoveFromCentralDialog.tsx`

```typescript
interface RemoveFromCentralDialogProps {
  isOpen: boolean
  onClose: () => void
  factor: any
  onConfirm: () => Promise<void>
  usageInfo?: {
    isUsed: boolean
    usageCount: number
    usedInProjects: string[]
  }
}
```

**組件職責**:
- ✅ 展示要移除的係數信息
- ✅ 顯示移除後的影響警告
- ✅ 展示係數使用情況（被多少個專案使用）
- ✅ 提供確認/取消按鈕

**關鍵展示信息**:
```jsx
{/* 係數基本信息 */}
<Text>係數名稱：{factor.name}</Text>
<Text>來源：從自建係數匯入（ID: {factor.source_composite_id}）</Text>
<Badge>{factor.version || 'v1.0'}</Badge>

{/* 移除後影響 */}
<ListItem>此係數將從中央係數庫中移除</ListItem>
<ListItem>自建係數將恢復為「未匯入」狀態</ListItem>
<ListItem>您可以稍後再次匯入此係數</ListItem>

{/* 使用情況警告 */}
{usageInfo?.isUsed && (
  <Alert status="warning">
    此係數正被 {usageInfo.usageCount} 個專案使用
  </Alert>
)}
```

### 2. 業務層 - removeFromCentral Hook

**文件位置**: `/src/hooks/useComposites.ts:354-392`

```typescript
const removeFromCentral = useCallback(async (
  factor: any
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    setIsLoading(true)
    setError(null)

    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 執行核心移除邏輯
    const result = removeFromCentralLibrary(factor)  // ← 核心函數

    if (!result.success) {
      return { success: false, error: result.error }
    }

    setIsLoading(false)
    return { success: true, message: '已成功從中央係數庫移除' }
  } catch (err) {
    setIsLoading(false)
    return { success: false, error: '移除失敗' }
  }
}, [])
```

**特點**:
- ⏱️ 包含 1000ms 的延遲（模擬 API 調用）
- 🎯 直接調用 `removeFromCentralLibrary()` 核心函數
- 📦 返回統一的結果對象

### 3. 頁面層 - page.tsx 中的處理

**文件位置**: `/src/app/page.tsx:280-331`

```typescript
// 打開移除對話框
const handleRemoveFromCentralRequest = (factor: any) => {
  setFactorToRemove(factor)
  setRemoveFromCentralDialogOpen(true)
}

// 確認移除
const handleRemoveFromCentralConfirm = async () => {
  if (!factorToRemove) return

  try {
    const result = await removeFromCentral(factorToRemove)

    if (result.success) {
      // 成功時的處理
      toast({
        title: '移除成功',
        description: '係數已從中央庫移除，自建係數已恢復為未匯入狀態',
        status: 'success'
      })

      // 關鍵：刷新多個列表
      setRemoveFromCentralDialogOpen(false)
      setIsDetailPanelOpen(false)
      setSelectedFactor(null)
      setFactorToRemove(null)
      
      // 觸發數據刷新
      refreshSelectedFactor()  // ← 關鍵方法
    }
  } catch (error) {
    // 錯誤處理
  }
}
```

**refreshSelectedFactor 的作用**:
```typescript
const refreshSelectedFactor = () => {
  // 如果是自建係數，重新獲取最新狀態
  if (selectedFactor?.source_type === 'user_defined') {
    const updatedFactor = getUserDefinedCompositeFactorById(selectedFactor.id)
    setSelectedFactor(updatedFactor)
  }
  
  // 觸發全局刷新（2種刷新鍵）
  setRefreshKey(prev => prev + 1)                    // 自建係數庫
  setCentralLibraryUpdateKey(prev => prev + 1)       // 中央係數庫
}
```

---

## 非自建係數的移除流程

### 流程圖

```
中央係數庫中的標準排放係數、產品碳足跡係數等
           ↓
    點擊"移除"按鈕
           ↓
    打開 RemoveFromCentralDialog
           ↓
    用戶確認移除
           ↓
    調用 removeFromCentralLibrary(factor)
           ↓
    檢查：factor.source_composite_id 不存在？
           ↓ (是)
    執行情況 2：標記為軟刪除
           ↓
    removedFromCentralIds.add(factor.id)
           ↓
    返回 { success: true }
           ↓
    觸發刷新 (setCentralLibraryUpdateKey++)
           ↓
    getCentralLibraryFactors() 重新調用
           ↓
    過濾：.filter(item => !removedFromCentralIds.has(item.id))
           ↓
    係數從列表中消失
```

### 代碼實現（情況 2）

**文件位置**: `/src/hooks/useMockData.ts:134-146`

```typescript
// 情況 2: 其他類型的係數（非自建組合係數）
// 這些係數由專案使用或其他方式加入中央庫
// 移除它們只是從視圖中移除，實際數據仍然存在

console.log('[useMockData] 從中央庫移除其他類型係數:', factor.name, 'ID:', factor.id)

// 標記為已從中央庫移除（軟刪除）
removedFromCentralIds.add(factor.id)
console.log('[useMockData] 已移除係數列表:', Array.from(removedFromCentralIds))

return {
  success: true,
  error: undefined
}
```

### removedFromCentralIds 的全局存儲

**文件位置**: `/src/hooks/useMockData.ts:63`

```typescript
// 全局存儲從中央庫移除的係數 ID 列表
let removedFromCentralIds: Set<number> = new Set()
```

**重要特性**:
- 🌐 全局級別的存儲（模塊級別）
- 📦 使用 Set 存儲，查詢時間複雜度為 O(1)
- ⚠️ 頁面刷新時會被清空（因為是 JavaScript 變量）

---

## 自建組合係數的移除流程

### 流程圖

```
中央係數庫中的自建組合係數
           ↓
    點擊"移除"按鈕
           ↓
    打開 RemoveFromCentralDialog
           ↓
    顯示來源係數信息：
    "從自建係數匯入（ID: {source_composite_id}）"
           ↓
    用戶確認移除
           ↓
    調用 removeFromCentralLibrary(factor)
           ↓
    檢查：factor.source_composite_id 存在？
           ↓ (是)
    執行情況 1：自建組合係數的完整移除
           ↓
    ┌─────────────────────────────────────────┐
    │ 步驟 1: 從中央庫硬刪除                   │
    │ importedCompositeFactors.splice(...)     │
    └─────────────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────┐
    │ 步驟 2: 更新源係數狀態                   │
    │ getUserDefinedCompositeFactorById(...)   │
    │ updateUserDefinedCompositeFactor(...)    │
    │ - imported_to_central = false            │
    │ - central_library_id = undefined         │
    └─────────────────────────────────────────┘
           ↓
    返回 { success: true, sourceCompositeId }
           ↓
    觸發刷新 (setRefreshKey++, setCentralLibraryUpdateKey++)
           ↓
    ┌─────────────────────────────────────────┐
    │ 中央係數庫變化：                         │
    │ - 該係數立即消失                        │
    │                                         │
    │ 自建係數庫變化：                        │
    │ - 按鈕從"已匯入"→"匯入到中央庫"       │
    │ - imported_to_central = false           │
    │ - 可以再次匯入或刪除                    │
    └─────────────────────────────────────────┘
```

### 代碼實現（情況 1）

**文件位置**: `/src/hooks/useMockData.ts:103-132`

```typescript
export function removeFromCentralLibrary(factor: any): {
  success: boolean
  sourceCompositeId?: number
  error?: string
} {
  try {
    console.log('[removeFromCentralLibrary] 開始移除係數:', {
      id: factor.id,
      name: factor.name,
      type: factor.type,
      source_composite_id: factor.source_composite_id,
      source_type: factor.source_type
    })

    // ===================== 情況 1: 自建組合係數 =====================
    if (factor.source_composite_id) {
      // 步驟 1: 在中央庫陣列中查找該係數
      const index = importedCompositeFactors.findIndex(f => f.id === factor.id)

      if (index !== -1) {
        // 步驟 2: 獲取中央庫中的該係數記錄
        const centralFactor = importedCompositeFactors[index]
        const sourceCompositeId = centralFactor.source_composite_id

        // 步驟 3: 從中央庫陣列中刪除（硬刪除）
        importedCompositeFactors.splice(index, 1)
        console.log('[useMockData] 從中央庫移除組合係數:', centralFactor.name, 
                    '剩餘:', importedCompositeFactors.length)

        // 步驟 4: 更新對應的自建係數狀態（關鍵！）
        if (sourceCompositeId) {
          const sourceFactor = getUserDefinedCompositeFactorById(sourceCompositeId)
          if (sourceFactor) {
            // 恢復為未匯入狀態
            updateUserDefinedCompositeFactor(sourceCompositeId, {
              ...sourceFactor,
              imported_to_central: false,      // ← 關鍵：恢復為未匯入
              central_library_id: undefined,   // ← 清除關聯ID
            })
            console.log('[useMockData] 更新自建係數狀態:', sourceFactor.name, 
                        'imported_to_central = false')
          }
        }

        // 步驟 5: 返回成功信號
        return {
          success: true,
          sourceCompositeId  // 返回源係數ID，用於刷新
        }
      }
    }

    // ===================== 情況 2: 其他類型係數 =====================
    // ... 見上方
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '移除失敗' }
  }
}
```

### importedCompositeFactors 的管理

**文件位置**: `/src/hooks/useMockData.ts:60`

```typescript
// 全局存儲匯入到中央庫的組合係數
let importedCompositeFactors: ExtendedFactorTableItem[] = []

// 添加匯入的組合係數
export function addImportedCompositeToCentral(factor: ExtendedFactorTableItem) {
  const exists = importedCompositeFactors.some(f => f.id === factor.id)
  if (!exists) {
    importedCompositeFactors.push(factor)
  }
}

// 取得所有匯入的組合係數
export function getImportedCompositeFactors(): ExtendedFactorTableItem[] {
  return importedCompositeFactors
}
```

---

## 中央庫列表的過濾機制

### 完整的 getCentralLibraryFactors 實現

**文件位置**: `/src/hooks/useMockData.ts:563-638`

```typescript
const centralLibraryFactors = (): ExtendedFactorTableItem[] => {
  console.log('[getCentralLibraryFactors] 開始獲取中央庫係數...')
  
  // 步驟 1: 構建使用情況 Map
  const usageMap = new Map(factorUsageMap.map(u => [u.factorId, u.usedInProjects]))

  // 步驟 2: 獲取被專案使用的係數（標準排放係數）
  const usedFactorItems = allEmissionFactorItems
    .filter(item => usageMap.has(item.id))
    .map(item => ({
      ...item,
      projectUsage: usageMap.get(item.id) || [],
      usageText: formatProjectUsage(usageMap.get(item.id) || [])
    }))

  // 步驟 3: 獲取產品碳足跡係數（所有類型）
  const productFootprintItems = allProductFootprintItems.map(item => ({
    ...item,
    projectUsage: [],
    usageText: `來自專案: ${item.data?.source_project_name || '未知'}`
  }))

  // 步驟 4: 獲取從產品碳足跡匯入的係數
  const importedProductFactors = allEmissionFactorItems
    .filter(item => item.source_type === 'project_data')
    .map(item => ({
      ...item,
      projectUsage: usageMap.get(item.id) || [],
      usageText: `從產品碳足跡匯入`
    }))

  // 步驟 5: 獲取匯入的組合係數
  const importedComposites = getImportedCompositeFactors()

  // 步驟 6: 合併四種係數源（使用 Map 去重）
  const allCentralItemsMap = new Map<number, ExtendedFactorTableItem>()

  usedFactorItems.forEach(item => allCentralItemsMap.set(item.id, item))
  productFootprintItems.forEach(item => allCentralItemsMap.set(item.id, item))
  importedProductFactors.forEach(item => allCentralItemsMap.set(item.id, item))
  importedComposites.forEach(item => allCentralItemsMap.set(item.id, item))

  console.log('[getCentralLibraryFactors] 匯入的組合係數數量:', importedComposites.length)
  console.log('[getCentralLibraryFactors] 已移除的係數IDs:', Array.from(removedFromCentralIds))

  // ============ 步驟 7: 過濾已移除的係數（關鍵！） ============
  const allCentralItems = Array.from(allCentralItemsMap.values())
    .filter(item => {
      const shouldRemove = removedFromCentralIds.has(item.id)
      if (shouldRemove) {
        console.log('[getCentralLibraryFactors] 過濾掉係數:', item.id, item.name)
      }
      return !shouldRemove  // 返回 true = 保留，false = 過濾掉
    })

  console.log('[getCentralLibraryFactors] 最終中央庫係數數量:', allCentralItems.length)

  // 步驟 8: 排序
  return allCentralItems.sort((a, b) => {
    const aUsageCount = a.projectUsage?.length || 0
    const bUsageCount = b.projectUsage?.length || 0

    if (aUsageCount !== bUsageCount) {
      return bUsageCount - aUsageCount  // 使用次數多的在前
    }

    return a.name.localeCompare(b.name, 'zh-TW')  // 相同則按名稱
  })
}
```

### 過濾邏輯的流程

```
中央庫數據合併
  ↓
[Item1, Item2, Item3, Item4, ...]  (未過濾的所有係數)
  ↓
迭代每個 Item
  ↓
┌─────────────────────────────────────────┐
│ 檢查: item.id ∈ removedFromCentralIds?  │
├─────────────────────────────────────────┤
│ ✅ 是(true) → 過濾掉（返回 false）      │
│ ❌ 否(false) → 保留（返回 true）        │
└─────────────────────────────────────────┘
  ↓
按使用次數和名稱排序
  ↓
[已過濾的係數列表]
  ↓
返回給 FactorTable 組件顯示
```

---

## 自建係數在列表中仍顯示的根本原因

### 問題描述

**症狀**: 移除後係數仍在中央庫列表中顯示

### 根本原因分析

根據 `BUG_ANALYSIS_Remove_From_Central.md` 的詳細分析，問題由多個因素複合造成：

#### 原因 1: useMemo 緩存導致過時數據

**位置**: `/src/hooks/useMockData.ts:560`

```typescript
// ❌ 問題代碼
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
                       ↑ 依賴項為空陣列！

// ✅ 已修復
const factorUsageMap = calculateFactorUsage()
```

**問題詳解**:
- `useMemo` 使用空依賴項 `[]`，導致只在首次計算一次
- 之後數據變更時，`factorUsageMap` 不會更新
- `centralLibraryFactors()` 使用了這個過時的 `factorUsageMap`
- 導致某些計算邏輯使用舊數據

#### 原因 2: Hook 閉包和全局變量的不同步

```typescript
// 第一次調用
const mockData1 = useMockData()
// → 創建新的閉包 A
// → factorUsageMap 被計算並（被 useMemo）緩存
// → 此時 removedFromCentralIds = Set()

// 移除係數
removeFromCentralLibrary(factor)
// → 更新全局變量 removedFromCentralIds.add(factorId)
// → removedFromCentralIds = Set(123)

// 觸發刷新，可能重新調用 useMockData
const mockData2 = useMockData()
// → 創建新的閉包 B
// → 新閉包中的 factorUsageMap 仍是舊計算結果
// → 因為 useMemo 沒有依賴項，不會更新

// 獲取中央庫列表
const factors = mockData2.getCentralLibraryFactors()
// → 使用的是舊的 factorUsageMap
// → removedFromCentralIds 是最新的 Set(123)
// → 但其他計算邏輯可能基於過時的 usageMap
```

#### 原因 3: 頁面刷新清空全局變量

**最嚴重的問題**: 當用戶手動刷新頁面時

```typescript
// 用戶按 F5 或點擊刷新按鈕
// ↓
// JavaScript 運行時重新初始化
// ↓
let removedFromCentralIds: Set<number> = new Set()  // 重新設為空
// ↓
// 所有之前移除的記錄都丟失！
// ↓
// 下次調用 getCentralLibraryFactors() 時
// → 過濾條件失效
// → 所有係數重新出現
```

---

## 狀態管理詳解

### 1. 三個關鍵的全局存儲

#### 存儲 A: userDefinedCompositeFactors

```typescript
// 文件: /src/hooks/useMockData.ts:202
let userDefinedCompositeFactors: UserDefinedCompositeFactor[] = []

// 用途: 存儲用戶創建的所有組合係數
// 特點: 
// - 包含自建係數的所有元數據
// - 包含 imported_to_central 標記
// - 持久化存儲（直到頁面刷新）
```

**數據結構示例**:
```typescript
{
  id: 101,
  name: "我的組合係數",
  value: 5.23,
  unit: "kg CO2e",
  type: "composite_factor",
  imported_to_central: false,          // ← 關鍵：未匯入
  central_library_id: undefined,        // ← 沒有關聯中央庫ID
  version: "v1.0",
  components: [
    { id: 1, name: "組件1", weight: 0.6 },
    { id: 2, name: "組件2", weight: 0.4 }
  ],
  version_history: [...]
}
```

#### 存儲 B: importedCompositeFactors

```typescript
// 文件: /src/hooks/useMockData.ts:60
let importedCompositeFactors: ExtendedFactorTableItem[] = []

// 用途: 存儲已匯入中央庫的組合係數副本
// 特點:
// - 是中央庫中自建組合係數的來源
// - 包含 source_composite_id（指向自建係數）
// - 添加時檢查重複避免重複匯入
```

**數據結構示例**:
```typescript
{
  id: 201,                              // 中央庫中的ID（不同於原始ID）
  name: "我的組合係數",
  value: 5.23,
  unit: "kg CO2e",
  type: "composite_factor",
  source_composite_id: 101,             // ← 指向原始自建係數
  source_type: "imported_composite",
  version: "v1.0",
  imported_at: "2025-11-10T10:00:00Z",
  imported_to_central: true
}
```

#### 存儲 C: removedFromCentralIds

```typescript
// 文件: /src/hooks/useMockData.ts:63
let removedFromCentralIds: Set<number> = new Set()

// 用途: 黑名單，存儲所有已從中央庫移除的係數ID
// 特點:
// - 使用 Set 以獲得 O(1) 查詢速度
// - 對所有類型的係數統一適用
// - 頁面刷新時會被清空（危險！）

// 示例狀態
removedFromCentralIds = Set(201, 205, 209)  // 移除了3個係數
```

### 2. 狀態轉換矩陣

#### 自建係數狀態轉換

```
初始狀態                    操作                        新狀態
┌─────────────────────────────────────────────────────────┐
│ 未匯入                                                  │
│ imported_to_central = false                             │
│ central_library_id = undefined                          │
└──────────────┬──────────────────────────────────────────┘
               │
               │ 用戶點擊"匯入到中央庫"
               │ → 打開 ImportCompositeToCentralModal
               │ → 填寫匯入信息（ISIC、數據品質等）
               │ → 確認匯入
               ↓
┌─────────────────────────────────────────────────────────┐
│ 已匯入                                                  │
│ imported_to_central = true                              │
│ central_library_id = 201  (中央庫ID)                   │
│ imported_at = "2025-11-10T10:00:00Z"                   │
└──────────────┬──────────────────────────────────────────┘
               │
               │ 用戶在中央庫中點擊"移除"
               │ → 打開 RemoveFromCentralDialog
               │ → 顯示將恢復未匯入狀態的警告
               │ → 用戶確認移除
               │ → 調用 removeFromCentralLibrary()
               ↓
┌─────────────────────────────────────────────────────────┐
│ 未匯入（恢復）                                          │
│ imported_to_central = false                             │
│ central_library_id = undefined                          │
│ (自動執行，無需用戶再次操作)                           │
└──────────────┬──────────────────────────────────────────┘
               │
               ├──→ 選項1: 再次匯入 → 回到已匯入狀態
               │
               └──→ 選項2: 刪除自建係數 → 係數消失
```

#### 中央庫顯示狀態轉換

```
中央庫初始狀態（包含該係數）
│
├─ 自建組合係數
│  ├─ 在 importedCompositeFactors 陣列中
│  └─ ID: 201
│
├─ 標準排放係數
│  ├─ 在 allEmissionFactorItems 中
│  └─ ID: 301
│
└─ 其他係數 ...
  
                    ↓ 用戶移除操作
  
中央庫處理過程
│
├─ 自建組合係數：
│  ├─ importedCompositeFactors.splice(index, 1)  [硬刪除]
│  └─ removedFromCentralIds.add(201)  [標記]
│
├─ 標準排放係數：
│  └─ removedFromCentralIds.add(301)  [只標記]
│
└─ 其他係數：
   └─ removedFromCentralIds.add(...)  [只標記]
  
                    ↓ 刷新時
  
重新調用 getCentralLibraryFactors()
│
├─ 重新合併所有源
│  ├─ usedFactorItems (有ID:301)
│  ├─ importedComposites (無ID:201，已刪除)
│  └─ 其他...
│
├─ 過濾: .filter(item => !removedFromCentralIds.has(item.id))
│  ├─ ID:201? removedFromCentralIds.has(201) → true → 過濾掉
│  ├─ ID:301? removedFromCentralIds.has(301) → true → 過濾掉
│  └─ 其他ID → false → 保留
│
└─ 結果：該係數從列表消失
```

### 3. 狀態更新的觸發點

```typescript
// 觸發點 1: 移除操作本身
removeFromCentralLibrary(factor)
│
├─ 更新 importedCompositeFactors
│  └─ 自建組合係數：直接從陣列中刪除（硬刪除）
│
├─ 更新 removedFromCentralIds
│  └─ 所有類型係數：添加到黑名單（軟刪除）
│
└─ 更新 userDefinedCompositeFactors
   └─ 自建係數：imported_to_central = false

// 觸發點 2: React 狀態更新
handleRemoveFromCentralConfirm() 中
│
├─ setRemoveFromCentralDialogOpen(false)    // 關閉對話框
├─ setIsDetailPanelOpen(false)              // 關閉詳情面板
├─ setSelectedFactor(null)                  // 清空選中
├─ refreshSelectedFactor()                  // 刷新選中係數（自建庫）
│  ├─ setRefreshKey(prev => prev + 1)      // 觸發自建係數庫刷新
│  └─ setCentralLibraryUpdateKey(...)       // 觸發中央庫刷新
│
└─ 這導致 FactorTable 重新渲染
   └─ 調用 getCentralLibraryFactors()
      └─ 應用過濾邏輯
         └─ 係數消失
```

---

## Bug根因分析與修復方案

### Bug 的完整根因鏈

```
┌─────────────────────────────────────────────────────────────┐
│ 根本原因 1: useMemo 緩存空依賴項                           │
│ /src/hooks/useMockData.ts:560                              │
│ const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ 導致
             │
┌─────────────────────────────────────────────────────────────┐
│ 中間結果: 數據過時                                        │
│ factorUsageMap 永遠不更新，即使移除操作完成後              │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ 加重
             │
┌─────────────────────────────────────────────────────────────┐
│ 根本原因 2: Hook 閉包中的舊數據引用                        │
│ centralLibraryFactors() 中使用過時的 usageMap              │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ 再加上
             │
┌─────────────────────────────────────────────────────────────┐
│ 根本原因 3: 頁面刷新清空全局變量                           │
│ removedFromCentralIds 在刷新時重置為 Set()                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓ 最終導致
             │
┌─────────────────────────────────────────────────────────────┐
│ 可見症狀: 移除後係數仍顯示                                  │
│ 1. 首次移除時：可能消失或延遲消失                           │
│ 2. 頁面刷新後：係數重新出現                                 │
└─────────────────────────────────────────────────────────────┘
```

### 修復方案

#### 方案 1: 移除 useMemo（推薦）⭐⭐⭐

**修改位置**: `/src/hooks/useMockData.ts:560`

```typescript
// 修改前
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])

// 修改後
const factorUsageMap = calculateFactorUsage()
```

**原因**:
- `useMockData()` 本身是一個 hook，每次調用都重新執行
- 沒有必要在內部再使用 `useMemo`
- 移除 `useMemo` 確保每次都獲取最新計算結果

**效果**: ⭐⭐⭐ 最直接有效

---

#### 方案 2: 使用 LocalStorage 持久化

**目的**: 解決頁面刷新丟失移除記錄的問題

```typescript
// 修改位置: /src/hooks/useMockData.ts:63

// 修改前
let removedFromCentralIds: Set<number> = new Set()

// 修改後
let removedFromCentralIds: Set<number> = new Set(
  JSON.parse(localStorage.getItem('removedFromCentralIds') || '[]')
)

// 在移除時同步到 localStorage
function removeFromCentralLibrary(factor: any) {
  // ... 移除邏輯
  removedFromCentralIds.add(factor.id)
  
  // ✅ 同步到 localStorage
  localStorage.setItem('removedFromCentralIds', 
    JSON.stringify(Array.from(removedFromCentralIds)))
}
```

**效果**: ⭐⭐ 防止刷新丟失

---

#### 方案 3: 減少 setTimeout 延遲

**位置**: `/src/hooks/useFactors.ts:151-202`

```typescript
// 修改前
setTimeout(() => {
  setFactors(paginatedFactors)
  setIsLoading(false)
}, 300)  // 300ms 延遲

// 修改後
// 直接執行，無延遲
setFactors(paginatedFactors)
setIsLoading(false)
```

**原因**: 300ms 延遲讓用戶看到舊數據的時間更長

**效果**: ⭐ 改善 UX

---

### 實施優先級

| 優先級 | 方案 | 工作量 | 效果 | 依賴 |
|--------|------|--------|------|------|
| **P0** | 移除 useMemo | 1行 | ⭐⭐⭐ | 無 |
| **P1** | 使用 localStorage | 10行 | ⭐⭐ | P0完成後 |
| **P2** | 減少延遲 | 5行 | ⭐ | 無 |

---

## 核心要點總結

### 移除的兩種方式

1. **硬刪除** (只對自建組合係數)
   ```typescript
   importedCompositeFactors.splice(index, 1)  // 直接刪除
   ```
   - 移除 `importedCompositeFactors` 陣列中的記錄
   - 同時更新源係數狀態
   - 數據完全消失

2. **軟刪除** (對所有類型係數)
   ```typescript
   removedFromCentralIds.add(factor.id)  // 添加到黑名單
   ```
   - 只標記為已移除，不刪除實際數據
   - 通過過濾在 `getCentralLibraryFactors()` 中移除
   - 用戶看不到，但數據仍存在

### 過濾邏輯的核心

```typescript
// 簡化的過濾邏輯
return allItems.filter(item => !removedFromCentralIds.has(item.id))
                             ↑
                  如果在黑名單中，返回 false（過濾掉）
                  如果不在黑名單中，返回 true（保留）
```

### 自建係數恢復的機制

```typescript
// 自動執行，不需手動操作
updateUserDefinedCompositeFactor(sourceCompositeId, {
  ...sourceFactor,
  imported_to_central: false,    // 自動恢復
  central_library_id: undefined   // 清除關聯
})
```

### 刷新機制的重要性

```typescript
// 兩個刷新鍵都很重要
setRefreshKey(prev => prev + 1)                // 自建係數庫
setCentralLibraryUpdateKey(prev => prev + 1)   // 中央係數庫

// 它們通過 key 屬性強制組件重新渲染
<FactorTable
  key={`${centralLibraryUpdateKey}-${refreshKey}`}
  // ...
/>
```

---

## 附錄：Debug Checklist

### 問題排查步驟

1. **打開瀏覽器開發者工具** (F12)
2. **觀察 Console 輸出**:
   ```
   ✅ 應該看到：
   [removeFromCentralLibrary] 開始移除係數: ...
   [useMockData] 從中央庫移除...: ...
   [getCentralLibraryFactors] 開始獲取中央庫係數...
   [getCentralLibraryFactors] 過濾掉係數: ...
   
   ❌ 如果缺少「過濾掉係數」的 log
   → 說明過濾邏輯沒有執行
   → 檢查 useMemo 是否已移除
   ```

3. **檢查狀態值**:
   ```javascript
   // 在 console 中執行
   window.removedFromCentralIds  // 應該是 Set(123, 456, ...)
   window.importedCompositeFactors  // 應該缺少已移除的係數
   ```

4. **測試流程**:
   - [ ] 匯入自建係數到中央庫
   - [ ] 觀察中央庫列表中出現新係數
   - [ ] 點擊移除按鈕
   - [ ] 確認對話框
   - [ ] 觀察係數立即消失
   - [ ] 檢查自建係數庫，按鈕變為藍色
   - [ ] 刷新頁面，係數不應重新出現

---

**文檔完成**

