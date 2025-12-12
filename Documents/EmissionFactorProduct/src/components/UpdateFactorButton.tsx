import React, { useState } from 'react'
import {
  Button,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner
} from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
import { useMockData, UpdateResult } from '@/hooks/useMockData'

interface UpdateFactorButtonProps {
  onUpdateDetected?: (result: UpdateResult) => void
}

/**
 * 更新係數資料庫按鈕組件
 * 模擬 Resource_8 係數庫更新，檢測母資料源關聯並觸發通知
 */
export function UpdateFactorButton({ onUpdateDetected }: UpdateFactorButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null)
  const toast = useToast()
  const { simulateUpdateFactorDatabase } = useMockData()

  const handleUpdateDatabase = async () => {
    setIsUpdating(true)
    setUpdateResult(null)

    try {
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 執行更新並檢測關聯
      const result = simulateUpdateFactorDatabase()
      setUpdateResult(result)

      // 顯示更新結果
      if (result.relatedFactorsCount > 0) {
        toast({
          title: '發現相關係數更新',
          description: `找到 ${result.relatedFactorsCount} 筆與中央庫相關的新係數，請檢視更新內容。`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
        
        // 觸發回調，通知父組件處理相關係數
        onUpdateDetected?.(result)
      } else {
        toast({
          title: '係數庫更新完成',
          description: `新增了 ${result.totalNewFactors} 筆係數，暫無與中央庫相關的更新。`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
      }

    } catch (error) {
      console.error('[UpdateFactorButton] 更新失敗:', error)
      toast({
        title: '更新失敗',
        description: '係數庫更新過程中發生錯誤，請稍後再試。',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Box>
      <Button
        leftIcon={isUpdating ? <Spinner size="sm" /> : <RepeatIcon />}
        colorScheme="blue"
        variant="solid"
        size="sm"
        onClick={handleUpdateDatabase}
        isLoading={isUpdating}
        loadingText="更新中..."
        isDisabled={isUpdating}
      >
        {isUpdating ? '更新中...' : '更新係數資料庫'}
      </Button>

      {/* 顯示更新結果摘要 */}
      {updateResult && (
        <Alert 
          status={updateResult.relatedFactorsCount > 0 ? 'info' : 'success'} 
          mt={3} 
          borderRadius="md"
        >
          <AlertIcon />
          <Box>
            <AlertTitle>更新完成!</AlertTitle>
            <AlertDescription fontSize="sm">
              新增 {updateResult.totalNewFactors} 筆係數
              {updateResult.relatedFactorsCount > 0 && (
                <>
                  ，其中 {updateResult.relatedFactorsCount} 筆與中央庫相關
                </>
              )}
              {updateResult.unrelatedFactorsCount > 0 && (
                <>
                  ，{updateResult.unrelatedFactorsCount} 筆為獨立新係數
                </>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  )
}

export default UpdateFactorButton