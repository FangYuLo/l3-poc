import React from 'react'
import {
  Icon,
  Tooltip,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { 
  InfoIcon
} from '@chakra-ui/icons'
import { FactorUpdateInfo } from '@/hooks/useMockData'

interface UpdateStatusIconProps {
  updateInfo: FactorUpdateInfo
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 更新狀態圖示組件
 * 顯示統一的更新通知圖示
 */
export function UpdateStatusIcon({
  updateInfo,
  onClick,
  size = 'sm'
}: UpdateStatusIconProps) {
  // 統一使用藍色資訊圖示
  const iconConfig = {
    icon: InfoIcon,
    colorScheme: 'blue',
    bgColor: useColorModeValue('blue.100', 'blue.900'),
    borderColor: useColorModeValue('blue.300', 'blue.600'),
  }

  // 生成 tooltip 內容
  const changeText = updateInfo.changePercentage 
    ? `係數變化: ${updateInfo.changePercentage > 0 ? '+' : ''}${updateInfo.changePercentage.toFixed(1)}%` 
    : ''
  
  const tooltipContent = `
    新版本可用 (${updateInfo.newVersion})
    ${changeText}
    點擊查看詳細對比
  `.trim()

  // 根據尺寸設定圖示大小
  const iconSize = size === 'lg' ? 5 : size === 'md' ? 4 : 3
  const buttonSize = size === 'lg' ? 'md' : 'sm'

  return (
    <Tooltip
      label={tooltipContent}
      placement="top"
      hasArrow
      fontSize="xs"
      maxW="250px"
      whiteSpace="pre-line"
    >
      <IconButton
        icon={
          <Icon 
            as={iconConfig.icon} 
            boxSize={iconSize} 
            color={`${iconConfig.colorScheme}.600`}
          />
        }
        size={buttonSize}
        variant="ghost"
        colorScheme={iconConfig.colorScheme}
        bg={iconConfig.bgColor}
        borderWidth="1px"
        borderColor={iconConfig.borderColor}
        borderRadius="full"
        aria-label="係數有可用更新"
        onClick={onClick}
        _hover={{
          bg: useColorModeValue(`${iconConfig.colorScheme}.200`, `${iconConfig.colorScheme}.800`),
          transform: 'scale(1.1)',
        }}
        _active={{
          bg: useColorModeValue(`${iconConfig.colorScheme}.300`, `${iconConfig.colorScheme}.700`),
          transform: 'scale(0.95)',
        }}
        transition="all 0.2s"
        ml={2}
      />
    </Tooltip>
  )
}

export default UpdateStatusIcon