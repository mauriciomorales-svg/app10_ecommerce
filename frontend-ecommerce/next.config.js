/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    API_URL: 'https://www.dondemorales.cl/api',
    API_URL_SERVER: 'http://192.168.3.4:8002/api',
  },
  async rewrites() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'bio.dondemorales.cl' }],
        destination: '/bio',
      },
      {
        source: '/fotos_productos/:path*',
        destination: 'http://192.168.3.4:8002/fotos_productos/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://192.168.3.4:8002/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
