'use client'

import {
  HStack,
  Button,
  Badge,
  Tooltip,
  Box,
  Text,
} from '@chakra-ui/react'
import { getAllSystemTemplates } from '@/data/mockFormulaTemplates'

interface VisualTemplateSelectorProps {
  selectedTemplateId: string | null
  onSelectTemplate: (templateId: string) => void
  isDisabled?: boolean
}

export default function VisualTemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  isDisabled = false,
}: VisualTemplateSelectorProps) {
  const templates = getAllSystemTemplates()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'green'
      case 'intermediate':
        return 'orange'
      case 'advanced':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return '基礎'
      case 'intermediate':
        return '中級'
      case 'advanced':
        return '進階'
      default:
        return '未知'
    }
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
        快速模板:
      </Text>
      <HStack spacing={2} wrap="wrap">
        {templates.map((template) => (
          <Tooltip
            key={template.id}
            label={template.description}
            placement="bottom"
            hasArrow
          >
            <Button
              size="sm"
              variant={selectedTemplateId === template.id ? 'solid' : 'outline'}
              colorScheme={selectedTemplateId === template.id ? 'blue' : 'gray'}
              leftIcon={<span>{template.ui.icon}</span>}
              onClick={() => onSelectTemplate(template.id)}
              isDisabled={isDisabled}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              {template.name}
              <Badge
                ml={2}
                colorScheme={getDifficultyColor(template.ui.difficulty)}
                fontSize="xs"
                variant="subtle"
              >
                {getDifficultyLabel(template.ui.difficulty)}
              </Badge>
            </Button>
          </Tooltip>
        ))}
      </HStack>
    </Box>
  )
}
