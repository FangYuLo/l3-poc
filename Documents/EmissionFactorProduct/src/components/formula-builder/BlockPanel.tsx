'use client'

import { Box, VStack, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, Flex, Icon } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { mockHeatValues } from '@/data/mockFormulaData'

interface BlockPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void
}

export default function BlockPanel({ onDragStart }: BlockPanelProps) {
  return (
    <Box w="280px" bg="gray.50" borderRight="1px solid" borderColor="gray.200" p={4} overflowY="auto" h="full">
      <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
        拖曳區塊
      </Text>

      <Accordion defaultIndex={[0, 1, 2]} allowMultiple>
        {/* 排放係數選擇器 */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">排放係數</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={2} align="stretch">
              <Box
                p={3}
                bg="blue.50"
                border="2px dashed"
                borderColor="blue.300"
                borderRadius="md"
                cursor="grab"
                _hover={{ bg: 'blue.100', borderColor: 'blue.400', transform: 'scale(1.02)' }}
                transition="all 0.2s"
                draggable
                onDragStart={(e) =>
                  onDragStart(e, 'emission_factor', {
                    label: '排放係數選擇器',
                    factorName: '請選擇係數',
                    factorValue: 0,
                    factorUnit: 'kg CO₂e'
                  })
                }
              >
                <Flex align="center" gap={2} mb={2}>
                  <SearchIcon color="blue.500" />
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    排放係數選擇器
                  </Text>
                </Flex>
                <Text fontSize="xs" color="gray.600">
                  拖曳到畫布後點擊選擇係數
                </Text>
                <Badge colorScheme="blue" fontSize="xs" mt={2}>
                  可選擇中央/全庫係數
                </Badge>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* 熱值 */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">熱值</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={2} align="stretch">
              {mockHeatValues.map((heatValue) => (
                <Box
                  key={heatValue.id}
                  p={2}
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  borderRadius="md"
                  cursor="grab"
                  _hover={{ bg: 'green.100', transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, 'heat_value', {
                      label: `${heatValue.country} - ${heatValue.fuel_type}`,
                      heatValueId: heatValue.id,
                      country: heatValue.country,
                      fuelType: heatValue.fuel_type,
                      heatValue: heatValue.value,
                      heatUnit: heatValue.unit
                    })
                  }
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    {heatValue.country} - {heatValue.fuel_type}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {heatValue.value} {heatValue.unit}
                  </Text>
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* 運算符號 */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">運算</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={2} align="stretch">
              {[
                { op: 'multiply', symbol: '×', label: '乘法' },
                { op: 'divide', symbol: '÷', label: '除法' },
                { op: 'add', symbol: '+', label: '加法' },
                { op: 'subtract', symbol: '-', label: '減法' }
              ].map((operation) => (
                <Flex
                  key={operation.op}
                  p={2}
                  bg="orange.50"
                  border="1px solid"
                  borderColor="orange.200"
                  borderRadius="md"
                  cursor="grab"
                  _hover={{ bg: 'orange.100', transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, 'operation', {
                      label: operation.label,
                      operation: operation.op,
                      operationSymbol: operation.symbol
                    })
                  }
                  align="center"
                  justify="space-between"
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    {operation.label}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="orange.600">
                    {operation.symbol}
                  </Text>
                </Flex>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* 單位轉換 */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">單位轉換</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={2} align="stretch">
              <Box
                p={3}
                bg="purple.50"
                border="2px dashed"
                borderColor="purple.300"
                borderRadius="md"
                cursor="grab"
                _hover={{ bg: 'purple.100', borderColor: 'purple.400', transform: 'scale(1.02)' }}
                transition="all 0.2s"
                draggable
                onDragStart={(e) =>
                  onDragStart(e, 'unit_conversion', {
                    label: '單位轉換',
                    fromUnit: '請設定',
                    toUnit: '請設定',
                    conversionFactor: 0
                  })
                }
              >
                <Flex align="center" gap={2} mb={2}>
                  <Text fontSize="lg">🔄</Text>
                  <Text fontSize="sm" fontWeight="bold" color="purple.700">
                    單位轉換
                  </Text>
                </Flex>
                <Text fontSize="xs" color="gray.600">
                  拖曳到畫布後點擊設定單位
                </Text>
                <Badge colorScheme="purple" fontSize="xs" mt={2}>
                  能源/質量/體積轉換
                </Badge>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}
