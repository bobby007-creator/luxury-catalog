/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.OFFLINE_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.OFFLINE_BUILD === 'true', // Required for next export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
    ],
  },
};

export default nextConfig;
