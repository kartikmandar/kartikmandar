import { NextRequest, NextResponse } from 'next/server'

const FOCUSMATE_API_BASE = 'https://api.focusmate.com/v1'

export async function GET(request: NextRequest) {
  const apiKey = process.env.FOCUSMATE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Focusmate API key not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  
  // Default to last 30 days if no dates provided
  const end = searchParams.get('end') || new Date().toISOString()
  const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const endpoint = `${FOCUSMATE_API_BASE}/sessions?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Focusmate API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Focusmate API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Focusmate sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Focusmate sessions' },
      { status: 500 }
    )
  }
}