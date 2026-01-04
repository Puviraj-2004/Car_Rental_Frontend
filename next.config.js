/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@/*': ['./src/*'],
    }
  },

  images: {
    remotePatterns: [
      { 
        protocol: 'http', 
        hostname: 'localhost', 
        port: '4000', 
        pathname: '/uploads/**' 
      },
      { 
        protocol: 'http', 
        hostname: '127.0.0.1', 
        port: '4000', 
        pathname: '/uploads/**' 
      },
      { 
        protocol: 'https', 
        hostname: 'res.cloudinary.com', 
        pathname: '/**' 
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  }
};

module.exports = nextConfig;