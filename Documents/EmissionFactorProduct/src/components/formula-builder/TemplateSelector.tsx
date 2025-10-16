'use client'

import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  VStack,
  HStack,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react'
import { FormulaTemplate } from '@/types/formula.types'
import { getAllSystemTemplates } from '@/data/mockFormulaTemplates'

interface TemplateSelectorProps {
  selectedTemplateId: string
  onSelectTemplate: (templateId: string) => void
}

// 難度顏色配置
const DIFFICULTY_COLORS = {
  basic: 'green',
  intermediate: 'blue',
  advanced: 'purple',
}

// 難度文字
const DIFFICULTY_LABELS = {
  basic: '基礎',
  intermediate: '中級',
  advanced: '進階',
}

// 單個模板卡片
function TemplateCard({ template, ...radioProps }: any) {
  const { getInputProps, getRadioProps } = useRadio(radioProps)
  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as="label" cursor="pointer">
      <input {...input} />
      <Card
        {...checkbox}
        variant="outline"
        _checked={{
          borderColor: 'brand.500',
          borderWidth: '2px',
          bg: 'brand.50',
        }}
        _hover={{
          borderColor: 'brand.300',
        }}
        transition="all 0.2s"
      >
        <CardBody>
          <VStack align="stretch" spacing={3}>
            {/* 標題與難度 */}
            <HStack justify="space-between" align="start">
              <HStack spacing={2}>
                <Text fontSize="2xl">{template.ui.icon}</Text>
                <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
                  {template.name}
                </Text>
              </HStack>
              <Badge
                colorScheme={DIFFICULTY_COLORS[template.ui.difficulty]}
                fontSize="xs"
              >
                {DIFFICULTY_LABELS[template.ui.difficulty]}
              </Badge>
            </HStack>

            {/* 描述 */}
            <Text fontSize="sm" color="gray.600" noOfLines={3} minH="60px">
              {template.description}
            </Text>

            {/* 模組數量 */}
            <HStack spacing={2} fontSize="xs" color="gray.500">
              <Text>模組數量: {template.modules.length}</Text>
              {template.category !== 'custom' && (
                <>
                  <Text>•</Text>
                  <Text>
                    {template.category === 'weighted' ? '權重計算' : '單位轉換'}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const templates = getAllSystemTemplates()

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'template',
    value: selectedTemplateId,
    onChange: onSelectTemplate,
  })

  const group = getRootProps()

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontSize="md" fontWeight="medium" mb={2}>
          選擇計算模板
        </Text>
        <Text fontSize="sm" color="gray.600">
          選擇一個預設模板開始建立您的公式係數
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} {...group}>
        {templates.map((template) => {
          const radio = getRadioProps({ value: template.id })
          return (
            <TemplateCard key={template.id} template={template} {...radio} />
          )
        })}
      </SimpleGrid>
    </VStack>
  )
}
