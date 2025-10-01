// 測試係數查找功能
const { getEmissionFactorBySelection } = require('./src/data/factorProjectMapping.ts')

// 測試鋁合金係數查找
const testFactors = [
  '鋁合金-初級生產-2024 v2.1',
  '特殊玻璃-強化-2024 v1.2',
  '半導體-先進製程-2024 v1.8',
  '臺灣電力-工業用-2024 v2.2'
]

console.log('=== 測試係數查找功能 ===')
testFactors.forEach(factorName => {
  try {
    const factor = getEmissionFactorBySelection(factorName)
    if (factor) {
      console.log(`✓ ${factorName}: ${factor.value} ${factor.unit}`)
    } else {
      console.log(`✗ ${factorName}: 找不到對應係數`)
    }
  } catch (error) {
    console.log(`✗ ${factorName}: 錯誤 - ${error.message}`)
  }
})