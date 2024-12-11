/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // JSON 파일을 정적 자산으로 처리
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'asset/resource'
    });
    return config;
  }
}

module.exports = nextConfig 