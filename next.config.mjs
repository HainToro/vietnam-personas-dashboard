/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@duckdb/node-api", "@duckdb/node-bindings"],
  },
};

export default nextConfig;
