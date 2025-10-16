// ============================================================================
// 公式評估引擎
// ============================================================================

import { ModuleRegistry } from './ModuleRegistry'
import {
  FormulaTemplate,
  ExecutionContext,
  CalculationStep,
  EvaluationResult,
} from '@/types/formula.types'

export class FormulaEvaluator {
  /**
   * 評估模板實例並計算結果
   */
  static evaluate(
    template: FormulaTemplate,
    params: Record<string, any>
  ): EvaluationResult {
    const startTime = Date.now()

    const context: ExecutionContext = {
      variables: { ...params },
      factorCache: new Map(),
      heatValueCache: new Map(),
      errors: [],
      warnings: [],
    }

    const steps: CalculationStep[] = []

    try {
      let currentValue: any = null

      // 依序執行每個模組
      for (const moduleConfig of template.modules) {
        const module = ModuleRegistry.get(moduleConfig.moduleId)

        if (!module) {
          throw new Error(`找不到模組: ${moduleConfig.moduleId}`)
        }

        // 合併全域參數與模組專屬參數
        const moduleParams = {
          ...params,
          ...moduleConfig.params,
          previousValue: currentValue,
        }

        // 執行模組
        const moduleStartTime = Date.now()

        try {
          currentValue = module.execute(context, moduleParams)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知錯誤'
          throw new Error(`模組 ${module.name} 執行失敗: ${errorMessage}`)
        }

        const moduleEndTime = Date.now()

        // 記錄執行步驟
        steps.push({
          moduleId: module.id,
          moduleName: module.name,
          input: moduleParams,
          output: currentValue,
          timestamp: new Date().toISOString(),
          duration: moduleEndTime - moduleStartTime,
        })

        // 更新上下文
        context.previousValue = currentValue
      }

      // 提取最終結果
      let finalValue: number

      if (typeof currentValue === 'number') {
        finalValue = currentValue
      } else if (typeof currentValue === 'object' && currentValue !== null) {
        // 嘗試從物件中提取數值
        if ('value' in currentValue && typeof currentValue.value === 'number') {
          finalValue = currentValue.value
        } else if ('result' in currentValue && typeof currentValue.result === 'number') {
          finalValue = currentValue.result
        } else {
          throw new Error(`無法從模組輸出中提取數值: ${JSON.stringify(currentValue)}`)
        }
      } else {
        throw new Error(`計算結果必須是數字，當前為: ${typeof currentValue}`)
      }

      const endTime = Date.now()

      return {
        success: true,
        value: finalValue,
        unit: template.output.unit,
        steps,
        warnings: context.warnings,
        errors: context.errors,
        duration: endTime - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'

      const endTime = Date.now()

      return {
        success: false,
        value: 0,
        unit: template.output.unit,
        steps,
        warnings: context.warnings,
        errors: [...context.errors, errorMessage],
        duration: endTime - startTime,
      }
    }
  }

  /**
   * 驗證模板參數
   */
  static validateParams(
    template: FormulaTemplate,
    params: Record<string, any>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 收集所有必填參數
    const requiredParams = new Set<string>()

    for (const moduleConfig of template.modules) {
      const module = ModuleRegistry.get(moduleConfig.moduleId)

      if (module) {
        module.inputs
          .filter((input) => input.required)
          .forEach((input) => {
            // 檢查參數是否已在模組配置中提供
            if (!(input.id in moduleConfig.params)) {
              requiredParams.add(input.id)
            }
          })
      }
    }

    // 檢查缺失參數
    for (const paramId of requiredParams) {
      if (
        !(paramId in params) ||
        params[paramId] === null ||
        params[paramId] === undefined ||
        params[paramId] === ''
      ) {
        errors.push(`缺少必填參數: ${paramId}`)
      }
    }

    // 執行各模組的驗證
    for (const moduleConfig of template.modules) {
      const module = ModuleRegistry.get(moduleConfig.moduleId)

      if (module && module.validate) {
        const moduleParams = {
          ...params,
          ...moduleConfig.params,
        }

        const validation = module.validate(moduleParams)

        if (!validation.isValid) {
          errors.push(...validation.errors.map((err) => `${module.name}: ${err}`))
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 取得模板所需的所有參數定義
   */
  static getRequiredParams(template: FormulaTemplate): Array<{
    id: string
    name: string
    type: string
    required: boolean
    options?: Array<{ value: any; label: string }>
    defaultValue?: any
    placeholder?: string
    description?: string
  }> {
    const paramsMap = new Map<string, any>()

    for (const moduleConfig of template.modules) {
      const module = ModuleRegistry.get(moduleConfig.moduleId)

      if (module) {
        module.inputs.forEach((input) => {
          // 如果參數已在模組配置中提供，則不需要用戶輸入
          if (!(input.id in moduleConfig.params) && !paramsMap.has(input.id)) {
            paramsMap.set(input.id, {
              ...input,
              moduleId: module.id,
              moduleName: module.name,
            })
          }
        })
      }
    }

    return Array.from(paramsMap.values())
  }
}

export default FormulaEvaluator
