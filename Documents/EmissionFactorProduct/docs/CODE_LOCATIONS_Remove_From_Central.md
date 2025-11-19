# 代碼位置快速參考指南：從中央係數庫移除功能

## 核心文件列表

| 文件 | 行數 | 函數/組件 | 用途 |
|------|------|---------|------|
| `/src/components/RemoveFromCentralDialog.tsx` | 1-162 | RemoveFromCentralDialog | UI 對話框組件 |
| `/src/hooks/useComposites.ts` | 354-392 | removeFromCentral Hook | 業務邏輯層 |
| `/src/hooks/useMockData.ts` | 86-153 | removeFromCentralLibrary | 核心移除邏輯 |
| `/src/hooks/useMockData.ts` | 563-638 | centralLibraryFactors | 中央庫數據獲取與過濾 |
| `/src/app/page.tsx` | 280-331 | handleRemoveFromCentralConfirm | 頁面級事件處理 |
| `/src/app/page.tsx` | 387-402 | refreshSelectedFactor | 刷新機制 |

---

## 詳細代碼位置

### 1. UI 層 - RemoveFromCentralDialog 組件

**文件**: `/src/components/RemoveFromCentralDialog.tsx`

```
第 1 行   - import 語句
第 28 行  - 組件 Props 接口定義
第 40 行  - 組件定義開始
第 51 行  - handleConfirm 方法
第 62 行  - Modal 開始
第 66 行  - 標題和圖標
第 76 行  - 係數信息展示
第 99 行  - 移除影響說明
第 113 行 - 使用情況警告（可選）
第 146 行 - 確認按鈕
第 162 行 - 文件結束
```

**關鍵代碼**:
```typescript
// 行 28-38: Props 接口
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

// 行 51-59: 確認邏輯
const handleConfirm = async () => {
  setIsRemoving(true)
  try {
    await onConfirm()  // ← 調用父組件傳入的確認函數
    onClose()
  } finally {
    setIsRemoving(false)
  }
}

// 行 85-86: 來源顯示
<Text>
  從自建係數匯入（ID: {factor.source_composite_id}）
</Text>
```

---

### 2. Hook 層 - useComposites

**文件**: `/src/hooks/useComposites.ts`

```
第 1 行   - import 語句（包括 removeFromCentralLibrary）
第 14 行  - useComposites 函數定義
第 15 行  - useState hooks 定義
第 354 行 - removeFromCentral Hook 開始
第 357 行 - 內部 try-catch
第 365 行 - 1000ms 延遲
第 368 行 - 調用 removeFromCentralLibrary()
第 370 行 - 檢查 result.success
第 378 行 - setIsLoading(false)
第 380 行 - 返回成功結果
第 392 行 - 函數結束
第 415 行 - 返回對象中的 removeFromCentral
```

**關鍵代碼**:
```typescript
// 行 354-392: removeFromCentral Hook
const removeFromCentral = useCallback(async (
  factor: any
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    setIsLoading(true)
    setError(null)

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 執行移除操作（傳遞完整的 factor 對象）
    const result = removeFromCentralLibrary(factor)  // ← 核心函數

    if (!result.success) {
      setIsLoading(false)
      return {
        success: false,
        error: result.error || '移除失敗'
      }
    }

    setIsLoading(false)
    return {
      success: true,
      message: '已成功從中央係數庫移除'
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '移除失敗'
    setError(errorMessage)
    setIsLoading(false)
    return {
      success: false,
      error: errorMessage
    }
  }
}, [])
```

---

### 3. 核心邏輯層 - useMockData

#### A. 全局存儲變量

**文件**: `/src/hooks/useMockData.ts`

```
第 60 行  - importedCompositeFactors 定義
第 63 行  - removedFromCentralIds 定義
第 68 行  - addImportedCompositeToCentral 函數
第 79 行  - getImportedCompositeFactors 函數
```

**代碼**:
```typescript
// 行 60
let importedCompositeFactors: ExtendedFactorTableItem[] = []

// 行 63
let removedFromCentralIds: Set<number> = new Set()

// 行 68-74: 添加匯入的組合係數
export function addImportedCompositeToCentral(factor: ExtendedFactorTableItem) {
  const exists = importedCompositeFactors.some(f => f.id === factor.id)
  if (!exists) {
    importedCompositeFactors.push(factor)
  }
}

// 行 79-81: 取得所有匯入的組合係數
export function getImportedCompositeFactors(): ExtendedFactorTableItem[] {
  return importedCompositeFactors
}
```

#### B. removeFromCentralLibrary 函數

**文件**: `/src/hooks/useMockData.ts:86-153`

```
第 86 行  - 函數簽名
第 93 行  - 開始 try block
第 94 行  - console.log 記錄開始
第 103 行 - 情況 1 判斷：factor.source_composite_id
第 104 行 - 在 importedCompositeFactors 中查找
第 111 行 - splice 硬刪除
第 116 行 - 獲取源係數
第 118 行 - updateUserDefinedCompositeFactor 更新源狀態
第 127 行 - 返回情況 1 結果
第 137 line - 情況 2：其他類型係數
第 140 行 - removedFromCentralIds.add() 軟刪除
第 153 行 - 函數結束
```

**完整代碼** (第 86-153 行):
```typescript
export function removeFromCentralLibrary(
  factor: any
): {
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

    // 情況 1: 從自建係數匯入的組合係數
    if (factor.source_composite_id) {
      const index = importedCompositeFactors.findIndex(f => f.id === factor.id)

      if (index !== -1) {
        const centralFactor = importedCompositeFactors[index]
        const sourceCompositeId = centralFactor.source_composite_id

        // 從中央庫陣列中移除
        importedCompositeFactors.splice(index, 1)
        console.log('[useMockData] 從中央庫移除組合係數:', centralFactor.name, '剩餘:', importedCompositeFactors.length)

        // 更新對應的自建係數狀態
        if (sourceCompositeId) {
          const sourceFactor = getUserDefinedCompositeFactorById(sourceCompositeId)
          if (sourceFactor) {
            updateUserDefinedCompositeFactor(sourceCompositeId, {
              ...sourceFactor,
              imported_to_central: false,
              central_library_id: undefined,
            })
            console.log('[useMockData] 更新自建係數狀態:', sourceFactor.name, 'imported_to_central = false')
          }
        }

        return {
          success: true,
          sourceCompositeId
        }
      }
    }

    // 情況 2: 其他類型的係數
    console.log('[useMockData] 從中央庫移除其他類型係數:', factor.name, 'ID:', factor.id, 'Type:', factor.type)

    // 標記為已從中央庫移除
    removedFromCentralIds.add(factor.id)
    console.log('[useMockData] 已移除係數列表:', Array.from(removedFromCentralIds))

    return {
      success: true,
      error: undefined
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '移除失敗'
    }
  }
}
```

#### C. getCentralLibraryFactors 函數

**文件**: `/src/hooks/useMockData.ts:563-638`

```
第 560 行 - factorUsageMap 計算（可能是 Bug 點）
第 563 行 - centralLibraryFactors 函數定義
第 565 行 - 構建 usageMap
第 568 行 - usedFactorItems 過濾
第 577 行 - productFootprintItems 構建
第 585 行 - importedProductFactors 過濾
第 594 行 - getImportedCompositeFactors() 調用
第 597 行 - allCentralItemsMap 初始化
第 600 行 - usedFactorItems forEach
第 603 行 - productFootprintItems forEach
第 606 行 - importedProductFactors forEach
第 609 行 - importedComposites forEach
第 614 行 - 過濾開始（核心過濾邏輯）
第 615 行 - Array.from().filter()
第 617 行 - removedFromCentralIds.has() 檢查
第 622 行 - 返回過濾後的結果
第 627 行 - 排序開始
第 638 行 - 返回最終結果
```

**關鍵過濾邏輯** (第 614-622 行):
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

**排序邏輯** (第 627-637 行):
```typescript
return allCentralItems.sort((a, b) => {
  const aUsageCount = a.projectUsage?.length || 0
  const bUsageCount = b.projectUsage?.length || 0

  if (aUsageCount !== bUsageCount) {
    return bUsageCount - aUsageCount  // 使用次數多的在前
  }

  return a.name.localeCompare(b.name, 'zh-TW')  // 相同則按名稱
})
```

---

### 4. 頁面級事件處理 - page.tsx

**文件**: `/src/app/page.tsx`

```
第 40 行  - import updateUserDefinedCompositeFactor
第 43 行  - import getUserDefinedCompositeFactorById
第 68 行  - 解構 removeFromCentral 和 isLoading
第 73 行  - removeFromCentralDialogOpen 狀態
第 74 行  - factorToRemove 狀態
第 280 行 - handleRemoveFromCentralRequest 函數
第 290 行 - setRemoveFromCentralDialogOpen(true)
第 294 行 - handleRemoveFromCentralConfirm 函數開始
第 298 行 - 調用 removeFromCentral()
第 301 行 - 成功時 toast
第 310 行 - setRemoveFromCentralDialogOpen(false)
第 311 行 - setIsDetailPanelOpen(false)
第 312 行 - setSelectedFactor(null)
第 313 行 - setFactorToRemove(null)
第 316 行 - refreshSelectedFactor()
第 387 行 - refreshSelectedFactor 函數定義
第 391 行 - getUserDefinedCompositeFactorById 調用
第 394 行 - setSelectedFactor(updatedFactor)
第 399 行 - setRefreshKey()
第 401 行 - setCentralLibraryUpdateKey()
第 939 行 - FactorTable key 屬性
第 1098 行 - RemoveFromCentralDialog 組件
```

**打開對話框** (第 280-291 行):
```typescript
const handleRemoveFromCentralRequest = (factor: any) => {
  setFactorToRemove(factor)
  setRemoveFromCentralDialogOpen(true)
}
```

**確認移除** (第 294-327 行):
```typescript
const handleRemoveFromCentralConfirm = async () => {
  if (!factorToRemove) return

  try {
    const result = await removeFromCentral(factorToRemove)

    if (result.success) {
      toast({
        title: '移除成功',
        description: '係數已從中央庫移除，自建係數已恢復為未匯入狀態',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // 關閉對話框和詳情面板
      setRemoveFromCentralDialogOpen(false)
      setIsDetailPanelOpen(false)
      setSelectedFactor(null)
      setFactorToRemove(null)

      // 刷新列表
      refreshSelectedFactor()
    } else {
      toast({
        title: '移除失敗',
        description: result.error || '未知錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  } catch (error) {
    toast({
      title: '移除失敗',
      description: '請稍後重試',
```

**刷新機制** (第 387-402 行):
```typescript
const refreshSelectedFactor = () => {
  if (selectedFactor && selectedFactor.id) {
    // 如果是自建係數，重新獲取最新資料
    if (selectedFactor.source_type === 'user_defined') {
      const updatedFactor = getUserDefinedCompositeFactorById(selectedFactor.id)
      if (updatedFactor) {
        console.log('[refreshSelectedFactor] 更新選中係數資料:', updatedFactor.name, updatedFactor.imported_to_central)
        setSelectedFactor(updatedFactor)
      }
    }
  }
  // 觸發全局刷新
  setRefreshKey(prev => prev + 1)
  // 觸發中央庫刷新（匯入組合係數後需要更新中央庫）
  setCentralLibraryUpdateKey(prev => prev + 1)
}
```

**FactorTable Key** (第 939 行):
```jsx
<FactorTable
  key={`${centralLibraryUpdateKey}-${refreshKey}`}
  // 當 centralLibraryUpdateKey 或 refreshKey 變化時
  // 組件會重新掛載，觸發 useEffect
/>
```

---

## 調用鏈關係圖

```
用戶界面層
  │
  ├─ page.tsx:280
  │  └─ handleRemoveFromCentralRequest()
  │     └─ setRemoveFromCentralDialogOpen(true)
  │        └─ RemoveFromCentralDialog 組件打開
  │
  ├─ RemoveFromCentralDialog:51
  │  └─ handleConfirm() 
  │     └─ onConfirm()  [prop: 父組件傳入]
  │        
  │
  業務邏輯層
  │
  ├─ page.tsx:294
  │  └─ handleRemoveFromCentralConfirm()
  │     └─ removeFromCentral(factorToRemove)  [from useComposites Hook]
  │        
  │
  ├─ useComposites.ts:354
  │  └─ removeFromCentral Hook
  │     └─ removeFromCentralLibrary(factor)
  │        
  │
  數據層
  │
  ├─ useMockData.ts:86
  │  └─ removeFromCentralLibrary()
  │     ├─ (情況 1) importedCompositeFactors.splice()
  │     └─ (情況 2) removedFromCentralIds.add()
  │        
  │
  刷新層
  │
  ├─ page.tsx:387
  │  └─ refreshSelectedFactor()
  │     ├─ setRefreshKey()
  │     └─ setCentralLibraryUpdateKey()
  │        └─ FactorTable 重新掛載
  │           └─ useFactors Hook
  │              └─ getCentralLibraryFactors()
  │                 └─ useMockData.ts:563
  │                    ├─ 合併所有源
  │                    └─ 過濾 removedFromCentralIds
  │                       └─ 返回過濾後的列表
  │
  │
  UI 更新層
  │
  └─ FactorTable 重新渲染
     └─ 列表刷新，移除的係數消失
```

---

## Bug 位置

### Bug 1: useMemo 緩存

**文件**: `/src/hooks/useMockData.ts:560`

```typescript
// ❌ 問題代碼
const factorUsageMap = useMemo(() => calculateFactorUsage(), [])
                                                               ^^
                                                   空依賴項！
```

**影響**: 導致 `factorUsageMap` 只在首次計算，之後不更新

**修復**:
```typescript
// ✅ 修復後
const factorUsageMap = calculateFactorUsage()
```

---

## 關鍵狀態變量

| 變量名 | 位置 | 作用 | 類型 | 生命週期 |
|--------|------|------|------|---------|
| `importedCompositeFactors` | useMockData.ts:60 | 存儲中央庫中的自建組合係數 | Array | 運行時 |
| `removedFromCentralIds` | useMockData.ts:63 | 黑名單：已移除係數的ID | Set | 運行時 |
| `removeFromCentralDialogOpen` | page.tsx:73 | 對話框打開狀態 | Boolean | React |
| `factorToRemove` | page.tsx:74 | 待移除的係數對象 | Object | React |
| `refreshKey` | page.tsx:88 | 自建係數庫刷新觸發器 | Number | React |
| `centralLibraryUpdateKey` | page.tsx:102 | 中央係數庫刷新觸發器 | Number | React |

---

## 測試 Checklist

### 檢查點

- [ ] 修改 `/src/hooks/useMockData.ts:560` 移除 useMemo
- [ ] 驗證 Console 輸出有「過濾掉係數」的 log
- [ ] 測試自建係數移除流程
- [ ] 測試非自建係數移除流程
- [ ] 測試頁面刷新後不重新出現
- [ ] 測試自建係數狀態恢復為「未匯入」

---

**文檔完成**

