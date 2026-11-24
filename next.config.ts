import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // Photos from Unsplash (free licence). Only their photo paths are allowed.
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" },
      // YouTube video thumbnails, for the Watch pages.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  // Addresses with no page of their own. Temporary (307), in case any become pages later.
  // /prayer and /contact open the home page with that drawer open.
  async redirects() {
    return [
      { source: "/prayer", destination: "/#pray", permanent: false },
      { source: "/new", destination: "/about", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      { source: "/connect", destination: "/#contact", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
