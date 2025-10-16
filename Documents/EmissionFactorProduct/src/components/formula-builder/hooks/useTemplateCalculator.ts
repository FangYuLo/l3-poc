'use client'

import { useState, useCallback, useEffect } from 'react'
import { FormulaTemplate, EvaluationResult } from '@/types/formula.types'
import { FormulaEvaluator } from '@/services/formula-engine/FormulaEvaluator'
import { getTemplateById } from '@/data/mockFormulaTemplates'

export function useTemplateCalculator(initialTemplateId?: string) {
  const [templateId, setTemplateId] = useState<string>(initialTemplateId || 'weighted-composite')
  const [params, setParams] = useState<Record<string, any>>({})
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // 取得當前模板
  const template = getTemplateById(templateId)

  // 取得所需參數定義
  const requiredParams = template ? FormulaEvaluator.getRequiredParams(template) : []

  // 更新參數
  const updateParam = useCallback((key: string, value: any) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }))
    setIsDirty(true)
  }, [])

  // 批次更新參數
  const updateParams = useCallback((newParams: Record<string, any>) => {
    setParams(newParams)
    setIsDirty(true)
  }, [])

  // 重置參數
  const resetParams = useCallback(() => {
    setParams({})
    setResult(null)
    setIsDirty(false)
  }, [])

  // 切換模板
  const changeTemplate = useCallback((newTemplateId: string) => {
    setTemplateId(newTemplateId)
    setParams({})
    setResult(null)
    setIsDirty(false)
  }, [])

  // 執行計算
  const calculate = useCallback(() => {
    if (!template) {
      setResult({
        success: false,
        value: 0,
        unit: '',
        steps: [],
        warnings: [],
        errors: ['找不到模板'],
        duration: 0,
      })
      return
    }

    setIsCalculating(true)

    try {
      const evalResult = FormulaEvaluator.evaluate(template, params)
      setResult(evalResult)
      setIsDirty(false)
    } catch (error) {
      setResult({
        success: false,
        value: 0,
        unit: template.output.unit,
        steps: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : '計算失敗'],
        duration: 0,
      })
    } finally {
      setIsCalculating(false)
    }
  }, [template, params])

  // 驗證參數
  const validate = useCallback(() => {
    if (!template) return { isValid: false, errors: ['找不到模板'] }
    return FormulaEvaluator.validateParams(template, params)
  }, [template, params])

  // 自動驗證（當參數改變時）
  const validation = validate()

  // 檢查是否可以計算
  const canCalculate = validation.isValid && !isCalculating

  // 當模板改變時重置
  useEffect(() => {
    setParams({})
    setResult(null)
    setIsDirty(false)
  }, [templateId])

  return {
    // 狀態
    template,
    templateId,
    params,
    result,
    isCalculating,
    isDirty,
    requiredParams,
    validation,
    canCalculate,

    // 操作
    updateParam,
    updateParams,
    resetParams,
    changeTemplate,
    calculate,
    validate,
  }
}
