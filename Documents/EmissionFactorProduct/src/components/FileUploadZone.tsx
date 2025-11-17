'use client'

import {
  Box,
  Text,
  Icon,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
  List,
  ListItem,
} from '@chakra-ui/react'
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons'
import { useState } from 'react'

interface FileUploadZoneProps {
  files: File[]
  onChange: (files: File[]) => void
}

export default function FileUploadZone({ files, onChange }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer?.files || [])
    const validFiles = droppedFiles.filter(file => {
      // 驗證檔案類型
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]

      // 驗證檔案大小（50 MB）
      const maxSize = 50 * 1024 * 1024

      return validTypes.includes(file.type) && file.size <= maxSize
    })

    onChange([...files, ...validFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      onChange([...files, ...selectedFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <Box>
      <Text fontWeight="medium" fontSize="sm" mb={2}>
        上傳佐證資料
      </Text>

      <Box
        border="2px dashed"
        borderColor={isDragging ? 'blue.400' : 'gray.300'}
        borderRadius="md"
        p={6}
        textAlign="center"
        bg={isDragging ? 'blue.50' : 'white'}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        transition="all 0.2s"
      >
        <Icon as={AttachmentIcon} boxSize={8} color="gray.400" mb={2} />
        <Text fontSize="sm" color="gray.600" mb={1}>
          拖曳檔案至此或點擊上傳
        </Text>
        <Text fontSize="xs" color="gray.500" mb={3}>
          支援 PDF / Excel / 圖片 - 最大 50 MB
        </Text>

        <Input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          display="none"
          id="custom-factor-file-upload"
        />
        <Button
          as="label"
          htmlFor="custom-factor-file-upload"
          size="sm"
          colorScheme="blue"
          variant="outline"
          cursor="pointer"
        >
          選擇檔案
        </Button>
      </Box>

      <Text fontSize="xs" color="gray.500" mt={2}>
        支援檔案類型：pdf / xlsx / xls / jpeg / jpg / png - 檔案大小最多 50 MB
      </Text>

      {/* 已上傳檔案列表 */}
      {files.length > 0 && (
        <List spacing={2} mt={3}>
          {files.map((file, index) => (
            <ListItem key={index}>
              <HStack
                p={2}
                bg="gray.50"
                borderRadius="md"
                justify="space-between"
              >
                <HStack spacing={2}>
                  <Icon as={AttachmentIcon} color="gray.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{file.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </VStack>
                </HStack>
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleRemoveFile(index)}
                  aria-label="移除檔案"
                />
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
