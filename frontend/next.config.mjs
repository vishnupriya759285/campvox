/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/institution', destination: '/issues?search=Institution' },
      { source: '/hostel', destination: '/issues?search=Hostel' },
      { source: '/quarters', destination: '/issues?search=Quarters' },
      { source: '/staff-quarters', destination: '/issues?search=Quarters' },
      { source: '/guest-house', destination: '/issues?search=Guest+House' },
    ];
  },
};

export default nextConfig;
