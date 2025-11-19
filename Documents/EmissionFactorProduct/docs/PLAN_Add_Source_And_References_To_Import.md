# 修改計畫：匯入中央庫時顯示係數來源和引用專案

**文件版本：** 1.0
**建立日期：** 2025-11-13
**狀態：** 📋 待確認實施

---

## 需求摘要

在將自建組合係數匯入中央係數庫時，需要在「基本資訊」表格中新增兩個欄位：

1. **係數來源**：顯示組合係數中每個組成係數的來源
2. **引用專案**：顯示真的有被引用過的專案名稱，若初次匯入沒有被引用過則呈現「未被引用」

---

## 目前狀況分析

### 現有的基本資訊表格

**位置：** `src/components/ImportCompositeToCentralModal.tsx:358-387`

**目前顯示的欄位：**
1. Factor Name（係數名稱）
2. Description（描述）- 選填
3. Factor Value（係數值）
4. Enabled Date（啟用日期）
5. Geographic Scope（地理範圍）

### 可用的資料結構

#### 1. 組合係數的組成資訊
```typescript
interface CompositeFactor {
  components: CompositeFactorComponent[]
  ...
}

interface CompositeFactorComponent {
  id: number
  composite_id: number
  ef_id: number
  weight: number
  emission_factor?: EmissionFactor  // 包含組成係數的詳細資訊
}
```

#### 2. 係數來源資訊
```typescript
interface EmissionFactor {
  source: string  // 係數來源 (如: 英國 - GHG Emission Factors Hub 2024)
  source_type: SourceType  // 'standard' | 'pact' | 'supplier' | 'user_defined'
  source_ref?: string  // 來源參考
  ...
}
```

#### 3. 引用專案資訊
```typescript
interface FactorUsageInfo {
  total_usage_count: number
  project_references: ProjectReference[]
  usage_summary: string
}

interface ProjectReference {
  project_id: string
  project_name: string
  project_type: 'L1' | 'L2' | 'L4'
  usage_count: number
  last_used_date: string
}
```

---

## 修改計畫

### 修改 1：新增「係數來源」欄位

#### 目標
顯示組合係數中所有組成係數的來源，讓使用者了解這個組合係數是基於哪些來源建立的。

#### 實作方式

**A. 建立輔助函數：彙整係數來源**

在 `ImportCompositeToCentralModal.tsx` 中新增函數：

```typescript
// 彙整組合係數的所有組成係數來源
const getComponentSources = (compositeFactor: CompositeFactor): string => {
  const sources = compositeFactor.components
    .map(comp => {
      // 優先使用 source，其次使用 source_ref
      const source = comp.emission_factor?.source ||
                    comp.emission_factor?.source_ref ||
                    '未知來源'
      return source
    })
    .filter((value, index, self) => self.indexOf(value) === index)  // 去重複

  if (sources.length === 0) {
    return '無組成係數來源資訊'
  }

  if (sources.length === 1) {
    return sources[0]
  }

  // 多個來源時，用頓號分隔
  return sources.join('、')
}
```

**B. 在基本資訊表格中新增欄位**

在 `<Table>` 的 `<Tbody>` 中新增：

```tsx
<Tr>
  <Td bg="gray.50" fontWeight="medium">係數來源</Td>
  <Td>
    <Text fontSize="sm">
      {getComponentSources(compositeFactor)}
    </Text>
  </Td>
</Tr>
```

**位置：** 插入在 Geographic Scope 之後

#### 顯示效果範例

```
┌─────────────────────┬──────────────────────────────────────┐
│ Factor Name         │ 筆記型電腦組裝製程                    │
├─────────────────────┼──────────────────────────────────────┤
│ Factor Value        │ 1.8450 kg CO2e/kg                    │
├─────────────────────┼──────────────────────────────────────┤
│ Enabled Date        │ 2024-11-13                          │
├─────────────────────┼──────────────────────────────────────┤
│ Geographic Scope    │ 台灣                                 │
├─────────────────────┼──────────────────────────────────────┤
│ 係數來源            │ 台電 2024、ecoinvent 3.9、IPCC 2021 │
└─────────────────────┴──────────────────────────────────────┘
```

---

### 修改 2：新增「引用專案」欄位

#### 目標
顯示該組合係數已被哪些專案引用，若初次匯入沒有被引用則顯示「未被引用」。

#### 實作方式

**A. 建立輔助函數：格式化引用專案資訊**

在 `ImportCompositeToCentralModal.tsx` 中新增函數：

```typescript
// 格式化引用專案資訊
const getReferencedProjects = (compositeFactor: CompositeFactor): string => {
  // 檢查是否有 usage_info
  if (!compositeFactor.usage_info) {
    return '未被引用'
  }

  const { project_references } = compositeFactor.usage_info

  // 沒有引用專案
  if (!project_references || project_references.length === 0) {
    return '未被引用'
  }

  // 有引用專案：顯示專案名稱
  const projectNames = project_references.map(ref => ref.project_name)

  if (projectNames.length === 1) {
    return projectNames[0]
  }

  // 多個專案時，用頓號分隔
  return projectNames.join('、')
}
```

**B. 建立進階版本：帶專案類型標記**

```typescript
// 格式化引用專案資訊（進階版：包含專案類型）
const getReferencedProjectsWithTypes = (compositeFactor: CompositeFactor): JSX.Element => {
  // 檢查是否有 usage_info
  if (!compositeFactor.usage_info) {
    return <Text fontSize="sm" color="gray.500">未被引用</Text>
  }

  const { project_references } = compositeFactor.usage_info

  // 沒有引用專案
  if (!project_references || project_references.length === 0) {
    return <Text fontSize="sm" color="gray.500">未被引用</Text>
  }

  // 專案類型對應顯示文字和顏色
  const projectTypeMap = {
    'L1': { label: '組織盤查', color: 'blue' },
    'L2': { label: '產品碳足跡', color: 'green' },
    'L4': { label: '供應商係數', color: 'purple' },
  }

  // 有引用專案：顯示專案名稱和類型標記
  return (
    <VStack align="start" spacing={1}>
      {project_references.map((ref, index) => (
        <HStack key={index} spacing={2}>
          <Text fontSize="sm">{ref.project_name}</Text>
          <Badge
            colorScheme={projectTypeMap[ref.project_type].color}
            fontSize="xs"
          >
            {projectTypeMap[ref.project_type].label}
          </Badge>
        </HStack>
      ))}
    </VStack>
  )
}
```

**C. 在基本資訊表格中新增欄位**

**選項 1：簡單版本（純文字）**

```tsx
<Tr>
  <Td bg="gray.50" fontWeight="medium">引用專案</Td>
  <Td>
    <Text fontSize="sm">
      {getReferencedProjects(compositeFactor)}
    </Text>
  </Td>
</Tr>
```

**選項 2：進階版本（帶專案類型標記）**

```tsx
<Tr>
  <Td bg="gray.50" fontWeight="medium">引用專案</Td>
  <Td>
    {getReferencedProjectsWithTypes(compositeFactor)}
  </Td>
</Tr>
```

**位置：** 插入在「係數來源」之後

#### 顯示效果範例

**簡單版本：**
```
┌─────────────────────┬──────────────────────────────────────┐
│ 係數來源            │ 台電 2024、ecoinvent 3.9、IPCC 2021 │
├─────────────────────┼──────────────────────────────────────┤
│ 引用專案            │ 未被引用                             │
└─────────────────────┴──────────────────────────────────────┘
```

**或（已被引用）：**
```
┌─────────────────────┬──────────────────────────────────────┐
│ 引用專案            │ 2024台積電碳盤查、筆電產品碳足跡專案 │
└─────────────────────┴──────────────────────────────────────┘
```

**進階版本（帶標記）：**
```
┌─────────────────────┬──────────────────────────────────────┐
│ 引用專案            │ 2024台積電碳盤查 [組織盤查]          │
│                     │ 筆電產品碳足跡專案 [產品碳足跡]       │
└─────────────────────┴──────────────────────────────────────┘
```

---

## 完整的修改後表格結構

### 最終顯示效果

```
【基本資訊】（自動帶入，唯讀）

┌─────────────────────┬──────────────────────────────────────┐
│ Factor Name         │ 筆記型電腦組裝製程                    │
├─────────────────────┼──────────────────────────────────────┤
│ Description         │ 包含材料、電力、運輸的綜合排放係數    │
├─────────────────────┼──────────────────────────────────────┤
│ Factor Value        │ 1.8450 kg CO₂e/kg                    │
├─────────────────────┼──────────────────────────────────────┤
│ Enabled Date        │ 2024-11-13                          │
├─────────────────────┼──────────────────────────────────────┤
│ Geographic Scope    │ 台灣                                 │
├─────────────────────┼──────────────────────────────────────┤
│ 係數來源 (新)       │ 台電 2024、ecoinvent 3.9、IPCC 2021 │
├─────────────────────┼──────────────────────────────────────┤
│ 引用專案 (新)       │ 未被引用                             │
└─────────────────────┴──────────────────────────────────────┘
```

---

## 實作細節

### 檔案修改清單

**需要修改的檔案：**
1. `src/components/ImportCompositeToCentralModal.tsx`
   - 新增 `getComponentSources` 函數
   - 新增 `getReferencedProjects` 或 `getReferencedProjectsWithTypes` 函數
   - 在基本資訊表格中新增兩個 `<Tr>` 元素

### 程式碼位置

**插入位置：** `ImportCompositeToCentralModal.tsx:382-385` 之後

**原有程式碼：**
```tsx
<Tr>
  <Td bg="gray.50" fontWeight="medium">Geographic Scope</Td>
  <Td>{getRegionDisplayName(formData.geographic_scope)}</Td>
</Tr>
```

**新增程式碼：**
```tsx
<Tr>
  <Td bg="gray.50" fontWeight="medium">係數來源</Td>
  <Td>
    <Text fontSize="sm">
      {getComponentSources(compositeFactor)}
    </Text>
  </Td>
</Tr>
<Tr>
  <Td bg="gray.50" fontWeight="medium">引用專案</Td>
  <Td>
    {getReferencedProjectsWithTypes(compositeFactor)}
  </Td>
</Tr>
```

---

## 資料來源說明

### 係數來源的資料來源

組成係數的來源資訊從以下路徑取得：
```
compositeFactor.components[].emission_factor.source
compositeFactor.components[].emission_factor.source_ref (備用)
```

### 引用專案的資料來源

引用專案資訊從以下路徑取得：
```
compositeFactor.usage_info.project_references[]
```

**注意事項：**
- 初次匯入時，`usage_info` 可能為 `undefined`
- 即使有 `usage_info`，`project_references` 也可能為空陣列 `[]`
- 兩種情況都應該顯示「未被引用」

---

## 邊界情況處理

### 情況 1：組成係數沒有來源資訊
```typescript
// 處理：顯示「無組成係數來源資訊」或「未知來源」
if (!comp.emission_factor?.source && !comp.emission_factor?.source_ref) {
  return '未知來源'
}
```

### 情況 2：多個組成係數來自同一來源
```typescript
// 處理：使用 Array.filter(...).indexOf(...) 去重複
const sources = [...].filter((value, index, self) =>
  self.indexOf(value) === index
)
```

### 情況 3：初次匯入，沒有 usage_info
```typescript
// 處理：顯示「未被引用」
if (!compositeFactor.usage_info) {
  return '未被引用'
}
```

### 情況 4：有 usage_info 但 project_references 為空
```typescript
// 處理：同樣顯示「未被引用」
if (!project_references || project_references.length === 0) {
  return '未被引用'
}
```

---

## 使用者體驗改進

### 視覺設計

1. **係數來源**
   - 使用正常字體大小 `fontSize="sm"`
   - 多個來源用頓號「、」分隔
   - 如果來源太長，考慮換行顯示

2. **引用專案**
   - 「未被引用」使用灰色 `color="gray.500"` 表示空狀態
   - 已引用的專案使用正常文字顏色
   - 進階版本：使用彩色 Badge 標記專案類型

### 文字說明

建議在表格上方新增說明文字：

```tsx
<Text fontSize="xs" color="gray.600" mb={2}>
  * 係數來源：顯示組合係數中各組成係數的資料來源
  * 引用專案：顯示已使用此組合係數的專案（初次匯入時為「未被引用」）
</Text>
```

---

## 測試計畫

### 測試案例 1：初次匯入組合係數
**預期結果：**
- 係數來源：顯示所有組成係數的來源（去重複）
- 引用專案：顯示「未被引用」

### 測試案例 2：已被引用的組合係數
**預期結果：**
- 係數來源：顯示所有組成係數的來源
- 引用專案：顯示專案名稱列表，帶專案類型標記

### 測試案例 3：單一來源的組合係數
**預期結果：**
- 係數來源：直接顯示該來源名稱，不用頓號

### 測試案例 4：組成係數缺少來源資訊
**預期結果：**
- 係數來源：顯示「未知來源」或「無組成係數來源資訊」

---

## 建議實作順序

1. **第一步**：實作 `getComponentSources` 函數
2. **第二步**：在表格中新增「係數來源」欄位並測試
3. **第三步**：實作 `getReferencedProjects` 函數（簡單版）
4. **第四步**：在表格中新增「引用專案」欄位並測試
5. **第五步（選填）**：如果需要，升級為 `getReferencedProjectsWithTypes`（進階版）

---

## 預計工作量

- **開發時間**：1-2 小時
- **測試時間**：30 分鐘
- **總計**：1.5-2.5 小時

---

## 選項建議

### 引用專案顯示方式

**建議採用：進階版本（帶專案類型標記）**

**理由：**
1. 提供更多資訊，幫助使用者了解專案類型
2. 視覺上更清楚，容易區分不同類型的專案
3. 符合產品設計慣例（使用 Badge 標記）
4. 只增加少量程式碼，但價值顯著

---

## 風險評估

- **低風險**：只新增顯示欄位，不修改資料邏輯
- **無破壞性**：不影響現有功能
- **資料安全**：只讀取資料，不修改資料結構

---

## 總結

### 修改摘要

- ✅ 在基本資訊表格新增「係數來源」欄位
- ✅ 在基本資訊表格新增「引用專案」欄位
- ✅ 實作兩個輔助函數處理資料格式化
- ✅ 處理各種邊界情況（無資料、空資料等）
- ✅ 提供清晰的視覺呈現（文字、顏色、Badge）

### 預期效果

使用者在匯入組合係數到中央庫時，可以：
1. 清楚了解組合係數的來源構成
2. 知道此係數是否已被其他專案引用
3. 評估係數的可信度和使用情況

---

**文件結束**
