/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      '@/*': ['./src/*'],
    }
  },

  // Allow Next Image to load from our backend uploads (localhost) and Cloudinary
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    remotePatterns: [
      // Local uploads served by backend in development
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
      // Cloudinary (common CDN hostname)
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ]
  }
};

module.exports = nextConfig;