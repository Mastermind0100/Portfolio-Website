import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },

  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node",
    "sharp",
  ],

  outputFileTracingIncludes: {
    "/api/chat": [
      "./node_modules/onnxruntime-node/**/*",
    ],
  },

  reactCompiler: true,
};

export default nextConfig;