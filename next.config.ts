import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // SW desativado em dev para não atrapalhar o hot reload.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
