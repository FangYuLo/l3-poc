'use client'

import { Box, Skeleton, SkeletonText, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'

export function TableSkeleton() {
  return (
    <Box>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th><Skeleton height="16px" /></Th>
            <Th><Skeleton height="16px" /></Th>
            <Th><Skeleton height="16px" /></Th>
            <Th><Skeleton height="16px" /></Th>
            <Th><Skeleton height="16px" /></Th>
          </Tr>
        </Thead>
        <Tbody>
          {[...Array(10)].map((_, i) => (
            <Tr key={i}>
              <Td><Skeleton height="20px" /></Td>
              <Td><Skeleton height="20px" width="60px" /></Td>
              <Td><Skeleton height="20px" width="80px" /></Td>
              <Td><Skeleton height="20px" width="50px" /></Td>
              <Td><Skeleton height="20px" width="70px" /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export function TreeSkeleton() {
  return (
    <VStack spacing={2} align="stretch" p={4}>
      {[...Array(8)].map((_, i) => (
        <HStack key={i} spacing={3}>
          <Skeleton width="16px" height="16px" />
          <Skeleton height="20px" flex="1" />
          <Skeleton width="24px" height="16px" borderRadius="full" />
        </HStack>
      ))}
    </VStack>
  )
}

export function DetailsSkeleton() {
  return (
    <VStack spacing={6} p={6} align="stretch">
      <VStack spacing={3} align="stretch">
        <Skeleton height="32px" />
        <HStack>
          <Skeleton height="20px" width="80px" borderRadius="full" />
          <Skeleton height="20px" width="60px" borderRadius="full" />
        </HStack>
      </VStack>
      
      {[...Array(3)].map((_, i) => (
        <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Skeleton height="20px" width="120px" mb={3} />
          <VStack spacing={2} align="stretch">
            {[...Array(4)].map((_, j) => (
              <HStack key={j} justify="space-between">
                <Skeleton height="16px" width="100px" />
                <Skeleton height="16px" width="80px" />
              </HStack>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  )
}

export function SearchResultsSkeleton() {
  return (
    <VStack spacing={3} align="stretch">
      {[...Array(20)].map((_, i) => (
        <HStack key={i} p={3} border="1px solid" borderColor="gray.200" borderRadius="md" spacing={4}>
          <VStack align="start" flex="1" spacing={1}>
            <Skeleton height="20px" width="200px" />
            <Skeleton height="16px" width="150px" />
          </VStack>
          <VStack align="end" spacing={1}>
            <Skeleton height="20px" width="80px" />
            <Skeleton height="16px" width="60px" />
          </VStack>
          <Skeleton width="24px" height="24px" />
        </HStack>
      ))}
    </VStack>
  )
}

export default function LoadingSkeleton() {
  return (
    <Box p={6}>
      <VStack spacing={4} align="stretch">
        <Skeleton height="32px" />
        <SkeletonText noOfLines={4} spacing="4" />
      </VStack>
    </Box>
  )
}