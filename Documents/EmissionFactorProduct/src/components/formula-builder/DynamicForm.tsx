'use client'

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  FormErrorMessage,
  Tag,
  HStack,
  Button,
  IconButton,
  Box,
  Text,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { ModuleInput } from '@/types/formula.types'
import FormulaFactorArrayInput from './FormulaFactorArrayInput'

interface DynamicFormProps {
  requiredParams: Array<ModuleInput & { moduleId?: string; moduleName?: string }>
  params: Record<string, any>
  onUpdateParam: (key: string, value: any) => void
  validation: { isValid: boolean; errors: string[] }
}

export default function DynamicForm({
  requiredParams,
  params,
  onUpdateParam,
  validation,
}: DynamicFormProps) {
  // 處理陣列類型參數 (如 values, weights)
  const [arrayInputs, setArrayInputs] = useState<Record<string, any[]>>({
    values: [0, 0, 0],
    weights: [0.33, 0.33, 0.34],
  })

  if (requiredParams.length === 0) {
    return (
      <Box p={6} textAlign="center" bg="gray.50" borderRadius="md">
        <Text color="gray.500">
          此模板不需要額外參數
        </Text>
      </Box>
    )
  }

  // 處理陣列參數的新增項目
  const handleAddArrayItem = (paramId: string) => {
    const currentArray = arrayInputs[paramId] || []
    const newArray = [...currentArray, paramId === 'weights' ? 0.1 : 0]
    setArrayInputs({ ...arrayInputs, [paramId]: newArray })
    onUpdateParam(paramId, newArray)
  }

  // 處理陣列參數的刪除項目
  const handleRemoveArrayItem = (paramId: string, index: number) => {
    const currentArray = arrayInputs[paramId] || []
    const newArray = currentArray.filter((_, i) => i !== index)
    setArrayInputs({ ...arrayInputs, [paramId]: newArray })
    onUpdateParam(paramId, newArray)
  }

  // 處理陣列參數的更新項目
  const handleUpdateArrayItem = (paramId: string, index: number, value: number) => {
    const currentArray = arrayInputs[paramId] || []
    const newArray = [...currentArray]
    newArray[index] = value
    setArrayInputs({ ...arrayInputs, [paramId]: newArray })
    onUpdateParam(paramId, newArray)
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Box>
        <Text fontSize="md" fontWeight="medium" mb={2}>
          填寫參數
        </Text>
        <Text fontSize="sm" color="gray.600">
          請填入以下必填參數以進行計算
        </Text>
      </Box>

      {requiredParams.map((param) => {
        const hasError = validation.errors.some((err) =>
          err.includes(param.id) || err.includes(param.name)
        )

        // 特殊處理：factors 參數使用新的係數選擇器
        if (param.id === 'factors' && param.type === 'array') {
          return (
            <FormControl key={param.id} isRequired={param.required} isInvalid={hasError}>
              <FormulaFactorArrayInput
                value={params[param.id] || []}
                onChange={(factors) => onUpdateParam(param.id, factors)}
                label={param.name}
                description={param.description}
              />
              {hasError && (
                <FormErrorMessage fontSize="xs">
                  {validation.errors.find((err) => err.includes(param.id))}
                </FormErrorMessage>
              )}
            </FormControl>
          )
        }

        // 陣列類型參數 (一般數值陣列)
        if (param.type === 'array') {
          const currentArray = arrayInputs[param.id] || []

          return (
            <FormControl key={param.id} isRequired={param.required} isInvalid={hasError}>
              <FormLabel fontSize="sm">
                {param.name}
                {param.moduleName && (
                  <Tag size="sm" ml={2} colorScheme="gray" variant="subtle">
                    {param.moduleName}
                  </Tag>
                )}
              </FormLabel>

              <VStack align="stretch" spacing={2}>
                {currentArray.map((value, index) => (
                  <HStack key={index}>
                    <NumberInput
                      value={value}
                      onChange={(_, val) => handleUpdateArrayItem(param.id, index, val)}
                      min={0}
                      step={0.1}
                      precision={3}
                      size="sm"
                    >
                      <NumberInputField placeholder={`項目 ${index + 1}`} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveArrayItem(param.id, index)}
                      aria-label="刪除項目"
                      isDisabled={currentArray.length <= 1}
                    />
                  </HStack>
                ))}

                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddArrayItem(param.id)}
                >
                  新增項目
                </Button>
              </VStack>

              {param.description && (
                <FormHelperText fontSize="xs">{param.description}</FormHelperText>
              )}
            </FormControl>
          )
        }

        // 數字類型參數
        if (param.type === 'number') {
          return (
            <FormControl key={param.id} isRequired={param.required} isInvalid={hasError}>
              <FormLabel fontSize="sm">
                {param.name}
                {param.moduleName && (
                  <Tag size="sm" ml={2} colorScheme="gray" variant="subtle">
                    {param.moduleName}
                  </Tag>
                )}
              </FormLabel>
              <NumberInput
                value={params[param.id] ?? param.defaultValue ?? ''}
                onChange={(_, value) => onUpdateParam(param.id, value)}
                min={0}
                precision={4}
              >
                <NumberInputField placeholder={param.placeholder || '請輸入數值'} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {param.description && (
                <FormHelperText fontSize="xs">{param.description}</FormHelperText>
              )}
              {hasError && (
                <FormErrorMessage fontSize="xs">
                  {validation.errors.find((err) => err.includes(param.id))}
                </FormErrorMessage>
              )}
            </FormControl>
          )
        }

        // 下拉選單類型參數
        if (param.type === 'select') {
          return (
            <FormControl key={param.id} isRequired={param.required} isInvalid={hasError}>
              <FormLabel fontSize="sm">
                {param.name}
                {param.moduleName && (
                  <Tag size="sm" ml={2} colorScheme="gray" variant="subtle">
                    {param.moduleName}
                  </Tag>
                )}
              </FormLabel>
              <Select
                value={params[param.id] ?? param.defaultValue ?? ''}
                onChange={(e) => onUpdateParam(param.id, e.target.value)}
                placeholder={param.placeholder || '請選擇'}
              >
                {param.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {param.description && (
                <FormHelperText fontSize="xs">{param.description}</FormHelperText>
              )}
            </FormControl>
          )
        }

        // 文字類型參數
        if (param.type === 'string') {
          return (
            <FormControl key={param.id} isRequired={param.required} isInvalid={hasError}>
              <FormLabel fontSize="sm">
                {param.name}
                {param.moduleName && (
                  <Tag size="sm" ml={2} colorScheme="gray" variant="subtle">
                    {param.moduleName}
                  </Tag>
                )}
              </FormLabel>
              <Input
                value={params[param.id] ?? param.defaultValue ?? ''}
                onChange={(e) => onUpdateParam(param.id, e.target.value)}
                placeholder={param.placeholder || '請輸入'}
              />
              {param.description && (
                <FormHelperText fontSize="xs">{param.description}</FormHelperText>
              )}
            </FormControl>
          )
        }

        return null
      })}

      {/* 驗證錯誤提示 */}
      {!validation.isValid && validation.errors.length > 0 && (
        <Box
          p={3}
          bg="red.50"
          borderRadius="md"
          borderLeft="4px solid"
          borderColor="red.500"
        >
          <Text fontSize="sm" fontWeight="medium" color="red.700" mb={1}>
            表單驗證失敗
          </Text>
          <VStack align="start" spacing={1}>
            {validation.errors.map((error, index) => (
              <Text key={index} fontSize="xs" color="red.600">
                • {error}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  )
}
