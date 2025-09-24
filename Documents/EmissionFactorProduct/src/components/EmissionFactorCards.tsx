'use client'

import {
  Box,
  VStack,
  Text,
} from '@chakra-ui/react'
import { formatNumber } from '@/lib/utils'

interface EmissionFactorCardsProps {
  co2_factor: number
  co2_unit: string
  ch4_factor?: number
  ch4_unit?: string
  n2o_factor?: number
  n2o_unit?: string
}

interface FactorCardProps {
  type: 'CO₂' | 'CH₄' | 'N₂O'
  factor: number
  unit: string
  bgColor: string
}

function FactorCard({ type, factor, unit, bgColor }: FactorCardProps) {
  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={4}
      flex="1"
      minH="120px"
    >
      {/* Label Container */}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        p="8px"
        gap="8px"
        w="288px"
        h="48px"
        bg="#EBF2F9"
        borderRadius="8px"
        flex="none"
        alignSelf="stretch"
        mb={3}
      >
        <Text 
          w="272px"
          h="32px"
          fontFamily="PingFang TC"
          fontStyle="normal"
          fontWeight="600"
          fontSize="24px"
          lineHeight="133%"
          display="flex"
          alignItems="center"
          color="#3A81C5"
          flex="none"
          flexGrow={1}
        >
          {type}
        </Text>
      </Box>
      
      {/* 排放係數 */}
      <VStack align="start" spacing={2}>
        <Box>
          <Text 
            fontSize="sm" 
            color="black" 
            fontWeight="medium"
            mb={1}
          >
            排放係數
          </Text>
          <Text 
            fontSize="lg" 
            fontWeight="normal" 
            color="black" 
            fontFamily="mono"
            lineHeight="1.2"
            wordBreak="break-all"
          >
            {formatNumber(factor, 10)}
          </Text>
        </Box>
        
        {/* 單位 */}
        <Box>
          <Text 
            fontSize="sm" 
            color="black" 
            fontWeight="medium"
            mb={1}
          >
            單位
          </Text>
          <Text 
            fontSize="sm" 
            color="black" 
            fontWeight="normal"
            lineHeight="1.4"
          >
            {unit}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default function EmissionFactorCards({
  co2_factor,
  co2_unit,
  ch4_factor,
  ch4_unit,
  n2o_factor,
  n2o_unit
}: EmissionFactorCardsProps) {
  return (
    <Box>
      <Text 
        fontSize="xl" 
        fontWeight="bold" 
        color="gray.800" 
        mb={6}
        letterSpacing="tight"
      >
        排放係數
      </Text>
      
      <VStack spacing={4} align="stretch">
        {/* CO₂ 卡片 */}
        <FactorCard
          type="CO₂"
          factor={co2_factor}
          unit={co2_unit}
          bgColor="#FFFFFF"
        />
        
        {/* CH₄ 卡片 */}
        {ch4_factor !== undefined && ch4_unit && (
          <FactorCard
            type="CH₄"
            factor={ch4_factor}
            unit={ch4_unit}
            bgColor="#FFFFFF"
          />
        )}
        
        {/* N₂O 卡片 */}
        {n2o_factor !== undefined && n2o_unit && (
          <FactorCard
            type="N₂O"
            factor={n2o_factor}
            unit={n2o_unit}
            bgColor="#FFFFFF"
          />
        )}
      </VStack>
    </Box>
  )
}