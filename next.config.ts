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
  serverExternalPackages: ['@opentelemetry/exporter-jaeger'],
   webpack: (config, { isServer }) => {
    if (isServer) {
        config.externals.push({
            encoding: 'encoding',
        });
    }
    return config;
  }
};

export default nextConfig;
