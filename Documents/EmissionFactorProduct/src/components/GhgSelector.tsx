'use client'

import {
  Box,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { GHG_OPTIONS } from '@/config/ghgOptions'

interface GhgSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function GhgSelector({ selected, onChange }: GhgSelectorProps) {
  const handleToggle = (ghgValue: string) => {
    if (selected.includes(ghgValue)) {
      // 取消選擇
      onChange(selected.filter(v => v !== ghgValue))
    } else {
      // 新增選擇
      onChange([...selected, ghgValue])
    }
  }

  return (
    <Box>
      <Text fontWeight="medium" fontSize="sm" mb={2}>
        產生之溫室氣體 *
      </Text>
      <Wrap spacing={2}>
        {GHG_OPTIONS.map(ghg => {
          const isSelected = selected.includes(ghg.value)

          return (
            <WrapItem key={ghg.value}>
              <Tag
                size="md"
                variant={isSelected ? 'solid' : 'outline'}
                colorScheme="blue"
                cursor="pointer"
                onClick={() => handleToggle(ghg.value)}
                _hover={{ opacity: 0.8 }}
              >
                <TagLabel>{ghg.label}</TagLabel>
                {isSelected && (
                  <TagCloseButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(ghg.value)
                    }}
                  />
                )}
              </Tag>
            </WrapItem>
          )
        })}
      </Wrap>
      <Text fontSize="xs" color="gray.500" mt={1}>
        依需選擇
      </Text>
    </Box>
  )
}
