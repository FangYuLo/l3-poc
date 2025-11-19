import { NextResponse } from 'next/server'
import { mockEmissionFactors } from '@/data/mockFormulaData'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockEmissionFactors
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emission factors' },
      { status: 500 }
    )
  }
}
