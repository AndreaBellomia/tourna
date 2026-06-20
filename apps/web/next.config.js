/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/contracts", "@repo/db", "@repo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
