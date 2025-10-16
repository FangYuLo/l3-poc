'use client'

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  Card,
  CardBody,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import {
  DeleteIcon,
  AddIcon,
  CheckIcon,
} from '@chakra-ui/icons'
import { useState } from 'react'
import { formatNumber } from '@/lib/utils'
import FactorSelectorModal from './FactorSelectorModal'
import FormulaBuilderContent from './formula-builder/FormulaBuilderContent'

interface CompositeEditorDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (compositeData: any) => void
}

interface ComponentItem {
  id: number
  factorId?: number // 原始係數的 ID，用於排除已選擇的係數
  name: string
  value: number
  unit: string
  weight: number
}

export default function CompositeEditorDrawer({
  isOpen,
  onClose,
  onSave,
}: CompositeEditorDrawerProps) {
  const toast = useToast()
  
  // Form state
  const [compositeName, setCompositeName] = useState('')
  const [description, setDescription] = useState('')
  const [formulaType, setFormulaType] = useState<'sum' | 'weighted'>('weighted')
  const [targetUnit, setTargetUnit] = useState('kg CO2e/kg')
  const [components, setComponents] = useState<ComponentItem[]>([
    {
      id: 1,
      name: '鋼材原料',
      value: 1.85,
      unit: 'kg CO2e/kg',
      weight: 0.6,
    },
    {
      id: 2,
      name: '加工電力',
      value: 0.509,
      unit: 'kg CO2e/kWh',
      weight: 0.3,
    },
    {
      id: 3,
      name: '運輸排放',
      value: 0.156,
      unit: 'kg CO2e/km',
      weight: 0.1,
    },
  ])
  
  // Factor selector state
  const [isFactorSelectorOpen, setIsFactorSelectorOpen] = useState(false)

  // Calculate composite value
  const calculateCompositeValue = () => {
    if (components.length === 0) return 0
    
    if (formulaType === 'sum') {
      return components.reduce((sum, comp) => sum + comp.value * comp.weight, 0)
    } else {
      // weighted average
      const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
      if (totalWeight === 0) return 0
      
      const weightedSum = components.reduce((sum, comp) => sum + comp.value * comp.weight, 0)
      return weightedSum / totalWeight
    }
  }

  const computedValue = calculateCompositeValue()

  const handleWeightChange = (id: number, weight: number) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, weight } : comp
    ))
  }

  const handleRemoveComponent = (id: number) => {
    setComponents(components.filter(comp => comp.id !== id))
  }

  const handleAddComponent = () => {
    setIsFactorSelectorOpen(true)
  }

  // 處理係數選擇完成
  const handleFactorSelect = (selectedFactors: any[]) => {
    const newComponents: ComponentItem[] = selectedFactors.map(factor => ({
      id: Date.now() + Math.random(), // 生成唯一 ID
      factorId: factor.id, // 保存原始係數 ID
      name: factor.name,
      value: factor.value,
      unit: factor.unit,
      weight: selectedFactors.length > 0 ? 1.0 / selectedFactors.length : 1.0, // 平均分配權重
    }))
    
    setComponents(prev => [...prev, ...newComponents])
    setIsFactorSelectorOpen(false)
    
    toast({
      title: '係數已加入',
      description: `成功加入 ${selectedFactors.length} 個係數到組合中`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const validateForm = () => {
    const errors = []
    
    if (!compositeName.trim()) {
      errors.push('請輸入組合係數名稱')
    }
    
    if (components.length === 0) {
      errors.push('至少需要一個組成係數')
    }
    
    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
    if (formulaType === 'weighted' && Math.abs(totalWeight - 1) > 0.001) {
      errors.push('權重總和應該等於 1.0')
    }
    
    const invalidWeights = components.filter(comp => comp.weight <= 0)
    if (invalidWeights.length > 0) {
      errors.push('所有權重必須大於 0')
    }
    
    return errors
  }

  const handleSave = () => {
    const errors = validateForm()
    
    if (errors.length > 0) {
      toast({
        title: '驗證失敗',
        description: errors.join('; '),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const compositeData = {
      name: compositeName,
      description,
      formula_type: formulaType,
      unit: targetUnit,
      computed_value: computedValue,
      components: components.map(comp => ({
        ef_id: comp.id,
        weight: comp.weight,
      })),
    }

    console.log('Saving composite factor:', compositeData)
    
    // 呼叫父組件的儲存函數
    onSave?.(compositeData)
    
    toast({
      title: '組合係數已建立',
      description: `「${compositeName}」已儲存到自建係數資料夾`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    
    // 清除表單
    setCompositeName('')
    setDescription('')
    setComponents([])
    onClose()
  }

  const handleReset = () => {
    setCompositeName('')
    setDescription('')
    setComponents([])
  }

  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
  const isWeightedFormula = formulaType === 'weighted'
  const weightError = isWeightedFormula && Math.abs(totalWeight - 1) > 0.001

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>自建組合係數編輯器</DrawerHeader>

        <DrawerBody>
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList mb={4}>
              <Tab>傳統模式</Tab>
              <Tab>🚀 公式建構器</Tab>
            </TabList>

            <TabPanels>
              {/* 傳統模式 - 原有功能 */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={4}>基本資訊</Text>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">組合係數名稱</FormLabel>
                  <Input
                    value={compositeName}
                    onChange={(e) => setCompositeName(e.target.value)}
                    placeholder="請輸入組合係數名稱"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">描述</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="請輸入組合係數的詳細描述..."
                    rows={3}
                  />
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">計算方式</FormLabel>
                    <Select
                      value={formulaType}
                      onChange={(e) => setFormulaType(e.target.value as 'sum' | 'weighted')}
                    >
                      <option value="weighted">權重平均</option>
                      <option value="sum">權重加總</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">目標單位</FormLabel>
                    <Select
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                    >
                      <option value="kg CO2e/kg">kg CO2e/kg</option>
                      <option value="kg CO2e/kWh">kg CO2e/kWh</option>
                      <option value="kg CO2e/unit">kg CO2e/unit</option>
                      <option value="kg CO2e/m³">kg CO2e/m³</option>
                      <option value="kg CO2e/L">kg CO2e/L</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Components */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="md" fontWeight="medium">組成係數</Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleAddComponent}
                >
                  新增係數
                </Button>
              </HStack>

              {components.length > 0 ? (
                <Box borderRadius="md" border="1px solid" borderColor="gray.200" overflow="hidden">
                  <Table size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>係數名稱</Th>
                        <Th isNumeric>值</Th>
                        <Th>單位</Th>
                        <Th isNumeric>權重</Th>
                        <Th width="60px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {components.map((component) => (
                        <Tr key={component.id}>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">
                              {component.name}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontSize="sm" fontFamily="mono">
                              {formatNumber(component.value)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{component.unit}</Text>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              size="sm"
                              min={0}
                              max={isWeightedFormula ? 1 : undefined}
                              step={0.1}
                              value={component.weight}
                              onChange={(_, value) => handleWeightChange(component.id, value)}
                              w="80px"
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<DeleteIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveComponent(component.id)}
                              aria-label="Remove component"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box
                  p={8}
                  textAlign="center"
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  color="gray.500"
                >
                  <Text fontSize="sm">尚未加入任何組成係數</Text>
                  <Text fontSize="xs" mt={1}>點擊「新增係數」開始建立組合</Text>
                </Box>
              )}

              {/* Weight Summary */}
              {components.length > 0 && (
                <HStack justify="space-between" mt={4} p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    權重總計:
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontFamily="mono">
                      {totalWeight.toFixed(3)}
                    </Text>
                    {weightError && (
                      <Badge colorScheme="red" size="sm">
                        應為 1.0
                      </Badge>
                    )}
                  </HStack>
                </HStack>
              )}
            </Box>

            <Divider />

            {/* Calculation Result */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={4}>計算結果</Text>
              
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">計算方式:</Text>
                      <Badge colorScheme={formulaType === 'weighted' ? 'blue' : 'green'}>
                        {formulaType === 'weighted' ? '權重平均' : '權重加總'}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">組成係數數量:</Text>
                      <Text fontSize="sm">{components.length} 個</Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between" align="center">
                      <Text fontSize="md" fontWeight="medium">組合係數值:</Text>
                      <Text fontSize="xl" fontWeight="bold" fontFamily="mono" color="brand.600">
                        {formatNumber(computedValue)} {targetUnit}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {weightError && (
                <Alert status="warning" size="sm" borderRadius="md" mt={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    權重總和應該等於 1.0，目前為 {totalWeight.toFixed(3)}
                  </Text>
                </Alert>
              )}
            </Box>
                </VStack>
              </TabPanel>

              {/* 公式建構器模式 - 新功能 */}
              <TabPanel px={0}>
                <FormulaBuilderContent onSave={onSave} onClose={onClose} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter borderTop="1px solid" borderColor="gray.200">
          <HStack w="100%" justify="space-between">
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSave}
                leftIcon={<CheckIcon />}
                isDisabled={components.length === 0 || !compositeName.trim()}
              >
                儲存組合係數
              </Button>
            </HStack>
          </HStack>
        </DrawerFooter>
      </DrawerContent>

      {/* 係數選擇器 Modal */}
      <FactorSelectorModal
        isOpen={isFactorSelectorOpen}
        onClose={() => setIsFactorSelectorOpen(false)}
        onConfirm={handleFactorSelect}
        excludeIds={components.map(comp => comp.factorId).filter(Boolean) as number[]}
        targetUnit={targetUnit}
      />
    </Drawer>
  )
}