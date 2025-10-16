// ============================================================================
// 模組註冊中心
// ============================================================================

import { FormulaModule } from '@/types/formula.types'
import {
  FactorSelectorModule,
  HeatValueFetcherModule,
  MultiplyModule,
  WeightedAverageModule,
  WeightedSumModule,
  UnitConverterModule,
  ConstantModule,
} from './modules'

/**
 * 模組註冊中心
 * 負責管理所有可用的公式模組
 */
class ModuleRegistryClass {
  private modules: Map<string, FormulaModule>

  constructor() {
    this.modules = new Map()
    this.registerDefaultModules()
  }

  /**
   * 註冊預設模組
   */
  private registerDefaultModules() {
    const defaultModules = [
      FactorSelectorModule,
      HeatValueFetcherModule,
      MultiplyModule,
      WeightedAverageModule,
      WeightedSumModule,
      UnitConverterModule,
      ConstantModule,
    ]

    defaultModules.forEach((module) => {
      this.register(module)
    })
  }

  /**
   * 註冊單個模組
   */
  register(module: FormulaModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`模組 ${module.id} 已存在，將被覆蓋`)
    }
    this.modules.set(module.id, module)
  }

  /**
   * 取得模組
   */
  get(moduleId: string): FormulaModule | undefined {
    return this.modules.get(moduleId)
  }

  /**
   * 檢查模組是否存在
   */
  has(moduleId: string): boolean {
    return this.modules.has(moduleId)
  }

  /**
   * 取得所有模組
   */
  getAll(): FormulaModule[] {
    return Array.from(this.modules.values())
  }

  /**
   * 根據類別取得模組
   */
  getByCategory(category: 'input' | 'operation' | 'conversion' | 'output'): FormulaModule[] {
    return this.getAll().filter((module) => module.ui.category === category)
  }

  /**
   * 取得所有模組 ID
   */
  getAllIds(): string[] {
    return Array.from(this.modules.keys())
  }

  /**
   * 移除模組
   */
  unregister(moduleId: string): boolean {
    return this.modules.delete(moduleId)
  }

  /**
   * 清空所有模組
   */
  clear(): void {
    this.modules.clear()
  }

  /**
   * 取得模組數量
   */
  get size(): number {
    return this.modules.size
  }
}

// 建立單例
export const ModuleRegistry = new ModuleRegistryClass()

// 預設匯出
export default ModuleRegistry
