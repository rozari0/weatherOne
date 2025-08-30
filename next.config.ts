import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/weather",
        permanent: false, // switch to true (308) when you're ready for SEO permanence
      },
    ];
  },
};

export default nextConfig;
