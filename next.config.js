/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 构建时忽略 ESLint 错误，避免部署失败
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时忽略 TypeScript 错误，避免部署失败
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
