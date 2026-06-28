<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

class ProductSearchService
{
    public function normalizeTerm(string $term): string
    {
        $t = mb_strtolower(trim($term));

        return strtr($t, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
            'Á' => 'a', 'É' => 'e', 'Í' => 'i', 'Ó' => 'o', 'Ú' => 'u', 'Ü' => 'u', 'Ñ' => 'n',
        ]);
    }

    /**
     * @return string[]
     */
    public function expandTerms(string $word): array
    {
        $w = $this->normalizeTerm($word);
        if ($w === '') {
            return [];
        }

        $terms = array_filter([$w, mb_strtolower(trim($word))]);
        $synonyms = (array) config('busqueda_tienda.sinonimos', []);

        foreach ([$w, mb_strtolower(trim($word))] as $key) {
            if ($key !== '' && isset($synonyms[$key]) && is_array($synonyms[$key])) {
                foreach ($synonyms[$key] as $syn) {
                    $terms[] = $this->normalizeTerm((string) $syn);
                }
            }
        }

        // Prefijo corto — tolera typos parciales (ej. «chorr» → chorrillana)
        if (mb_strlen($w) >= 4) {
            $terms[] = mb_substr($w, 0, 4);
        }

        return array_values(array_unique(array_filter($terms, fn ($t) => mb_strlen($t) >= 2)));
    }

    /**
     * @param  Builder<\App\Models\Producto>  $query
     */
    public function applyTextSearch(Builder $query, string $search): void
    {
        $searchClean = trim($search);
        if ($searchClean === '') {
            return;
        }

        $words = preg_split('/\s+/u', $searchClean) ?: [];
        $words = array_values(array_filter($words, fn ($w) => $w !== ''));

        if ($words === []) {
            return;
        }

        foreach ($words as $word) {
            $terms = $this->expandTerms($word);
            $query->where(function (Builder $q) use ($terms) {
                foreach ($terms as $term) {
                    $like = '%'.$term.'%';
                    $q->orWhere(function (Builder $sub) use ($like) {
                        $this->applyFieldMatch($sub, $like);
                    });
                }
            });
        }
    }

    /**
     * @param  Builder<\App\Models\Producto>  $sub
     */
    private function applyFieldMatch(Builder $sub, string $like): void
    {
        $sub->where('nombre', 'ilike', $like);
        if (Schema::hasColumn('productos', 'codigobarra')) {
            $sub->orWhere('codigobarra', 'ilike', $like);
        }
        if (Schema::hasColumn('productos', 'descripcion')) {
            $sub->orWhere('descripcion', 'ilike', $like);
        }
        $sub->orWhereHas('categorias', function (Builder $cat) use ($like) {
            $cat->where('nombre', 'ilike', $like);
        });
    }

    /**
     * @param  Builder<\App\Models\Producto>  $query
     */
    public function applyAlcance(Builder $query, ?string $alcance): void
    {
        $key = $alcance ? mb_strtolower(trim($alcance)) : '';
        if ($key === '' || $key === 'home' || $key === 'todos') {
            return;
        }

        $cfg = (array) config("busqueda_tienda.alcances.{$key}", []);
        if ($cfg === []) {
            return;
        }

        $query->where(function (Builder $outer) use ($cfg, $key) {
            $applied = false;

            $categorias = array_filter((array) ($cfg['categorias'] ?? []));
            if ($categorias !== []) {
                $outer->where(function (Builder $q) use ($categorias) {
                    $q->whereHas('categorias', function (Builder $sub) use ($categorias) {
                        $sub->whereIn('nombre', $categorias);
                    });
                });
                $applied = true;
            }

            $nombreContiene = array_filter((array) ($cfg['nombre_contiene'] ?? []));
            $esPackOnly = (bool) ($cfg['es_pack_only'] ?? false);

            if ($nombreContiene !== [] || $esPackOnly) {
                $method = $applied ? 'orWhere' : 'where';
                $outer->{$method}(function (Builder $q) use ($nombreContiene, $esPackOnly) {
                    foreach ($nombreContiene as $frag) {
                        $q->orWhere('nombre', 'ilike', '%'.$frag.'%');
                    }
                    if ($esPackOnly && Schema::hasColumn('productos', 'es_pack')) {
                        $q->orWhere('es_pack', true);
                    }
                });
                $applied = true;
            }

            $skuPrefijos = array_filter((array) ($cfg['sku_prefijos'] ?? []));
            if ($skuPrefijos !== []) {
                $method = $applied ? 'orWhere' : 'where';
                $outer->{$method}(function (Builder $q) use ($skuPrefijos, $key) {
                    foreach ($skuPrefijos as $pref) {
                        $q->orWhere('codigobarra', 'like', $pref.'%');
                    }
                    if ($key === 'helados') {
                        $q->where('codigobarra', '!=', 'TOPPI-PARENT-HELADO');
                    }
                });
            }
        });
    }

    /**
     * @param  Builder<\App\Models\Producto>  $query
     */
    public function orderByRelevance(Builder $query, string $search): void
    {
        $first = $this->normalizeTerm(explode(' ', trim($search))[0] ?? '');
        if ($first === '') {
            return;
        }
        $prefix = $first.'%';
        $contains = '%'.$first.'%';
        $query->orderByRaw(
            'CASE WHEN nombre ILIKE ? THEN 0 WHEN nombre ILIKE ? THEN 1 ELSE 2 END ASC',
            [$prefix, $contains]
        );
        if (Schema::hasColumn('productos', 'veces_vendido')) {
            $query->orderByDesc('veces_vendido');
        }
    }
}
