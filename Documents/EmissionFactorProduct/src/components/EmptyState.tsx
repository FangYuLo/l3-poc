'use client'

import { Box, VStack, Text, Button, Icon } from '@chakra-ui/react'
import { InfoIcon, SearchIcon, AddIcon, StarIcon } from '@chakra-ui/icons'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ElementType
  action?: {
    label: string
    onClick: () => void
    icon?: React.ElementType
  }
}

export function EmptyState({ title, description, icon = InfoIcon, action }: EmptyStateProps) {
  return (
    <Box textAlign="center" py={12} px={6}>
      <VStack spacing={4}>
        <Icon as={icon} boxSize={12} color="gray.400" />
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="medium" color="gray.700">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.500" maxW="md">
            {description}
          </Text>
        </VStack>
        {action && (
          <Button
            onClick={action.onClick}
            leftIcon={action.icon ? <Icon as={action.icon} /> : undefined}
            colorScheme="brand"
            size="sm"
          >
            {action.label}
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export function NoFactorsSelected() {
  return (
    <EmptyState
      title="選擇一個係數"
      description="點擊左側列表中的係數查看詳細資訊"
      icon={InfoIcon}
    />
  )
}

export function NoSearchResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      title="沒有找到符合條件的係數"
      description="試試調整搜尋關鍵字或篩選條件"
      icon={SearchIcon}
      action={onClearFilters ? {
        label: "清除篩選條件",
        onClick: onClearFilters
      } : undefined}
    />
  )
}

export function EmptyCollection({ onAddFactor }: { onAddFactor?: () => void }) {
  return (
    <EmptyState
      title="此資料夾是空的"
      description="開始新增係數到這個資料夾中"
      icon={StarIcon}
      action={onAddFactor ? {
        label: "新增係數",
        onClick: onAddFactor,
        icon: AddIcon
      } : undefined}
    />
  )
}

export function EmptyComposite({ onAddComponent }: { onAddComponent?: () => void }) {
  return (
    <EmptyState
      title="尚未加入任何組成係數"
      description="點擊「新增係數」開始建立組合"
      icon={AddIcon}
      action={onAddComponent ? {
        label: "新增係數",
        onClick: onAddComponent,
        icon: AddIcon
      } : undefined}
    />
  )
}

export default EmptyState