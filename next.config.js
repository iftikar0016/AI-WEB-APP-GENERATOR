/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    MY_SECRET: process.env.MY_SECRET,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    AIPIPE_TOKEN: process.env.AIPIPE_TOKEN,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://aipipe.org/openrouter/v1',
  },
}

module.exports = nextConfig
