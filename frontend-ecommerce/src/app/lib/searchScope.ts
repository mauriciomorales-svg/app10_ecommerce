export type SearchScope = 'home' | 'regalos' | 'salada' | 'helados' | 'packs';

export type SearchScopeMeta = {
  placeholder: string;
  targetPath: string;
  hash: string;
  alcance?: string;
  popular: string[];
  emptyHint: string;
};

export const SEARCH_SCOPE_META: Record<SearchScope, SearchScopeMeta> = {
  home: {
    placeholder: 'Buscar productos del local…',
    targetPath: '/',
    hash: 'catalogo',
    popular: ['café', 'leche', 'pan', 'snack', 'bebida'],
    emptyHint: 'Prueba con marca, categoría o nombre del producto.',
  },
  regalos: {
    placeholder: 'Pack mamá, desayuno, cumpleaños…',
    targetPath: '/regalos',
    hash: 'catalogo-regalos',
    alcance: 'regalos',
    popular: ['Pack Cumpleaños para Mamá', 'desayuno', 'amor', 'condolencias'],
    emptyHint: 'Busca por ocasión o nombre del pack regalo.',
  },
  salada: {
    placeholder: 'Chorrillana, completo, wok, bandeja…',
    targetPath: '/salada',
    hash: 'catalogo-salada',
    alcance: 'salada',
    popular: ['Chorrillana clásica', 'completo', 'wok', 'Combo Familiar'],
    emptyHint: 'Prueba «chorrillana», «completo» o tamaño familiar.',
  },
  helados: {
    placeholder: 'Soft, combo yogurt, artesanal…',
    targetPath: '/helados',
    hash: 'catalogo-helados',
    alcance: 'helados',
    popular: ['Helado soft', 'combo yogurt', 'artesanal', 'Helado Toppi\'s'],
    emptyHint: 'Busca por tipo de helado o combo listo.',
  },
  packs: {
    placeholder: 'Reservar pack regalo, combo, canasta…',
    targetPath: '/packs',
    hash: 'packs-busqueda',
    alcance: 'packs',
    popular: ['Pack Desayuno', 'cumpleaños mamá', 'Pack Amor', 'combo helado'],
    emptyHint: 'Busca packs listos para reservar online.',
  },
};
