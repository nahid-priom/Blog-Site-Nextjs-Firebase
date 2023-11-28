/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove the "output" configuration and use the new "exportPathMap"
  // output: "export",
  images: {
    unoptimized: true,
  },
  // Add the exportPathMap function
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      // Specify your export paths here
      '/': { page: '/' },
      // Add other paths as needed
    };
  },
};

module.exports = nextConfig;
