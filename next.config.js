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
  },
  reactStrictMode: true,
  redirects,
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
