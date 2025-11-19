# Bug 修復：自訂係數詳情顯示問題

## 🐛 問題描述

當點選自訂係數時，係數詳情面板（FactorDetail）無法正確顯示基本資訊，特別是以下欄位：
- **Source of Emission Factor**：顯示為空白
- **Enabled Date**：顯示為空白
- 其他 GHG 排放係數資料也無法正確顯示

## 🔍 問題根因

在 `FactorDetail.tsx` 的 `transformSelectedData` 函數中，缺少對 `custom_factor` 類型的處理邏輯。

當使用者點選自訂係數時：
1. `selected` 物件的結構是 `FactorTableItem`，其中 `type = 'custom_factor'`
2. 完整的 `CustomFactor` 資料存放在 `selected.data` 欄位中
3. 但 `transformSelectedData` 函數沒有處理這種情況
4. 導致返回的物件中 `source` 和 `effective_date` 等欄位為 `undefined`

### Console 輸出證據

```javascript
processedFactor: {
  source: undefined,           // ❌ 錯誤：應該從 data 中提取
  effective_date: undefined,   // ❌ 錯誤：應該從 data 中提取
  data: {
    source: "2352",           // ✅ 正確：資料在這裡
    effective_date: "2025-11-18",  // ✅ 正確：資料在這裡
    ...
  },
  ...
}
```

## ✅ 修復方案

在 `FactorDetail.tsx` 的 `transformSelectedData` 函數中，新增對 `custom_factor` 類型的處理邏輯。

### 修改檔案

**檔案**：`src/components/FactorDetail.tsx`

**位置**：506-549 行（在處理 `emission_factor` 和 `composite_factor` 之後）

### 修改內容

```typescript
// 如果是自訂係數資料
if (selected.type === 'custom_factor') {
  // selected.data 包含完整的 CustomFactor 資料
  const customData = selected.data

  if (!customData) {
    console.error('[transformSelectedData] customData is undefined for custom_factor')
    return selected
  }

  return {
    ...customData,
    // 確保所有必要欄位都存在
    id: customData.id,
    type: 'custom_factor', // 明確設定 type
    name: customData.name,
    source: customData.source,              // ✅ 從 customData 提取
    effective_date: customData.effective_date,  // ✅ 從 customData 提取
    continent: '-', // 自訂係數沒有 continent
    country: '-',   // 自訂係數沒有 country
    region: customData.region, // 保留 region（Area 欄位需要）
    // 保留所有 GHG 資料
    co2_factor: customData.co2_factor,
    co2_unit: customData.co2_unit,
    ch4_factor: customData.ch4_factor,
    ch4_unit: customData.ch4_unit,
    n2o_factor: customData.n2o_factor,
    n2o_unit: customData.n2o_unit,
    hfcs_factor: customData.hfcs_factor,
    hfcs_unit: customData.hfcs_unit,
    pfcs_factor: customData.pfcs_factor,
    pfcs_unit: customData.pfcs_unit,
    sf6_factor: customData.sf6_factor,
    sf6_unit: customData.sf6_unit,
    nf3_factor: customData.nf3_factor,
    nf3_unit: customData.nf3_unit,
  }
}
```

### 關鍵修改點

1. **直接使用 `selected.data`**：
   - 修改前：`const customData = selected.data || selected`
   - 修改後：`const customData = selected.data`
   - 原因：根據 `convertCustomFactorToTableItem` 的邏輯，完整資料一定在 `data` 欄位中

2. **明確提取所有欄位**：
   - 不依賴展開運算子的隱式繼承
   - 明確列出所有需要的欄位，確保資料正確傳遞

3. **補充 7 種 GHG 資料**：
   - 原計畫中只考慮了 CO₂、CH₄、N₂O
   - 修復時補充了 HFCs、PFCs、SF₆、NF₃

## 🔧 額外修復

### 修復 TypeScript 型別錯誤

**檔案**：`src/hooks/useMockData.ts`

**位置**：564-577 行

**問題**：`type` 和 `source_type` 被推斷為 `string` 而非字面量型別

**修復**：
```typescript
return {
  id: factor.id,
  type: 'custom_factor' as const,        // ✅ 使用 as const
  name: factor.name,
  value: mainValue,
  unit: mainUnit,
  year: new Date(factor.effective_date).getFullYear(),
  region: factor.region,
  method_gwp: factor.method_gwp,
  source_type: 'user_defined' as const,  // ✅ 使用 as const
  source_ref: factor.source,
  version: factor.version,
  data: factor,
  imported_to_central: factor.imported_to_central,
  central_library_id: factor.central_library_id,
  imported_at: factor.imported_at,
}
```

### 新增 7 種 GHG 顯示支援

**檔案**：`src/components/FactorDetail.tsx`

**位置**：913-949 行（Emission Factor 區塊）

**新增**：HFCs、PFCs、SF₆、NF₃ 的顯示邏輯

```typescript
{mockFactor.hfcs_factor !== undefined && mockFactor.hfcs_factor !== null && (
  <HStack>
    <Badge colorScheme="blue">HFCs</Badge>
    <Text fontSize="sm">
      {formatNumber(mockFactor.hfcs_factor)} {mockFactor.hfcs_unit || 'kg HFCs'}
    </Text>
  </HStack>
)}
{mockFactor.pfcs_factor !== undefined && mockFactor.pfcs_factor !== null && (
  <HStack>
    <Badge colorScheme="blue">PFCs</Badge>
    <Text fontSize="sm">
      {formatNumber(mockFactor.pfcs_factor)} {mockFactor.pfcs_unit || 'kg PFCs'}
    </Text>
  </HStack>
)}
{mockFactor.sf6_factor !== undefined && mockFactor.sf6_factor !== null && (
  <HStack>
    <Badge colorScheme="blue">SF₆</Badge>
    <Text fontSize="sm">
      {formatNumber(mockFactor.sf6_factor)} {mockFactor.sf6_unit || 'kg SF₆'}
    </Text>
  </HStack>
)}
{mockFactor.nf3_factor !== undefined && mockFactor.nf3_factor !== null && (
  <HStack>
    <Badge colorScheme="blue">NF₃</Badge>
    <Text fontSize="sm">
      {formatNumber(mockFactor.nf3_factor)} {mockFactor.nf3_unit || 'kg NF₃'}
    </Text>
  </HStack>
)}
```

## ✅ 驗證結果

修復後，自訂係數詳情應該正確顯示：
- ✅ Source of Emission Factor：顯示使用者輸入的來源
- ✅ Enabled Date：顯示使用者選擇的啟用日期
- ✅ Area：顯示使用者選擇的 Country/Area
- ✅ Emission Factor：正確顯示使用者選擇的所有 GHG 排放係數

## 📝 學習重點

1. **資料結構的層級關係**：
   - `FactorTableItem` 是列表顯示用的扁平結構
   - `CustomFactor` 是完整的資料結構，存放在 `FactorTableItem.data` 中
   - 詳情顯示時需要從 `data` 欄位提取完整資訊

2. **TypeScript 字面量型別**：
   - 使用 `as const` 確保型別為字面量而非一般 `string`
   - 防止型別不相容錯誤

3. **資料轉換的一致性**：
   - `convertCustomFactorToTableItem`：CustomFactor → FactorTableItem
   - `transformSelectedData`：FactorTableItem → 詳情顯示格式
   - 兩者必須保持一致的資料存取邏輯

## 🎯 影響範圍

- ✅ 修復自訂係數詳情顯示
- ✅ 支援 7 種 GHG 的完整顯示
- ✅ 修復 TypeScript 型別錯誤
- ✅ 不影響現有的排放係數和組合係數功能

---

**修復日期**：2025-11-17
**修復人員**：Claude Code
**測試狀態**：待使用者驗證
