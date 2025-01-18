import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || '';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configure the base path for GitHub Pages
  basePath: isGithubActions ? `/${repo}` : '',
  assetPrefix: isGithubActions ? `/${repo}` : '/',
  // Remove headers configuration since it's not compatible with export
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  },
};

console.log("GA Measurement ID (Build):", process.env.GA_MEASUREMENT_ID);

export default nextConfig;
