import { NextRequest, NextResponse } from 'next/server'

const BEEMINDER_API_BASE = 'https://www.beeminder.com/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const username = process.env.BEEMINDER_USERNAME
  const authToken = process.env.BEEMINDER_AUTH_TOKEN

  if (!username || !authToken) {
    return NextResponse.json(
      { error: 'Beeminder credentials not configured' },
      { status: 500 }
    )
  }

  const { slug } = await params

  if (!slug) {
    return NextResponse.json(
      { error: 'Goal slug is required' },
      { status: 400 }
    )
  }

  try {
    const endpoint = `${BEEMINDER_API_BASE}/users/${username}/goals/${encodeURIComponent(slug)}.json?auth_token=${encodeURIComponent(authToken)}&datapoints=true`
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Beeminder API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Beeminder API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Beeminder goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Beeminder goal' },
      { status: 500 }
    )
  }
}