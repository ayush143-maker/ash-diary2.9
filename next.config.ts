import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Phase 2 (Capacitor): static export served from the WebView origin —
   * there is no Node server on-device, so every route must be pre-rendered
   * and every image left unoptimized (Next's image optimizer needs a
   * server). The app keeps no server-only state, so no other changes were
   * required beyond this and the /journal/[id] -> /journal/write refactor.
   */
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
