import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    globalNotFound: true,
  },
  // Include the OpenAPI YAML spec in standalone (Docker / Vercel) builds
  // so /api/docs can read the file at runtime.
  outputFileTracingIncludes: {
    '/api/docs': ['./src/docs/**/*'],
  },
  transpilePackages: ['next-themes', 'react-icons', 'next-auth'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Update this to your Cloudinary/S3 bucket in production
      },
    ],
  },
  async headers() {
    return [
      {
        // Tell Vercel/Cloudflare CDN Edge Network to cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Default caching policy for API endpoints to reduce server strain
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      }
    ];
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
})