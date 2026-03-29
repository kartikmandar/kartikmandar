import { NextRequest, NextResponse } from 'next/server'
import { saveGoals, loadGoals } from '@/lib/redis'
import type { Goal } from '@/hooks/useAccountabilityStore'

// GET /api/goals - Load all goals
export async function GET() {
  try {
    const goals = await loadGoals()
    return NextResponse.json({ success: true, goals })
  } catch (error) {
    console.error('Failed to load goals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load goals' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Save all goals
export async function POST(request: NextRequest) {
  try {
    const { goals }: { goals: Goal[] } = await request.json()
    await saveGoals(goals)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save goals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save goals' },
      { status: 500 }
    )
  }
}