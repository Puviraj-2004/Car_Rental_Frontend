/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Turbopack root directory to avoid warnings
  experimental: {
    turbo: {
      resolveAlias: {
        '@/*': ['./src/*'],
      },
    },
  },
  // Enable React Compiler
  compiler: {
    reactCompiler: false, // Set to true if you want to use React Compiler
  },
};

module.exports = nextConfig;