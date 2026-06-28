import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isJobshoursHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.includes('tienda.jobshours') ||
    h.includes('shop.jobshours') ||
    h.includes('tienda.jobshours.local')
  );
}

/** Rutas públicas en tienda.jobshours.com → app/jobshours/* */
const JH_PUBLIC_TO_APP: Record<string, string> = {
  '/': '/jobshours',
  '/comida': '/jobshours/comida',
  '/comida/': '/jobshours/comida',
  '/minimarket': '/jobshours/minimarket',
  '/minimarket/': '/jobshours/minimarket',
  '/catalogo': '/jobshours/catalogo',
  '/catalogo/': '/jobshours/catalogo',
  '/entrega-pack-express': '/jobshours/entrega-pack-express',
  '/entrega-pack-express/': '/jobshours/entrega-pack-express',
  '/visitas': '/jobshours/visitas',
  '/visitas/': '/jobshours/visitas',
  '/solar': '/jobshours/solar',
  '/solar/': '/jobshours/solar',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  if (host.includes('bio.dondemorales.cl') && path === '/') {
    return NextResponse.rewrite(new URL('/bio', request.url));
  }

  if (host.includes('legal.dondemorales.cl') && path === '/') {
    return NextResponse.rewrite(new URL('/legal', request.url));
  }

  if (isJobshoursHost(host)) {
    if (path === '/jobshours' || path === '/jobshours/') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 308);
    }

    const rewriteTarget = JH_PUBLIC_TO_APP[path];
    if (rewriteTarget) {
      return NextResponse.rewrite(new URL(rewriteTarget, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/comida',
    '/comida/',
    '/minimarket',
    '/minimarket/',
    '/catalogo',
    '/catalogo/',
    '/entrega-pack-express',
    '/entrega-pack-express/',
    '/visitas',
    '/visitas/',
    '/solar',
    '/solar/',
    '/jobshours',
    '/jobshours/',
  ],
};
