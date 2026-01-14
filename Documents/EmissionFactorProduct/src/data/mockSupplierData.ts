/**
 * L4 供應商係數資料夾 Mock Data
 * 對應 Excel 模板: 光寶供應鏈資料收集_Template_20251125.xlsx
 */

import {
  SupplierInfo,
  SupplierProductFactor,
  SupplierSyncRecord,
  SupplierFolderSummary,
  SupplierListItem,
  SupplierSyncStatus,
  SupplierReviewStatus,
  L3ImportStatus
} from '@/types/types'

// ============================================================================
// 供應商基本資訊 Mock Data
// ============================================================================

export const mockSuppliers: SupplierInfo[] = [
  {
    id: 'supplier_001',
    vendor_code: 'DEL001',
    company_name: '台達電子工業股份有限公司',
    company_address: '台北市內湖區瑞光路186號',
    region: '台灣',
    contact_person: '王小明',
    contact_number: '02-87972088',
    contact_email: 'wang@delta.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'supplier_002',
    vendor_code: 'BEN001',
    company_name: '明基電通股份有限公司',
    company_address: '台北市內湖區基湖路16號',
    region: '台灣',
    contact_person: '李大華',
    contact_number: '02-27278899',
    contact_email: 'lee@benq.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'supplier_003',
    vendor_code: 'LIT001',
    company_name: '光寶科技股份有限公司',
    company_address: '台北市內湖區瑞光路392號',
    region: '台灣',
    contact_person: '張美玲',
    contact_number: '02-87985888',
    contact_email: 'chang@liteon.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'supplier_004',
    vendor_code: 'ASU001',
    company_name: '華碩電腦股份有限公司',
    company_address: '台北市北投區立德路15號',
    region: '台灣',
    contact_person: '陳志偉',
    contact_number: '02-28943447',
    contact_email: 'chen@asus.com',
    created_at: '2023-06-15T08:00:00Z',
    updated_at: '2023-12-20T10:00:00Z'
  },
  {
    id: 'supplier_005',
    vendor_code: 'QUA001',
    company_name: '廣達電腦股份有限公司',
    company_address: '桃園市龜山區文化二路211號',
    region: '台灣',
    contact_person: '林建宏',
    contact_number: '03-3272345',
    contact_email: 'lin@quanta.com',
    created_at: '2023-06-15T08:00:00Z',
    updated_at: '2023-12-20T10:00:00Z'
  },
  {
    id: 'supplier_006',
    vendor_code: 'COM001',
    company_name: '仁寶電腦工業股份有限公司',
    company_address: '台北市內湖區瑞光路581號',
    region: '台灣',
    contact_person: '黃淑芬',
    contact_number: '02-87978000',
    contact_email: 'huang@compal.com',
    created_at: '2022-09-01T08:00:00Z',
    updated_at: '2022-12-15T10:00:00Z'
  }
]

// ============================================================================
// 供應商產品碳足跡係數 Mock Data
// ============================================================================

export const mockSupplierProductFactors: SupplierProductFactor[] = [
  // === 台達電子 - 2023年 新同步資料 ===
  {
    id: 'spf_001',
    supplier_id: 'supplier_001',
    inventory_year: 2023,
    product_name: 'LED驅動器',
    part_number: 'DRV-001',
    production_quantity: 10000,
    quantity_unit: '個',
    notes: '高效能LED驅動器',
    raw_material_stage: 1.85,
    manufacturing_stage: 0.50,
    total_carbon_footprint: 2.35,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_002',
    supplier_id: 'supplier_001',
    inventory_year: 2023,
    product_name: '電源供應器',
    part_number: 'PSU-002',
    production_quantity: 5000,
    quantity_unit: '台',
    notes: '500W模組化電源',
    raw_material_stage: 12.50,
    manufacturing_stage: 3.18,
    total_carbon_footprint: 15.68,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_003',
    supplier_id: 'supplier_001',
    inventory_year: 2023,
    product_name: '控制器',
    part_number: 'CTL-003',
    production_quantity: 8000,
    quantity_unit: '個',
    raw_material_stage: 4.20,
    manufacturing_stage: 1.22,
    total_carbon_footprint: 5.42,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_004',
    supplier_id: 'supplier_001',
    inventory_year: 2023,
    product_name: '散熱模組',
    part_number: 'THM-004',
    production_quantity: 15000,
    quantity_unit: '個',
    raw_material_stage: 0.85,
    manufacturing_stage: 0.35,
    total_carbon_footprint: 1.20,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_005',
    supplier_id: 'supplier_001',
    inventory_year: 2023,
    product_name: '變壓器',
    part_number: 'TRF-005',
    production_quantity: 6000,
    quantity_unit: '個',
    raw_material_stage: 3.50,
    manufacturing_stage: 1.10,
    total_carbon_footprint: 4.60,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },

  // === 台達電子 - 2022年 已審核資料 ===
  {
    id: 'spf_006',
    supplier_id: 'supplier_001',
    inventory_year: 2022,
    product_name: 'LED驅動器',
    part_number: 'DRV-001',
    production_quantity: 9500,
    quantity_unit: '個',
    raw_material_stage: 1.92,
    manufacturing_stage: 0.53,
    total_carbon_footprint: 2.45,
    sync_project_id: 'proj_2023_q1',
    sync_project_name: '2023光寶供應鏈碳足跡收集-Q1',
    sync_time: '2023-01-20T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2023-02-01T14:00:00Z',
    review_comment: '數據完整，通過審核',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_001',
    l3_import_time: '2023-02-05T09:00:00Z',
    created_at: '2023-01-20T10:00:00Z',
    updated_at: '2023-02-05T09:00:00Z'
  },
  {
    id: 'spf_007',
    supplier_id: 'supplier_001',
    inventory_year: 2022,
    product_name: '電源供應器',
    part_number: 'PSU-002',
    production_quantity: 4800,
    quantity_unit: '台',
    raw_material_stage: 13.00,
    manufacturing_stage: 3.22,
    total_carbon_footprint: 16.22,
    sync_project_id: 'proj_2023_q1',
    sync_project_name: '2023光寶供應鏈碳足跡收集-Q1',
    sync_time: '2023-01-20T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2023-02-01T14:00:00Z',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_002',
    l3_import_time: '2023-02-05T09:00:00Z',
    created_at: '2023-01-20T10:00:00Z',
    updated_at: '2023-02-05T09:00:00Z'
  },

  // === 明基電通 - 2023年 新同步資料 ===
  {
    id: 'spf_008',
    supplier_id: 'supplier_002',
    inventory_year: 2023,
    product_name: '顯示器',
    part_number: 'MON-001',
    production_quantity: 3000,
    quantity_unit: '台',
    notes: '27吋 4K 專業顯示器',
    raw_material_stage: 35.80,
    manufacturing_stage: 9.40,
    total_carbon_footprint: 45.20,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_009',
    supplier_id: 'supplier_002',
    inventory_year: 2023,
    product_name: '投影機',
    part_number: 'PRJ-001',
    production_quantity: 1500,
    quantity_unit: '台',
    raw_material_stage: 28.50,
    manufacturing_stage: 7.80,
    total_carbon_footprint: 36.30,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_010',
    supplier_id: 'supplier_002',
    inventory_year: 2023,
    product_name: '網路攝影機',
    part_number: 'CAM-001',
    production_quantity: 8000,
    quantity_unit: '個',
    raw_material_stage: 2.10,
    manufacturing_stage: 0.65,
    total_carbon_footprint: 2.75,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },

  // === 光寶科技 - 2023年 新同步資料 ===
  {
    id: 'spf_011',
    supplier_id: 'supplier_003',
    inventory_year: 2023,
    product_name: '鍵盤',
    part_number: 'KB-001',
    production_quantity: 20000,
    quantity_unit: '個',
    raw_material_stage: 2.90,
    manufacturing_stage: 0.90,
    total_carbon_footprint: 3.80,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_012',
    supplier_id: 'supplier_003',
    inventory_year: 2023,
    product_name: '滑鼠',
    part_number: 'MS-001',
    production_quantity: 25000,
    quantity_unit: '個',
    raw_material_stage: 0.85,
    manufacturing_stage: 0.35,
    total_carbon_footprint: 1.20,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_013',
    supplier_id: 'supplier_003',
    inventory_year: 2023,
    product_name: '充電器',
    part_number: 'CHG-001',
    production_quantity: 30000,
    quantity_unit: '個',
    raw_material_stage: 1.65,
    manufacturing_stage: 0.55,
    total_carbon_footprint: 2.20,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'spf_014',
    supplier_id: 'supplier_003',
    inventory_year: 2023,
    product_name: 'LED燈泡',
    part_number: 'LED-001',
    production_quantity: 50000,
    quantity_unit: '個',
    raw_material_stage: 0.42,
    manufacturing_stage: 0.18,
    total_carbon_footprint: 0.60,
    sync_project_id: 'proj_2024_q1',
    sync_project_name: '2024光寶供應鏈碳足跡收集-Q1',
    sync_time: '2024-01-15T14:30:00Z',
    sync_status: 'new',
    review_status: 'pending',
    l3_status: 'not_imported',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },

  // === 華碩電腦 - 2023年 已審核資料 ===
  {
    id: 'spf_015',
    supplier_id: 'supplier_004',
    inventory_year: 2023,
    product_name: '主機板',
    part_number: 'MB-001',
    production_quantity: 12000,
    quantity_unit: '片',
    raw_material_stage: 8.50,
    manufacturing_stage: 3.50,
    total_carbon_footprint: 12.00,
    sync_project_id: 'proj_2023_q3',
    sync_project_name: '2023供應鏈碳足跡收集-Q3',
    sync_time: '2023-09-15T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2023-10-01T14:00:00Z',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_015',
    l3_import_time: '2023-10-05T09:00:00Z',
    created_at: '2023-09-15T10:00:00Z',
    updated_at: '2023-10-05T09:00:00Z'
  },
  {
    id: 'spf_016',
    supplier_id: 'supplier_004',
    inventory_year: 2023,
    product_name: '顯示卡',
    part_number: 'GPU-001',
    production_quantity: 8000,
    quantity_unit: '片',
    raw_material_stage: 15.20,
    manufacturing_stage: 5.80,
    total_carbon_footprint: 21.00,
    sync_project_id: 'proj_2023_q3',
    sync_project_name: '2023供應鏈碳足跡收集-Q3',
    sync_time: '2023-09-15T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2023-10-01T14:00:00Z',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_016',
    l3_import_time: '2023-10-05T09:00:00Z',
    created_at: '2023-09-15T10:00:00Z',
    updated_at: '2023-10-05T09:00:00Z'
  },

  // === 廣達電腦 - 2023年 已審核資料 ===
  {
    id: 'spf_017',
    supplier_id: 'supplier_005',
    inventory_year: 2023,
    product_name: '筆記型電腦外殼',
    part_number: 'NB-CASE-001',
    production_quantity: 15000,
    quantity_unit: '組',
    raw_material_stage: 12.80,
    manufacturing_stage: 5.50,
    total_carbon_footprint: 18.30,
    sync_project_id: 'proj_2023_q3',
    sync_project_name: '2023供應鏈碳足跡收集-Q3',
    sync_time: '2023-09-15T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2023-10-01T14:00:00Z',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_017',
    l3_import_time: '2023-10-05T09:00:00Z',
    created_at: '2023-09-15T10:00:00Z',
    updated_at: '2023-10-05T09:00:00Z'
  },

  // === 仁寶電腦 - 2022年 待更新資料 ===
  {
    id: 'spf_018',
    supplier_id: 'supplier_006',
    inventory_year: 2022,
    product_name: '筆記型電腦',
    part_number: 'NB-001',
    production_quantity: 10000,
    quantity_unit: '台',
    raw_material_stage: 45.20,
    manufacturing_stage: 12.50,
    total_carbon_footprint: 57.70,
    sync_project_id: 'proj_2022_q4',
    sync_project_name: '2022供應鏈碳足跡收集-Q4',
    sync_time: '2022-12-10T10:00:00Z',
    sync_status: 'processed',
    review_status: 'approved',
    reviewer: '張經理',
    review_time: '2022-12-20T14:00:00Z',
    l3_status: 'imported',
    l3_factor_id: 'l3_ef_018',
    l3_import_time: '2022-12-25T09:00:00Z',
    created_at: '2022-12-10T10:00:00Z',
    updated_at: '2022-12-25T09:00:00Z'
  }
]

// ============================================================================
// 同步記錄 Mock Data
// ============================================================================

export const mockSyncRecords: SupplierSyncRecord[] = [
  {
    sync_id: 'sync_001',
    project_id: 'proj_2024_q1',
    project_name: '2024光寶供應鏈碳足跡收集-Q1',
    project_manager: '張經理',
    supplier_count: 3,
    product_count: 12,
    sync_timestamp: '2024-01-15T14:30:00Z',
    is_read: false,
    new_suppliers: [
      { supplier_id: 'supplier_001', company_name: '台達電子工業股份有限公司', product_count: 5 },
      { supplier_id: 'supplier_002', company_name: '明基電通股份有限公司', product_count: 3 },
      { supplier_id: 'supplier_003', company_name: '光寶科技股份有限公司', product_count: 4 }
    ]
  },
  {
    sync_id: 'sync_002',
    project_id: 'proj_2023_q3',
    project_name: '2023供應鏈碳足跡收集-Q3',
    project_manager: '李主任',
    supplier_count: 2,
    product_count: 3,
    sync_timestamp: '2023-09-15T10:00:00Z',
    is_read: true,
    new_suppliers: [
      { supplier_id: 'supplier_004', company_name: '華碩電腦股份有限公司', product_count: 2 },
      { supplier_id: 'supplier_005', company_name: '廣達電腦股份有限公司', product_count: 1 }
    ]
  },
  {
    sync_id: 'sync_003',
    project_id: 'proj_2023_q1',
    project_name: '2023光寶供應鏈碳足跡收集-Q1',
    project_manager: '張經理',
    supplier_count: 1,
    product_count: 2,
    sync_timestamp: '2023-01-20T10:00:00Z',
    is_read: true,
    new_suppliers: [
      { supplier_id: 'supplier_001', company_name: '台達電子工業股份有限公司', product_count: 2 }
    ]
  }
]

// ============================================================================
// 輔助函數
// ============================================================================

/**
 * 取得所有供應商
 */
export function getAllSuppliers(): SupplierInfo[] {
  return mockSuppliers
}

/**
 * 根據 ID 取得供應商
 */
export function getSupplierById(id: string): SupplierInfo | undefined {
  return mockSuppliers.find(s => s.id === id)
}

/**
 * 取得所有供應商產品係數
 */
export function getAllSupplierProductFactors(): SupplierProductFactor[] {
  return mockSupplierProductFactors
}

/**
 * 根據供應商 ID 取得產品係數
 */
export function getProductFactorsBySupplierId(supplierId: string): SupplierProductFactor[] {
  return mockSupplierProductFactors.filter(f => f.supplier_id === supplierId)
}

/**
 * 根據同步狀態篩選產品係數
 */
export function getProductFactorsBySyncStatus(status: SupplierSyncStatus): SupplierProductFactor[] {
  return mockSupplierProductFactors.filter(f => f.sync_status === status)
}

/**
 * 根據審核狀態篩選產品係數
 */
export function getProductFactorsByReviewStatus(status: SupplierReviewStatus): SupplierProductFactor[] {
  return mockSupplierProductFactors.filter(f => f.review_status === status)
}

/**
 * 根據 L3 匯入狀態篩選產品係數
 */
export function getProductFactorsByL3Status(status: L3ImportStatus): SupplierProductFactor[] {
  return mockSupplierProductFactors.filter(f => f.l3_status === status)
}

/**
 * 取得所有同步記錄
 */
export function getAllSyncRecords(): SupplierSyncRecord[] {
  return mockSyncRecords
}

/**
 * 取得未讀同步記錄
 */
export function getUnreadSyncRecords(): SupplierSyncRecord[] {
  return mockSyncRecords.filter(r => !r.is_read)
}

/**
 * 計算供應商資料夾統計摘要
 */
export function getSupplierFolderSummary(): SupplierFolderSummary {
  const factors = mockSupplierProductFactors

  return {
    total_suppliers: mockSuppliers.length,
    total_products: factors.length,
    imported_to_l3: factors.filter(f => f.l3_status === 'imported').length,
    pending_review: factors.filter(f => f.review_status === 'pending').length,
    new_sync_count: factors.filter(f => f.sync_status === 'new').length
  }
}

/**
 * 取得供應商列表項目（用於表格顯示）
 */
export function getSupplierListItems(): SupplierListItem[] {
  return mockSuppliers.map(supplier => {
    const products = mockSupplierProductFactors.filter(f => f.supplier_id === supplier.id)
    const latestYear = Math.max(...products.map(p => p.inventory_year))
    const avgFootprint = products.length > 0
      ? products.reduce((sum, p) => sum + p.total_carbon_footprint, 0) / products.length
      : 0

    const importedCount = products.filter(p => p.l3_status === 'imported').length
    const l3Status: 'all_imported' | 'partial' | 'none' =
      importedCount === products.length ? 'all_imported' :
      importedCount > 0 ? 'partial' : 'none'

    const hasNewSync = products.some(p => p.sync_status === 'new')
    const lastSyncTime = products.length > 0
      ? products.reduce((latest, p) =>
          new Date(p.sync_time) > new Date(latest) ? p.sync_time : latest
        , products[0].sync_time)
      : ''

    return {
      id: supplier.id,
      company_name: supplier.company_name,
      vendor_code: supplier.vendor_code,
      region: supplier.region,
      product_count: products.length,
      latest_year: latestYear,
      average_carbon_footprint: Math.round(avgFootprint * 100) / 100,
      l3_status: l3Status,
      has_new_sync: hasNewSync,
      last_sync_time: lastSyncTime
    }
  })
}

/**
 * 取得新同步的供應商資料（用於通知面板）
 */
export function getNewSyncSuppliers(): Array<{
  supplier: SupplierInfo
  products: SupplierProductFactor[]
  sync_time: string
  sync_project_name: string
}> {
  const newProducts = mockSupplierProductFactors.filter(f => f.sync_status === 'new')
  const supplierIds = Array.from(new Set(newProducts.map(p => p.supplier_id)))

  return supplierIds.map(supplierId => {
    const supplier = mockSuppliers.find(s => s.id === supplierId)!
    const products = newProducts.filter(p => p.supplier_id === supplierId)

    return {
      supplier,
      products,
      sync_time: products[0]?.sync_time || '',
      sync_project_name: products[0]?.sync_project_name || ''
    }
  })
}

/**
 * 取得歷史比較資料（同產品不同年度）
 */
export function getProductHistoryComparison(supplierId: string, partNumber: string): SupplierProductFactor[] {
  return mockSupplierProductFactors
    .filter(f => f.supplier_id === supplierId && f.part_number === partNumber)
    .sort((a, b) => b.inventory_year - a.inventory_year)
}
