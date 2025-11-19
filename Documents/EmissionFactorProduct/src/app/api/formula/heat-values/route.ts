import { NextResponse } from 'next/server'
import { mockHeatValues } from '@/data/mockFormulaData'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockHeatValues
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heat values' },
      { status: 500 }
    )
  }
}
