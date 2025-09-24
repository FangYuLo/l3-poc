'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Dataset } from '@/types/types'

interface DatasetNameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (datasetData: Omit<Dataset, 'id' | 'created_at' | 'updated_at'>) => void
  existingNames: string[] // 用於檢查重複名稱
}

export default function DatasetNameModal({
  isOpen,
  onClose,
  onConfirm,
  existingNames = []
}: DatasetNameModalProps) {
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState({
    name: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除錯誤
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = { name: '' }
    
    // 檢查名稱是否為空
    if (!formData.name.trim()) {
      newErrors.name = '請輸入資料集名稱'
    }
    // 檢查名稱是否重複
    else if (existingNames.includes(formData.name.trim())) {
      newErrors.name = '資料集名稱已存在，請使用其他名稱'
    }
    // 檢查名稱長度
    else if (formData.name.trim().length > 50) {
      newErrors.name = '資料集名稱不能超過50個字元'
    }

    setErrors(newErrors)
    return !newErrors.name
  }

  const handleConfirm = () => {
    if (!validateForm()) {
      return
    }

    const datasetData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      factorIds: [],
      created_by: 'current_user' // 實際應用中會從認證系統獲取
    }

    onConfirm(datasetData)
    handleClose()

    toast({
      title: '資料集已建立',
      description: `「${datasetData.name}」已成功建立`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleClose = () => {
    // 重置表單
    setFormData({
      name: '',
      description: ''
    })
    setErrors({ name: '' })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>新增資料集</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel fontSize="sm">資料集名稱</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="請輸入資料集名稱"
                maxLength={50}
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">描述 (選填)</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="請輸入資料集描述..."
                rows={3}
                maxLength={200}
                resize="vertical"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            取消
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleConfirm}
            isDisabled={!formData.name.trim()}
          >
            建立資料集
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}