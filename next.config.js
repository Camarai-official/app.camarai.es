/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.worldvectorlogo.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "asset.brandfetch.io" },
      { protocol: "https", hostname: "api.dicebear.com" }
    ]
  }
};

module.exports = nextConfig;
