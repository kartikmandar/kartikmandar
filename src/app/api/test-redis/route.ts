import { NextResponse } from 'next/server'
import { testRedisConnection } from '@/lib/redis'

export async function GET() {
  try {
    // Test the Redis connection
    const isConnected = await testRedisConnection()
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Redis connection successful',
        env: {
          hasUrl: !!process.env.REDIS_KV_REST_API_URL,
          hasToken: !!process.env.REDIS_KV_REST_API_TOKEN,
          url: process.env.REDIS_KV_REST_API_URL ? 'Set' : 'Not set',
          token: process.env.REDIS_KV_REST_API_TOKEN ? 'Set' : 'Not set'
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Redis connection failed' 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Redis connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}