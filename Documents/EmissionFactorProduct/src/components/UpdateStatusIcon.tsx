import React from 'react'
import {
  Icon,
  Tooltip,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { 
  WarningIcon, 
  InfoIcon, 
  CheckIcon 
} from '@chakra-ui/icons'
import { FactorUpdateInfo } from '@/hooks/useMockData'

interface UpdateStatusIconProps {
  updateInfo: FactorUpdateInfo
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 更新狀態圖示組件
 * 根據更新類型和風險等級顯示對應的圖示和顏色
 */
export function UpdateStatusIcon({
  updateInfo,
  onClick,
  size = 'sm'
}: UpdateStatusIconProps) {
  // 根據更新類型選擇圖示和顏色
  const getIconConfig = () => {
    switch (updateInfo.updateType) {
      case 'major':
        return {
          icon: WarningIcon,
          colorScheme: 'orange',
          bgColor: useColorModeValue('orange.100', 'orange.900'),
          borderColor: useColorModeValue('orange.300', 'orange.600'),
        }
      case 'minor':
        return {
          icon: InfoIcon,
          colorScheme: 'blue',
          bgColor: useColorModeValue('blue.100', 'blue.900'),
          borderColor: useColorModeValue('blue.300', 'blue.600'),
        }
      case 'patch':
        return {
          icon: CheckIcon,
          colorScheme: 'green',
          bgColor: useColorModeValue('green.100', 'green.900'),
          borderColor: useColorModeValue('green.300', 'green.600'),
        }
    }
  }

  const iconConfig = getIconConfig()

  // 生成 tooltip 內容
  const tooltipContent = `
    新版本可用 (${updateInfo.newVersion})
    ${updateInfo.updateReason}
    風險等級: ${updateInfo.riskLevel === 'high' ? '高' : updateInfo.riskLevel === 'medium' ? '中' : '低'}
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