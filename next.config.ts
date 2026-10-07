import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@blocknote/core",
      "@blocknote/react",
      "@blocknote/shadcn",
      "@liveblocks/react",
      "@liveblocks/react-ui",
      "framer-motion",
      "sonner",
    ],
  },
  serverExternalPackages: ["firebase-admin", "@liveblocks/node"],
};

export default nextConfig;
