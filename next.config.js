import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
    // Increase timeout for slow image loading
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add formats for better performance
    formats: ['image/webp'],
    // Increase timeout to handle slow images
    minimumCacheTTL: 60,
    // Configure sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactStrictMode: true,
  redirects,
  // Increase timeout for slow operations
  experimental: {
    // Increase timeout for API routes
    staticGeneration: {
      timeout: 30, // 30 seconds timeout
    },
  },
  // Allow cross-origin requests during development
  // The IP address should match your Mac's network IP that's shown in the server logs
  // You might need to update this IP if your network changes
  allowedDevOrigins: [
    "http://192.168.0.102:3000",  // Your current IP
    // Add any additional IP addresses or origins that might access your dev server
  ],
  // Add crossOrigin attribute to help with resource loading
  crossOrigin: 'anonymous',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
