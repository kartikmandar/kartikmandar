import { NextResponse } from 'next/server'

const FOCUSMATE_API_BASE = 'https://api.focusmate.com/v1'

export async function GET() {
  const apiKey = process.env.FOCUSMATE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Focusmate API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${FOCUSMATE_API_BASE}/me`, {
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
    console.error('Failed to fetch Focusmate profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Focusmate profile' },
      { status: 500 }
    )
  }
}