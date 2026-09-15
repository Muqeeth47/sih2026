import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.106',
    '192.168.0.*',
    '192.168.*.*',
    '10.0.*.*',
    '10.*.*.*',
    'localhost:3000',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
