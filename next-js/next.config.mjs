/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/fnvy29id/tgs/**",
      },
      {
        protocol: "https",
        hostname: "place-hold.it",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
