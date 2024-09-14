import fs from "fs";
import { config } from "dotenv";

if (!fs.existsSync("./.env")) {
  config({ path: "../../.env" });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {},
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  reactStrictMode: true,
};
export default nextConfig;
