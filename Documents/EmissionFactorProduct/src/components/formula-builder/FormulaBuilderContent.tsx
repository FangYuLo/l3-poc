'use client'

import {
  VStack,
  HStack,
  Button,
  Divider,
  Box,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTemplateCalculator } from './hooks/useTemplateCalculator'
import TemplateSelector from './TemplateSelector'
import DynamicForm from './DynamicForm'
import ResultCard from './ResultCard'

interface FormulaBuilderContentProps {
  onSave?: (formulaData: any) => void
  onClose?: () => void
}

export default function FormulaBuilderContent({
  onSave,
  onClose,
}: FormulaBuilderContentProps) {
  const toast = useToast()
  const [formulaName, setFormulaName] = useState('')

  const {
    template,
    templateId,
    params,
    result,
    isCalculating,
    isDirty,
    requiredParams,
    validation,
    canCalculate,
    updateParam,
    resetParams,
    changeTemplate,
    calculate,
  } = useTemplateCalculator('weighted-composite')

  const handleCalculate = () => {
    calculate()

    // 計算完成後顯示提示
    setTimeout(() => {
      if (result?.success) {
        toast({
          title: '計算成功',
          description: `結果: ${result.value} ${result.unit}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    }, 100)
  }

  const handleSave = () => {
    if (!result || !result.success) {
      toast({
        title: '儲存失敗',
        description: '請先完成計算並確保結果正確',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!formulaName.trim()) {
      toast({
        title: '儲存失敗',
        description: '請輸入公式名稱',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const formulaData = {
      name: formulaName,
      template_id: templateId,
      params,
      computed_value: result.value,
      unit: result.unit,
      metadata: {
        calculation_steps: result.steps,
        warnings: result.warnings,
        errors: result.errors,
        total_duration: result.duration,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('儲存公式係數:', formulaData)

    if (onSave) {
      onSave(formulaData)
    }

    toast({
      title: '公式係數已儲存',
      description: `「${formulaName}」已儲存到自建係數資料夾`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // 重置表單
    setFormulaName('')
    resetParams()
  }

  const handleReset = () => {
    setFormulaName('')
    resetParams()
    toast({
      title: '已重置',
      description: '表單已清空',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <VStack align="stretch" spacing={6} pb={4}>
      {/* 提示訊息 */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertDescription fontSize="sm">
          公式建構器讓您透過預設模板快速建立複雜的計算公式，支援權重組合、單位轉換等多種運算
        </AlertDescription>
      </Alert>

      {/* 模板選擇 */}
      <Box>
        <TemplateSelector
          selectedTemplateId={templateId}
          onSelectTemplate={changeTemplate}
        />
      </Box>

      <Divider />

      {/* 公式名稱輸入 */}
      <Box>
        <label htmlFor="formula-name" style={{ fontSize: '14px', fontWeight: 500 }}>
          公式名稱 *
        </label>
        <input
          id="formula-name"
          type="text"
          value={formulaName}
          onChange={(e) => setFormulaName(e.target.value)}
          placeholder="請輸入公式名稱（例如：燃料混合排放係數）"
          style={{
            width: '100%',
            padding: '8px 12px',
            marginTop: '8px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </Box>

      {/* 動態參數表單 */}
      <Box>
        <DynamicForm
          requiredParams={requiredParams}
          params={params}
          onUpdateParam={updateParam}
          validation={validation}
        />
      </Box>

      {/* 操作按鈕 */}
      <HStack spacing={3}>
        <Button
          colorScheme="blue"
          onClick={handleCalculate}
          isLoading={isCalculating}
          loadingText="計算中"
          isDisabled={!canCalculate}
          flex={1}
        >
          🧮 計算
        </Button>
        <Button variant="outline" onClick={handleReset} flex={1}>
          重置
        </Button>
      </HStack>

      <Divider />

      {/* 計算結果 */}
      <Box>
        <ResultCard result={result} isCalculating={isCalculating} />
      </Box>

      {/* 儲存按鈕 */}
      {result?.success && (
        <HStack spacing={3}>
          <Button
            colorScheme="green"
            onClick={handleSave}
            isDisabled={!formulaName.trim()}
            flex={1}
          >
            💾 儲存為公式係數
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  )
}
