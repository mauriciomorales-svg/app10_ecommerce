<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;

class CommerceStore extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'primary_host',
        'host_aliases',
        'settings',
        'active',
        'is_template',
    ];

    protected $casts = [
        'settings' => 'array',
        'active' => 'boolean',
        'is_template' => 'boolean',
    ];

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'commerce_store_id', 'id');
    }

    /**
     * Resuelve la tienda según el host HTTP (minúsculas) o cae al slug por defecto.
     */
    public static function resolveForHost(string $host): self
    {
        $host = strtolower(trim($host));

        $base = static::query()->where('active', true);

        $byPrimary = (clone $base)->whereRaw('LOWER(primary_host) = ?', [$host])->first();
        if ($byPrimary) {
            return $byPrimary;
        }

        foreach ((clone $base)->whereNotNull('host_aliases')->get() as $store) {
            $aliases = array_filter(array_map('trim', explode(',', strtolower((string) $store->host_aliases))));
            if ($aliases !== [] && in_array($host, $aliases, true)) {
                return $store;
            }
        }

        $slug = (string) config('commerce.default_store_slug', 'default');

        return static::query()->where('slug', $slug)->where('active', true)->firstOrFail();
    }

    public static function resolveFromRequest(Request $request): self
    {
        $slug = strtolower(trim((string) $request->header('X-Commerce-Store-Slug', '')));
        if ($slug !== '') {
            $bySlug = static::query()->where('slug', $slug)->where('active', true)->first();
            if ($bySlug) {
                return $bySlug;
            }
        }

        return self::resolveForHost($request->getHost());
    }
}
