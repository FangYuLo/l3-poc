import { NextResponse } from 'next/server'
import { mockUnitConversions } from '@/data/mockFormulaData'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockUnitConversions
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unit conversions' },
      { status: 500 }
    )
  }
}
