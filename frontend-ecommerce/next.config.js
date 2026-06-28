/** @type {import('next').NextConfig} */

// En producción (VPS JobShours 64.23.199.180):
//   API_UPSTREAM      = http://127.0.0.1:8002   (Laravel ecommerce)
//   FOTOS_UPSTREAM    = http://127.0.0.1:8003   (inventario-api, tiene las fotos)
// En desarrollo local se puede setear en .env.local; si no, usa los defaults de abajo.
const API_UPSTREAM   = process.env.API_UPSTREAM   || 'http://127.0.0.1:8002';
const FOTOS_UPSTREAM = process.env.FOTOS_UPSTREAM || 'http://127.0.0.1:8003';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    API_URL: 'https://www.dondemorales.cl/api',
    API_URL_SERVER: `${API_UPSTREAM}/api`,
  },
  async rewrites() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'bio.dondemorales.cl' }],
        destination: '/bio',
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'tienda.jobshours.com' }],
        destination: '/jobshours',
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'shop.jobshours.com' }],
        destination: '/jobshours',
      },
      {
        source: '/fotos_productos/:path*',
        destination: `${FOTOS_UPSTREAM}/fotos_productos/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_UPSTREAM}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
