# 自建組合係數 ↔ 中央庫同步流程

**文件版本：** 1.0
**最後更新：** 2025-10-31

---

## 📋 目錄

1. [流程概覽](#流程概覽)
2. [首次匯入流程](#首次匯入流程)
3. [編輯後重新同步流程](#編輯後重新同步流程)
4. [同步狀態追蹤](#同步狀態追蹤)
5. [資料結構](#資料結構)
6. [UI 顯示邏輯](#ui-顯示邏輯)

---

## 流程概覽

```
┌─────────────────┐
│  自建組合係數    │
│  (User-defined) │
└────────┬────────┘
         │
         │ ①首次匯入
         ↓
┌─────────────────┐
│   中央係數庫     │
│  (Central Lib)  │
└────────┬────────┘
         ↑
         │ ②重新同步
         │ (編輯後)
┌────────┴────────┐
│  自建組合係數    │
│   (已編輯)      │
└─────────────────┘
```

### 關鍵欄位

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `imported_to_central` | boolean | 是否已匯入中央庫 |
| `central_library_id` | number | 中央庫中的 ID（匯入後生成） |
| `imported_at` | string | 首次匯入時間（ISO 8601） |
| `last_synced_at` | string | 最後同步時間 |
| `version` | string | 當前版本號（v1.0, v1.1, etc.） |
| `last_synced_version` | string | 中央庫同步的版本號 |

---

## 首次匯入流程

### 流程圖

```
[自建組合係數]
    ↓
[用戶點擊「匯入到中央庫」]
    ↓
[開啟 ImportCompositeToCentralModal]
    ↓
[填寫匯入資訊]
├─ 基本資訊（自動帶入，可編輯）
│  ├─ 係數名稱
│  ├─ 描述
│  ├─ 係數值和單位（唯讀）
│  ├─ 啟用日期（自動使用 enabledDate，唯讀）
│  └─ 組成係數列表（唯讀）
├─ 適用範圍（必填）
│  ├─ 適用產業分類（ISIC Rev.4）*
│  │  └─ 19 個 ISIC 分類（A-S），可複選
│  └─ 地理範圍（自動對應 region，可修改）
│     └─ 台灣/亞洲/歐洲/北美洲/全球
├─ 產品生命週期階段（選填）
│  └─ 原料取得/製造/配送/使用/生命週期終結/回收
├─ 組成說明（自動生成，可編輯）
│  └─ 組成邏輯與計算方法
└─ 數據品質（必填）*
   └─ 品質等級選擇
      └─ Secondary / Primary
    ↓
[用戶確認匯入]
    ↓
[執行 importCompositeToCentral()]
    ↓
[更新自建係數狀態]
├─ imported_to_central = true
├─ central_library_id = [生成的 ID]
├─ imported_at = [當前時間]
├─ last_synced_at = [當前時間]
└─ last_synced_version = [當前 version]
    ↓
[在中央庫中建立係數]
├─ 複製所有資料
├─ 加入匯入資訊
├─ 標記來源為「自建組合係數」
└─ 設定 usageText = "從自建組合係數匯入"
    ↓
[顯示成功訊息]
    ↓
[自建係數顯示同步標記 ✓]
```

### 程式碼實作位置

- **UI 組件**：`src/components/ImportCompositeToCentralModal.tsx`
- **匯入邏輯**：`src/hooks/useComposites.ts` → `importCompositeToCentral()`
- **資料管理**：`src/hooks/useMockData.ts` → `addImportedCompositeToCentral()`

### 驗收標準

- ✅ 匯入後自建係數顯示「已匯入」標記
- ✅ 中央庫出現新係數
- ✅ 版本號同步正確（`version === last_synced_version`）
- ✅ 首次匯入時間記錄正確

---

## 編輯後重新同步流程

### 流程圖

```
[已匯入的自建係數]
    ↓
[用戶編輯係數]
├─ 調整權重
├─ 新增/移除組成係數
├─ 修改名稱/描述
└─ 變更計算方法
    ↓
[儲存編輯]
├─ version 遞增（v1.0 → v1.1）
├─ 建立版本歷史記錄
└─ updated_at 更新
    ↓
[檢測同步狀態]
condition: version > last_synced_version?
    │
    ├─ YES → [顯示「需要同步」警告]
    │        └─ 自建係數旁顯示 ⚠️ 圖示
    │        └─ FactorDetail 顯示同步提示
    │
    └─ NO → [無需同步]
    ↓
[用戶點擊「重新同步到中央庫」]
    ↓
[開啟 ImportCompositeToCentralModal]
├─ 預填之前的匯入資訊
├─ 顯示版本變更摘要
│  ├─ 舊版本：v1.0
│  ├─ 新版本：v1.1
│  └─ 變更內容：「調整權重、組成係數數量 3 → 4」
└─ 允許修改匯入資訊
    ↓
[用戶確認同步]
    ↓
[執行 resyncCompositeToCentral()]
    ↓
[更新中央庫中的係數]
├─ 覆寫係數值和組成
├─ 更新版本號
├─ 記錄變更歷史
└─ 更新 updated_at
    ↓
[更新自建係數同步狀態]
├─ last_synced_at = [當前時間]
├─ last_synced_version = [當前 version]
└─ 保留 imported_at（首次匯入時間）
    ↓
[顯示同步成功訊息]
    ↓
[移除「需要同步」警告 ⚠️]
    ↓
[同步狀態: version === last_synced_version ✓]
```

### 同步觸發時機

| 情境 | 是否需要同步 | 說明 |
|------|-------------|------|
| **首次編輯** | ✅ 需要 | version: v1.0 → v1.1，last_synced: v1.0 |
| **連續編輯** | ✅ 需要 | version: v1.1 → v1.2，last_synced: v1.0 |
| **編輯後同步** | ❌ 不需要 | version: v1.2，last_synced: v1.2 |
| **同步後未編輯** | ❌ 不需要 | version: v1.2，last_synced: v1.2 |

### 程式碼實作位置

- **同步狀態檢查**：`src/hooks/useMockData.ts` → `checkIfNeedsSync()`
- **重新同步邏輯**：`src/hooks/useComposites.ts` → `resyncCompositeToCentral()`（待實作）
- **UI 狀態顯示**：`src/components/FactorTable.tsx`、`src/components/FactorDetail.tsx`

### 驗收標準

- ✅ 編輯後顯示「需要同步」警告
- ✅ 同步後警告消失
- ✅ 版本號正確同步（`version === last_synced_version`）
- ✅ 中央庫係數已更新為最新版本
- ✅ 變更歷史正確記錄

---

## 同步狀態追蹤

### 狀態類型

```typescript
type SyncStatus =
  | 'not_imported'        // 尚未匯入
  | 'synced'              // 已同步（version === last_synced_version）
  | 'needs_sync'          // 需要同步（version > last_synced_version）
  | 'sync_error'          // 同步錯誤
```

### 判斷邏輯

```typescript
function getSyncStatus(factor: UserDefinedCompositeFactor): SyncStatus {
  // 未匯入
  if (!factor.imported_to_central) {
    return 'not_imported'
  }

  // 檢查版本號
  const currentVersion = factor.version || 'v1.0'
  const syncedVersion = factor.last_synced_version || 'v1.0'

  // 版本號比較（需要版本號比較函數）
  if (compareVersions(currentVersion, syncedVersion) > 0) {
    return 'needs_sync'  // 當前版本 > 已同步版本
  }

  return 'synced'  // 已同步
}

// 版本號比較函數
function compareVersions(v1: string, v2: string): number {
  // 解析版本號 "v1.2" → [1, 2]
  const parse = (v: string) => {
    const match = v.match(/^v?(\d+)\.(\d+)$/)
    if (!match) return [1, 0]
    return [parseInt(match[1]), parseInt(match[2])]
  }

  const [major1, minor1] = parse(v1)
  const [major2, minor2] = parse(v2)

  if (major1 !== major2) return major1 - major2
  return minor1 - minor2
}
```

### UI 顯示對應

| 同步狀態 | 圖示 | 顏色 | 文字 | 操作按鈕 |
|---------|------|------|------|---------|
| `not_imported` | - | gray | 未匯入 | 「匯入到中央庫」 |
| `synced` | ✓ | green | 已同步 | 「重新同步」（灰色） |
| `needs_sync` | ⚠️ | orange | 需要同步 | 「重新同步」（藍色） |
| `sync_error` | ❌ | red | 同步失敗 | 「重試同步」 |

---

## 資料結構

### UserDefinedCompositeFactor（自建組合係數）

```typescript
interface UserDefinedCompositeFactor {
  // 基本資訊
  id: number
  name: string
  value: number
  unit: string
  type: 'composite_factor' | 'formula_factor'
  formulaType?: 'weighted' | 'sum'
  components?: CompositeComponent[]

  // 時間戳記
  created_at: string
  updated_at: string

  // 版本控制
  version: string                      // 當前版本號（v1.0, v1.1, v2.0）
  version_history?: VersionHistoryEntry[]  // 版本歷史記錄

  // 同步追蹤
  imported_to_central: boolean         // 是否已匯入中央庫
  central_library_id?: number          // 中央庫中的 ID
  imported_at?: string                 // 首次匯入時間（不變）
  last_synced_at?: string              // 最後同步時間（每次同步更新）
  last_synced_version?: string         // 中央庫已同步的版本號
}
```

### VersionHistoryEntry（版本歷史記錄）

```typescript
interface VersionHistoryEntry {
  version: string          // 版本號 (v1.0, v1.1, etc.)
  date: string            // 更新日期 ISO 8601 格式
  isCurrent: boolean      // 是否為當前版本
  changes?: string        // 變更摘要
  value?: number          // 該版本的計算值
  components?: any[]      // 該版本的組成係數快照
}
```

### CentralLibraryFactor（中央庫係數）

```typescript
interface CentralLibraryFactor extends FactorTableItem {
  // 來源追蹤
  source_composite_id?: number         // 來源自建組合係數 ID
  imported_from: 'user_composite'      // 匯入來源類型

  // 匯入資訊
  data: {
    // ... 原始係數資料
    isic_categories: string[]         // ISIC 產業分類 (必填)
    geographic_scope: string          // 地理範圍（自動對應）
    lifecycle_stages?: string[]       // 產品生命週期階段（選填）
    valid_from?: string               // 啟用日期（自動使用 enabledDate）
    composition_notes?: string        // 組成說明（自動生成）
    data_quality: 'Secondary' | 'Primary'  // 數據品質等級（必填）
    imported_at: string               // 匯入時間
  }

  // 同步資訊
  synced_version: string              // 已同步的版本號
  last_synced_at: string              // 最後同步時間
}
```

---

## UI 顯示邏輯

### FactorTable（係數列表）

**自建組合係數行顯示：**

```tsx
<TableRow>
  <Td>{factor.name}</Td>
  <Td>{factor.value} {factor.unit}</Td>
  <Td>{factor.version}</Td>
  <Td>
    {/* 同步狀態顯示 */}
    {getSyncStatus(factor) === 'not_imported' && (
      <Badge colorScheme="gray">未匯入</Badge>
    )}
    {getSyncStatus(factor) === 'synced' && (
      <Badge colorScheme="green">
        <Icon as={CheckIcon} mr={1} /> 已同步
      </Badge>
    )}
    {getSyncStatus(factor) === 'needs_sync' && (
      <Badge colorScheme="orange">
        <Icon as={WarningIcon} mr={1} /> 需要同步
      </Badge>
    )}
  </Td>
  <Td>
    {/* 操作按鈕 */}
    {getSyncStatus(factor) === 'not_imported' && (
      <Button size="sm" onClick={handleImport}>
        匯入到中央庫
      </Button>
    )}
    {getSyncStatus(factor) === 'needs_sync' && (
      <Button size="sm" colorScheme="blue" onClick={handleResync}>
        重新同步
      </Button>
    )}
  </Td>
</TableRow>
```

### FactorDetail（係數詳情）

**同步狀態卡片：**

```tsx
{factor.imported_to_central && (
  <Card>
    <CardHeader>
      <Heading size="sm">同步狀態</Heading>
    </CardHeader>
    <CardBody>
      <VStack align="stretch" spacing={3}>
        {/* 首次匯入資訊 */}
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">首次匯入：</Text>
          <Text fontSize="sm">{formatDate(factor.imported_at)}</Text>
        </HStack>

        {/* 最後同步資訊 */}
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">最後同步：</Text>
          <Text fontSize="sm">{formatDate(factor.last_synced_at)}</Text>
        </HStack>

        {/* 版本資訊 */}
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">當前版本：</Text>
          <Badge>{factor.version}</Badge>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">已同步版本：</Text>
          <Badge>{factor.last_synced_version}</Badge>
        </HStack>

        <Divider />

        {/* 同步狀態警告 */}
        {getSyncStatus(factor) === 'needs_sync' && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">需要重新同步</AlertTitle>
              <AlertDescription fontSize="xs">
                係數已更新至 {factor.version}，但中央庫仍為 {factor.last_synced_version}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* 同步按鈕 */}
        <Button
          colorScheme={getSyncStatus(factor) === 'needs_sync' ? 'blue' : 'gray'}
          size="sm"
          onClick={handleResync}
          isDisabled={getSyncStatus(factor) === 'synced'}
        >
          {getSyncStatus(factor) === 'needs_sync' ? '重新同步到中央庫' : '已是最新版本'}
        </Button>
      </VStack>
    </CardBody>
  </Card>
)}
```

---

## 實作檢查清單

### Phase 1: 核心邏輯

- [x] 版本號遞增函數
- [x] 版本歷史記錄
- [x] 首次匯入功能
- [ ] 版本號比較函數
- [ ] 同步狀態檢查函數（需更新）
- [ ] 重新同步功能

### Phase 2: UI 顯示

- [ ] FactorTable 顯示同步狀態
- [ ] FactorDetail 顯示同步資訊卡片
- [ ] 同步狀態圖示和顏色
- [ ] 重新同步按鈕

### Phase 3: 使用者體驗

- [ ] 同步前確認對話框
- [ ] 變更摘要顯示
- [ ] 同步進度提示
- [ ] 錯誤處理和重試機制

### Phase 4: 測試

- [ ] 首次匯入測試
- [ ] 編輯後同步測試
- [ ] 版本號比較測試
- [ ] 邊界情況測試（version 格式錯誤、缺失欄位等）

---

## 注意事項

1. **版本號格式**：統一使用 `v1.0`, `v1.1`, `v2.0` 格式（string）
2. **時間戳記格式**：統一使用 ISO 8601 格式（`new Date().toISOString()`）
3. **首次匯入時間不變**：`imported_at` 只在首次匯入時設定，後續同步不改變
4. **變更摘要自動生成**：每次編輯時自動偵測並生成變更摘要
5. **中央庫更新策略**：同步時覆寫中央庫係數，保留 `central_library_id`

---

## 未來擴展

1. **衝突解決**：如果中央庫係數被其他用戶修改，需要提供衝突解決機制
2. **同步歷史**：記錄每次同步的詳細日誌
3. **批次同步**：支援多個係數一次同步
4. **自動同步**：提供自動同步選項（編輯後自動同步）
5. **版本回滾**：支援將中央庫係數回滾到歷史版本

---

**文件結束**
