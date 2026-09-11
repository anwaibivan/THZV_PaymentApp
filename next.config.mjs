/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/merchant',
        destination: '/merchant-dashboard.html?tab=overview',
      },
      {
        source: '/merchant/:section',
        destination: '/merchant-dashboard.html?tab=:section',
      },
      {
        source: '/dashboard',
        destination: '/merchant-dashboard.html?tab=overview',
      },
      {
        source: '/transactions',
        destination: '/merchant-dashboard.html?tab=transactions',
      },
      {
        source: '/payouts',
        destination: '/merchant-dashboard.html?tab=payouts',
      },
      {
        source: '/customers',
        destination: '/merchant-dashboard.html?tab=customers',
      },
      {
        source: '/developers',
        destination: '/merchant-dashboard.html?tab=developers',
      },
      {
        source: '/settings',
        destination: '/merchant-dashboard.html?tab=settings',
      },
      {
        source: '/verification',
        destination: '/merchant-dashboard.html?tab=verification',
      },
    ];
  },
};

export default nextConfig;
