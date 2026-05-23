/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/contracts", "@repo/db", "@repo/ui"],
}

export default nextConfig
