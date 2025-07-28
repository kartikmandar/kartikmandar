import { NextRequest, NextResponse } from 'next/server'
import { saveSessions, loadSessions } from '@/lib/redis'
import type { WorkSession } from '@/hooks/useAccountabilityStore'

// GET /api/sessions - Load all sessions
export async function GET() {
  try {
    const sessions = await loadSessions()
    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error('Failed to load sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Save all sessions
export async function POST(request: NextRequest) {
  try {
    const { sessions }: { sessions: WorkSession[] } = await request.json()
    await saveSessions(sessions)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save sessions' },
      { status: 500 }
    )
  }
}