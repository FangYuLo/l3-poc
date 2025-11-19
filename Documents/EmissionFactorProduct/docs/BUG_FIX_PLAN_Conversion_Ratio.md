# Conversion Ratio 功能修復計畫

**文件版本：** 1.0
**建立日期：** 2025-11-13
**狀態：** 📋 待確認實施

---

## 問題摘要

在組合係數編輯器中，Conversion Ratio（單位轉換因子）功能存在兩個關鍵問題：

1. **無法識別同類別單位自動轉換**：即使單位屬於同一類別（如 kg 和 g 都是質量），系統仍無法正確提供自動轉換功能
2. **無法順利輸入數字**：在 Conversion ratio 輸入框中無法正常輸入數值

---

## 問題分析

### 問題 1：無法識別同類別單位自動轉換

#### 根本原因分析

**位置：** `src/components/CompositeEditorDrawer.tsx:1034-1053`

**現況問題：**

目前的 UI 判斷邏輯：
```typescript
{!check.isCompatible && (
  <FormControl width="200px">
    <FormLabel fontSize="xs" mb={1}>
      Conversion ratio <Icon as={InfoIcon} boxSize={2.5} color="gray.500" />
    </FormLabel>
    <NumberInput ... />
  </FormControl>
)}
```

**問題點：**
- 只有當 `!check.isCompatible` (不完全相容) 時才顯示 Conversion ratio 輸入框
- `check.isCompatible` 的定義是「單位完全相同」(行 407)：
  ```typescript
  isCompatible: isExactMatch,  // 只有 fromDenom === toDenom 才為 true
  ```
- **但**，雖然 `check.sameCategory` 和 `check.canAutoConvert` 已經正確識別出同類別單位，卻**沒有在 UI 中使用這些資訊**

**具體案例：**
- 組成係數單位：`kg CO2e/g`
- 目標單位：`kg CO2e/kg`
- `check.isCompatible` = `false` (因為 g ≠ kg)
- `check.sameCategory` = `true` (都是質量)
- `check.canAutoConvert` = `true` (可自動轉換)
- 自動轉換因子：`AUTO_CONVERSION_FACTORS['g']['kg']` = `0.001`

**現有邏輯的問題：**
- 雖然後端已經正確計算出可自動轉換（行 434-440），但 UI 中：
  1. 沒有顯示「可自動轉換」的提示
  2. 沒有顯示建議的轉換因子
  3. 沒有「自動填入」按鈕
  4. 使用者必須自己查找並手動輸入 0.001

#### 為什麼後端邏輯沒有生效？

後端的 `handleUnitConversionToggle` 函數（行 423-467）確實有自動轉換邏輯：
```typescript
if (check.canAutoConvert) {
  const factor = getAutoConversionFactor(check.fromDenom, check.toDenom)
  if (factor !== null) {
    autoFactor = factor
    mode = 'auto'
  }
}
```

**但是**，這個函數只有在點擊警告圖標時才會觸發（行 995）：
```typescript
<Icon
  as={WarningIcon}
  color="orange.500"
  boxSize={3}
  cursor="pointer"
  onClick={() => handleUnitConversionToggle(component.id)}
/>
```

問題是：
1. 使用者不知道要點擊這個警告圖標
2. UI 沒有明確提示「可自動轉換」
3. 即使點擊後自動填入，UI 也沒有顯示這是自動轉換的值

---

### 問題 2：無法順利輸入數字

#### 根本原因分析

**位置：** `src/components/CompositeEditorDrawer.tsx:1039-1051`

**現有程式碼：**
```typescript
<NumberInput
  size="sm"
  value={component.unitConversion?.conversionFactor ?? ''}
  onChange={(valueString, valueNumber) => {
    if (!isNaN(valueNumber)) {
      handleConversionFactorChange(component.id, valueNumber)
    }
  }}
  step={0.1}
  precision={4}
>
  <NumberInputField placeholder="輸入因子" />
</NumberInput>
```

**問題分析：**

1. **Chakra UI NumberInput 行為問題**
   - 當 `value` 是 `''` (空字串) 時，`onChange` 回傳的 `valueNumber` 會是 `NaN`
   - 當使用者**開始輸入**（例如只輸入 "2"），`valueNumber` 會是 `2`
   - 但是，`if (!isNaN(valueNumber))` 條件會阻止空字串的狀態被處理

2. **狀態初始化問題**
   - `component.unitConversion?.conversionFactor` 在初始狀態是 `undefined`
   - `undefined ?? ''` 會給 NumberInput 一個空字串
   - 但 `handleConversionFactorChange` 需要一個數字，導致不一致

3. **潛在的無限迴圈風險**
   - 如果 `valueNumber` 是 `0`，`!isNaN(0)` 為 `true`，會調用 `handleConversionFactorChange`
   - `handleConversionFactorChange` 會更新 state
   - 可能造成不必要的重新渲染

4. **缺少錯誤處理**
   - 沒有處理使用者輸入非法字符的情況
   - 沒有處理負數的情況（轉換因子應該 > 0）
   - 沒有處理極端值（過大或過小的數字）

**具體測試案例會遇到的問題：**
- 輸入框是空的 → 點擊輸入框 → 嘗試輸入 "2" → onChange 觸發，valueNumber = 2 → 調用 handleConversionFactorChange
- 但由於 unitConversion 初始化邏輯，可能造成輸入不順暢

---

## 修復計畫

### 修復 1：增強同類別單位識別與自動轉換 UI

#### 目標
讓使用者清楚知道哪些單位可以自動轉換，並提供一鍵自動填入功能。

#### 修改內容

**A. 在 Conversion ratio 輸入框區域顯示轉換提示**

修改 `CompositeEditorDrawer.tsx:1032-1053` 區域：

```typescript
<HStack justify="flex-end" spacing={4} mt={3}>
  {/* Conversion Ratio (if needed) */}
  {!check.isCompatible && (
    <FormControl width="280px">  {/* 加寬以容納提示 */}
      <HStack justify="space-between" mb={1}>
        <FormLabel fontSize="xs" mb={0}>
          Conversion ratio <Icon as={InfoIcon} boxSize={2.5} color="gray.500" />
        </FormLabel>

        {/* 新增：自動轉換提示 */}
        {check.canAutoConvert && (
          <Badge colorScheme="blue" fontSize="2xs">
            可自動轉換
          </Badge>
        )}
      </HStack>

      <HStack spacing={2}>
        <NumberInput
          size="sm"
          value={component.unitConversion?.conversionFactor ?? ''}
          onChange={(valueString, valueNumber) => {
            // 修復：允許空值，並處理 NaN
            if (valueString === '' || valueString === undefined) {
              // 清除轉換因子
              handleConversionFactorChange(component.id, undefined)
            } else if (!isNaN(valueNumber) && valueNumber > 0) {
              handleConversionFactorChange(component.id, valueNumber)
            }
          }}
          step={0.1}
          precision={4}
          min={0}
          flex={1}
        >
          <NumberInputField placeholder="輸入因子" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        {/* 新增：自動填入按鈕 */}
        {check.canAutoConvert && !component.unitConversion?.conversionFactor && (
          <Tooltip label={`自動轉換：1 ${check.fromDenom} = ${getAutoConversionFactor(check.fromDenom, check.toDenom)} ${check.toDenom}`}>
            <IconButton
              icon={<RepeatIcon />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              aria-label="自動轉換"
              onClick={() => {
                const autoFactor = getAutoConversionFactor(check.fromDenom, check.toDenom)
                if (autoFactor !== null) {
                  handleConversionFactorChange(component.id, autoFactor)
                  toast({
                    title: '已自動填入轉換因子',
                    description: `1 ${check.fromDenom} = ${autoFactor} ${check.toDenom}`,
                    status: 'success',
                    duration: 2000,
                  })
                }
              }}
            />
          </Tooltip>
        )}
      </HStack>

      {/* 新增：轉換公式顯示 */}
      {component.unitConversion?.conversionFactor && (
        <Text fontSize="2xs" color="gray.500" mt={1}>
          {component.value} × {component.unitConversion.conversionFactor} = {component.unitConversion.convertedValue?.toFixed(4)}
        </Text>
      )}
    </FormControl>
  )}

  {/* Weight */}
  <FormControl width="120px">
    ...
  </FormControl>
</HStack>
```

**B. 改進單位警告訊息**

修改 `CompositeEditorDrawer.tsx:1011-1019`：

```typescript
{/* Unit Warning */}
{!check.isCompatible && !component.unitConversion?.convertedValue && (
  <HStack spacing={1}>
    <Icon
      as={check.canAutoConvert ? InfoIcon : WarningIcon}
      color={check.canAutoConvert ? "blue.500" : "orange.500"}
      boxSize={3}
    />
    <Text fontSize="xs" color={check.canAutoConvert ? "blue.600" : "orange.600"}>
      {check.canAutoConvert
        ? `單位可自動轉換 (${check.fromDenom} → ${check.toDenom})`
        : '單位不一致，請輸入轉換因子'}
    </Text>
  </HStack>
)}
```

#### 預期效果
- ✅ 使用者可以清楚看到「可自動轉換」的標記
- ✅ 一鍵點擊即可自動填入正確的轉換因子
- ✅ 顯示轉換公式，方便驗證
- ✅ 提供 Tooltip 顯示轉換關係

---

### 修復 2：修正 NumberInput 輸入問題

#### 目標
讓使用者可以順暢地輸入、修改、清除轉換因子數值。

#### 修改內容

**A. 修改 handleConversionFactorChange 函數簽名**

修改 `CompositeEditorDrawer.tsx:502-536`：

```typescript
// 處理自訂轉換因子輸入
const handleConversionFactorChange = (componentId: number, factor: number | undefined) => {
  setComponents(components.map(comp => {
    if (comp.id === componentId) {
      const check = checkUnitCompatibility(comp.unit, targetUnit)

      // 如果 factor 是 undefined，清除 unitConversion
      if (factor === undefined) {
        return {
          ...comp,
          unitConversion: undefined,
        }
      }

      // 如果 unitConversion 不存在，創建一個新的
      if (!comp.unitConversion) {
        return {
          ...comp,
          unitConversion: {
            mode: 'custom',
            fromUnit: comp.unit,
            toUnit: targetUnit,
            canAutoConvert: check.canAutoConvert,
            conversionFactor: factor,
            convertedValue: comp.value * factor,
            isExpanded: true,
          }
        }
      }

      // 如果已存在，更新它
      return {
        ...comp,
        unitConversion: {
          ...comp.unitConversion,
          mode: 'custom',
          conversionFactor: factor,
          convertedValue: comp.value * factor,
        }
      }
    }
    return comp
  }))
}
```

**B. 改進 NumberInput onChange 邏輯**

在 `CompositeEditorDrawer.tsx:1039-1051` 中：

```typescript
<NumberInput
  size="sm"
  value={component.unitConversion?.conversionFactor ?? ''}
  onChange={(valueString, valueNumber) => {
    // 情況 1：空字串 - 清除轉換因子
    if (valueString === '' || valueString === undefined || valueString === null) {
      handleConversionFactorChange(component.id, undefined)
      return
    }

    // 情況 2：有效數字且大於 0
    if (!isNaN(valueNumber) && valueNumber > 0) {
      handleConversionFactorChange(component.id, valueNumber)
      return
    }

    // 情況 3：無效輸入（如負數、0、非數字）- 不做任何操作
    // 讓 NumberInput 自己處理輸入驗證
  }}
  step={0.1}
  precision={4}
  min={0.0001}  // 新增：最小值限制
  max={1000000}  // 新增：最大值限制
>
  <NumberInputField placeholder="輸入因子" />
  <NumberInputStepper>
    <NumberIncrementStepper />
    <NumberDecrementStepper />
  </NumberInputStepper>
</NumberInput>
```

**C. 新增輸入驗證提示**

在 NumberInput 下方新增錯誤提示：

```typescript
{component.unitConversion?.conversionFactor !== undefined &&
 component.unitConversion.conversionFactor <= 0 && (
  <Text fontSize="2xs" color="red.500" mt={1}>
    轉換因子必須大於 0
  </Text>
)}
```

#### 預期效果
- ✅ 使用者可以順暢輸入數字（包括小數）
- ✅ 可以清除輸入（刪除所有字符）
- ✅ 無效輸入會被阻止（負數、過大過小的值）
- ✅ 沒有不必要的重新渲染或狀態更新

---

## 測試計畫

### 測試案例 1：同類別單位自動轉換

**測試步驟：**
1. 建立組合係數，目標單位選擇 `kg CO2e/kg`
2. 新增一個係數，單位為 `kg CO2e/g`
3. 檢查是否顯示「可自動轉換」標記（藍色 Badge）
4. 檢查是否顯示自動填入按鈕（RepeatIcon）
5. 點擊自動填入按鈕
6. 驗證是否自動填入 `0.001`
7. 驗證是否顯示轉換公式

**預期結果：**
- ✅ 顯示「可自動轉換」標記
- ✅ 顯示自動填入按鈕並有 Tooltip
- ✅ 點擊後自動填入 0.001
- ✅ 顯示 Toast 提示
- ✅ 顯示轉換公式

---

### 測試案例 2：手動輸入轉換因子

**測試步驟：**
1. 建立組合係數，目標單位選擇 `kg CO2e/kg`
2. 新增一個係數，單位為 `kg CO2e/kWh`（跨類別）
3. 在 Conversion ratio 輸入框中輸入 `2.5`
4. 驗證轉換後的值是否正確計算
5. 清除輸入框（刪除所有字符）
6. 驗證是否回到初始狀態

**預期結果：**
- ✅ 可以順利輸入 2.5
- ✅ 顯示正確的轉換公式和結果
- ✅ 清除後回到初始狀態（無轉換因子）

---

### 測試案例 3：邊界條件測試

**測試步驟：**
1. 嘗試輸入 `0` → 應該被阻止
2. 嘗試輸入負數 `-1.5` → 應該被阻止
3. 嘗試輸入極小值 `0.00001`
4. 嘗試輸入極大值 `999999`
5. 嘗試輸入非數字字符（應該被 NumberInput 阻止）

**預期結果：**
- ✅ 0 和負數被阻止
- ✅ 極小極大值在合理範圍內可接受
- ✅ 非數字字符被阻止

---

### 測試案例 4：多個組成係數混合測試

**測試步驟：**
1. 建立組合係數，目標單位 `kg CO2e/kg`
2. 新增係數 A：`kg CO2e/kg`（完全相同，無需轉換）
3. 新增係數 B：`kg CO2e/g`（同類別，可自動轉換）
4. 新增係數 C：`kg CO2e/kWh`（跨類別，需自訂轉換）
5. 驗證每個係數的顯示和行為是否正確

**預期結果：**
- ✅ 係數 A 不顯示 Conversion ratio 輸入框
- ✅ 係數 B 顯示「可自動轉換」標記和自動填入按鈕
- ✅ 係數 C 顯示輸入框但無自動填入選項
- ✅ 最終計算值正確

---

## 檔案修改清單

### 需要修改的檔案

1. **`src/components/CompositeEditorDrawer.tsx`**
   - 修改 `handleConversionFactorChange` 函數（行 502-536）
   - 修改 Conversion ratio UI 區塊（行 1032-1053）
   - 修改單位警告訊息（行 1011-1019）
   - 新增 RepeatIcon 按鈕和相關邏輯

### 新增的依賴項目

需要確認以下 Chakra UI 組件已匯入：
```typescript
import {
  // ... 現有的匯入
  Tooltip,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
```

---

## 風險評估

### 低風險
- UI 改進（新增按鈕、標記、提示）
- NumberInput 的邏輯改善

### 中風險
- `handleConversionFactorChange` 簽名改變（允許 `undefined`）
  - **緩解措施：** 完整的回歸測試，確保現有功能不受影響

### 可能的副作用
- 如果有其他地方調用 `handleConversionFactorChange`，需要一併修改
  - **檢查結果：** 只有 UI 中的 NumberInput onChange 會調用此函數，安全

---

## 實施步驟

### 第 1 步：修改 handleConversionFactorChange
- 修改函數簽名支援 `undefined`
- 新增清除 unitConversion 的邏輯

### 第 2 步：改進 NumberInput
- 修改 onChange 邏輯處理空值和邊界條件
- 新增 min/max 限制
- 新增 NumberInputStepper 組件

### 第 3 步：增強 UI
- 新增「可自動轉換」Badge
- 新增自動填入按鈕
- 新增轉換公式顯示
- 改進警告訊息

### 第 4 步：測試
- 執行所有測試案例
- 檢查回歸問題

### 第 5 步：文件更新
- 更新相關文件說明新功能

---

## 預計工作量

- **開發時間：** 2-3 小時
- **測試時間：** 1-2 小時
- **總計：** 3-5 小時

---

## 結論

這兩個問題的根本原因是：
1. **UI 沒有充分利用後端已經計算好的資訊**（`canAutoConvert`、自動轉換因子）
2. **NumberInput 的 onChange 邏輯不夠健壯**，沒有處理邊界情況

修復後，使用者體驗將大幅改善：
- ✅ 清楚知道哪些單位可自動轉換
- ✅ 一鍵自動填入，減少手動查找轉換因子的麻煩
- ✅ 輸入體驗更流暢，沒有卡頓或異常行為
- ✅ 提供即時的視覺回饋（轉換公式、Toast 提示）

---

**文件結束**
