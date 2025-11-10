# Bug 分析：從中央庫移除後係數仍顯示

## 問題描述

**症狀**: 從中央係數庫移除係數後，列表中該係數仍然存在，並未立即消失。

**預期行為**: 移除後係數應該立即從中央庫列表中消失。

---

## 根本原因分析

經過詳細的程式碼追蹤，我找到了**問題的根本原因**：

### 🔴 問題 1: `useMemo` 緩存導致的過時資料

**位置**: `src/hooks/useMockData.ts:560`

```typescript
// 快取係數使用情況計算
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
```

**問題**:
- `useMemo` 的依賴項是空陣列 `[]`
- 這意味著 `factorUsageMap` **只在首次掛載時計算一次**
- 之後即使資料變更，這個 Map 也不會更新

**影響**:
- `centralLibraryFactors()` 函數使用了這個過時的 `factorUsageMap`
- 雖然 `removedFromCentralIds` 會被更新，但其他計算邏輯可能受影響

---

### 🔴 問題 2: Hook 閉包問題

**位置**: `src/hooks/useMockData.ts:388-938`

```typescript
export function useMockData() {
  // ... 560 行
  const factorUsageMap = useMemo(() => calculateFactorUsage(), [])

  // ... 563 行
  const centralLibraryFactors = (): ExtendedFactorTableItem[] => {
    console.log('[getCentralLibraryFactors] 開始獲取中央庫係數...')
    const usageMap = new Map(factorUsageMap.map(u => [u.factorId, u.usedInProjects]))
    // ...
  }

  // ... 640 行返回對象
  return {
    getCentralLibraryFactors: (): ExtendedFactorTableItem[] => centralLibraryFactors()
  }
}
```

**問題**:
- `useMockData()` 是一個函數，每次呼叫都會創建新的閉包
- `centralLibraryFactors` 函數在閉包內部定義
- **關鍵**：`removedFromCentralIds` 是**模組級全局變數**（第63行）
- 但 `factorUsageMap` 是閉包內的局部變數，且被 `useMemo` 緩存

**為什麼會導致問題**：
1. 第一次調用 `useMockData()` → 創建閉包A，`factorUsageMap` 被計算並緩存
2. 移除係數 → 更新全局變數 `removedFromCentralIds`
3. 觸發刷新 → 可能重新調用 `useMockData()`，但 `factorUsageMap` 仍是舊的

---

### 🟡 問題 3: 過濾邏輯位置正確但可能被覆蓋

**位置**: `src/hooks/useMockData.ts:614-622`

```typescript
// 過濾掉已從中央庫移除的係數
const allCentralItems = Array.from(allCentralItemsMap.values())
  .filter(item => {
    const shouldRemove = removedFromCentralIds.has(item.id)
    if (shouldRemove) {
      console.log('[getCentralLibraryFactors] 過濾掉係數:', item.id, item.name)
    }
    return !shouldRemove
  })
```

**分析**:
- 過濾邏輯本身是正確的
- 但這個過濾是在 **Map 轉陣列後** 才執行
- 問題可能在於 `allCentralItemsMap` 的構建過程中就已經包含了不該有的資料

---

### 🔴 問題 4: `allEmissionFactorItems` 等陣列的閉包緩存

**位置**: `src/hooks/useMockData.ts:410-557`

```typescript
export function useMockData() {
  // ...

  // 轉換為表格項目
  const allEmissionFactorItems: FactorTableItem[] = getAllEmissionFactors().map(...)
  const allCompositeFactorItems: FactorTableItem[] = mockCompositeFactors.map(...)
  const allProductFootprintItems: FactorTableItem[] = mockProductFootprintFactors.map(...)

  // ...

  const centralLibraryFactors = (): ExtendedFactorTableItem[] => {
    // 使用上面的 allEmissionFactorItems 等
    const usedFactorItems = allEmissionFactorItems.filter(...)
    // ...
  }
}
```

**問題**:
- 這些 `allXxxItems` 陣列在 `useMockData()` 函數內部創建
- 每次呼叫 `useMockData()` 都會重新創建這些陣列
- 但如果組件使用了同一個 `useMockData()` 呼叫的實例，這些陣列就不會更新

---

## 實際測試驗證

### 測試步驟

1. 打開瀏覽器開發者工具的 Console
2. 匯入一個自建組合係數到中央庫
3. 觀察 Console 輸出：
   ```
   [getCentralLibraryFactors] 匯入的組合係數數量: 1
   ```
4. 從中央庫移除該係數
5. 觀察 Console 輸出：
   ```
   [useMockData] 從中央庫移除組合係數: [係數名稱]
   [useMockData] 已移除係數列表: [123]
   [getCentralLibraryFactors] 開始獲取中央庫係數...
   [getCentralLibraryFactors] 匯入的組合係數數量: 0  ← 正確！
   [getCentralLibraryFactors] 已移除的係數IDs: [123]  ← 正確！
   [getCentralLibraryFactors] 過濾掉係數: 123 [係數名稱]  ← 應該有這一行
   ```

### 預期 vs 實際

**預期**:
- 移除後 `importedCompositeFactors` 陣列長度應為 0
- 過濾邏輯應該執行並輸出 log
- 列表應該刷新並移除該係數

**實際（如果 bug 存在）**:
- 可能沒有看到「過濾掉係數」的 log
- 列表沒有刷新，或刷新了但資料沒變

---

## 解決方案

### 方案 1：移除 `useMemo` 緩存（推薦）⭐

**修改位置**: `src/hooks/useMockData.ts:560`

```typescript
// 修改前
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])

// 修改後
const factorUsageMap = calculateFactorUsage()
```

**原因**:
- `useMockData()` 本身就是每次都重新執行的
- 沒有必要在內部使用 `useMemo`
- 移除 `useMemo` 可以確保每次都獲取最新資料

---

### 方案 2：在 FactorTable 中使用 `key` 強制重新掛載（已實作）

**位置**: `src/app/page.tsx:939`

```typescript
<FactorTable
  key={`${centralLibraryUpdateKey}-${refreshKey}`}  // ← 已經有了
  // ...
/>
```

**分析**:
- 這個方案**已經實作**
- 理論上可以強制 FactorTable 重新掛載
- 但如果 `useMockData()` 的閉包問題沒解決，可能還是會有問題

---

### 方案 3：確保 `useFactors` 正確監聽 `refreshKey`（已實作）

**位置**: `src/components/FactorTable.tsx:193`

```typescript
const { factors: projectFactors } = useFactors({
  nodeId: selectedNode?.id,
  collectionId: selectedNodeType === 'favorites' ? 'favorites' : ...,
  refreshKey: dataRefreshKey  // ← 已經傳遞了
})
```

**位置**: `src/hooks/useFactors.ts:210-212`

```typescript
useEffect(() => {
  loadFactors()
}, [options.collectionId, options.projectId, options.emissionSourceId, options.nodeId, options.refreshKey])
// ← 已經監聽 refreshKey
```

**分析**:
- 這個機制**已經實作**
- `refreshKey` 變化時會觸發 `loadFactors()`
- 但 `loadFactors()` 有 300ms 的 setTimeout 延遲

---

### 方案 4：移除 `loadFactors` 中的延遲（可選）

**位置**: `src/hooks/useFactors.ts:151-202`

```typescript
// 修改前
setTimeout(() => {
  // ...
  setFactors(paginatedFactors)
  setIsLoading(false)
}, 300)

// 修改後：移除延遲
// ...
setFactors(paginatedFactors)
setIsLoading(false)
```

**原因**:
- 300ms 延遲會讓使用者看到舊資料更久
- 在 mock 階段不需要這個延遲

---

## 建議的修復步驟

### Step 1: 立即修復（最小改動）

修改 `src/hooks/useMockData.ts:560`：

```typescript
// 移除 useMemo
- const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
+ const factorUsageMap = calculateFactorUsage()
```

### Step 2: 可選優化

修改 `src/hooks/useFactors.ts:151-202`：

```typescript
// 移除或縮短延遲
- setTimeout(() => {
-   // ...
- }, 300)
+ // 直接執行，或縮短為 50ms
```

### Step 3: 驗證修復

1. 匯入一個係數到中央庫
2. 從中央庫移除該係數
3. 確認：
   - Console 有「過濾掉係數」的 log
   - 列表中的係數立即消失
   - 自建係數庫的按鈕恢復為藍色

---

## 為什麼之前以為是刷新問題

### 誤判原因

1. **刷新機制看起來完整**:
   - `refreshKey` 有更新
   - `useEffect` 有監聽
   - `key` 有變化

2. **實際測試可能的情況**:
   - 手動刷新頁面時，全局變數 `removedFromCentralIds` 會被清空
   - 所以重新載入後係數又出現了
   - 這讓人以為是「刷新不夠」的問題

3. **真正的問題**:
   - 不是刷新機制不work
   - 而是 `useMemo` 緩存導致資料過時
   - 閉包內的舊資料沒有更新

---

## 總結

### 根本原因

**`useMemo(() => calculateFactorUsage(), [])` 導致 `factorUsageMap` 永遠不更新**

### 修復方法

**移除 `useMemo`，讓 `factorUsageMap` 每次都重新計算**

### 預期效果

- 移除後係數**立即消失**
- 列表正確刷新
- 自建係數狀態正確恢復

---

**文件結束**
