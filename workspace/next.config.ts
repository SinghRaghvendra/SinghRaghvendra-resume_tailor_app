import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    // This is to fix a bug in html-to-docx
    if (isServer) {
        config.externals.push({
            encoding: 'encoding',
        });
    }
    return config;
  }
};

export default nextConfig;
