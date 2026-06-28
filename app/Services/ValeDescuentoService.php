<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ValeDescuentoService
{
    /**
     * @return array{valid: bool, codigo?: string, discount?: int, label?: string, message?: string, tipo?: string, valor?: float}
     */
    public static function validate(
        string $code,
        int $subtotalProductos,
        ?string $email = null,
        ?string $telefono = null
    ): array {
        $code = strtoupper(trim($code));
        if ($code === '' || ! Schema::hasTable('vale_descuento')) {
            return ['valid' => false, 'message' => 'Código inválido'];
        }

        $vale = DB::table('vale_descuento')
            ->whereRaw('UPPER(codigo) = ?', [$code])
            ->first();

        if (! $vale || ! ($vale->activo ?? false)) {
            return ['valid' => false, 'message' => 'Cupón no válido o inactivo'];
        }

        $today = now()->toDateString();
        if ($vale->fecha_inicio && $today < $vale->fecha_inicio) {
            return ['valid' => false, 'message' => 'Este cupón aún no está vigente'];
        }
        if ($vale->fecha_fin && $today > $vale->fecha_fin) {
            return ['valid' => false, 'message' => 'Este cupón expiró'];
        }

        if (! self::withinSchedule($vale)) {
            return ['valid' => false, 'message' => 'Este cupón no está disponible en este horario'];
        }

        if (! self::withinWeekdays($vale)) {
            return ['valid' => false, 'message' => 'Este cupón solo aplica de lunes a jueves'];
        }

        $max = (int) ($vale->usos_maximos ?? 0);
        $usos = (int) ($vale->usos_actuales ?? 0);
        if ($max > 0 && $usos >= $max) {
            return ['valid' => false, 'message' => 'Este cupón ya no tiene usos disponibles'];
        }

        if ($subtotalProductos < 1) {
            return ['valid' => false, 'message' => 'Agrega productos al carrito primero'];
        }

        $min = (int) (self::column($vale, 'monto_minimo') ?? 0);
        if ($min > 0 && $subtotalProductos < $min) {
            return [
                'valid' => false,
                'message' => 'Mínimo $'.number_format($min, 0, ',', '.').' en productos para este cupón',
            ];
        }

        $emailNorm = self::normalizeEmail($email);
        if (self::truthy(self::column($vale, 'solo_primera_compra')) && $emailNorm !== '') {
            if (self::customerHasPaidOrder($emailNorm, $telefono)) {
                return ['valid' => false, 'message' => 'Este cupón es solo para tu primera compra web'];
            }
            if (self::emailUsedCoupon($code, $emailNorm)) {
                return ['valid' => false, 'message' => 'Ya usaste este cupón con este email'];
            }
        } elseif ($emailNorm !== '' && self::emailUsedCoupon($code, $emailNorm)) {
            return ['valid' => false, 'message' => 'Ya usaste este cupón con este email'];
        }

        $discount = self::computeDiscount($vale, $subtotalProductos);
        if ($discount < 1) {
            return ['valid' => false, 'message' => 'El cupón no aplica a este pedido'];
        }

        $label = trim((string) ($vale->descripcion ?? ''));
        if ($label === '') {
            $label = 'Cupón '.$code;
        }

        return [
            'valid' => true,
            'codigo' => $code,
            'discount' => $discount,
            'label' => $label,
            'tipo' => (string) ($vale->tipo ?? 'PORCENTAJE'),
            'valor' => (float) $vale->valor,
        ];
    }

    public static function consumeFromObservaciones(
        string $observaciones,
        int $idventa = 0,
        ?string $email = null,
        ?string $telefono = null,
        int $discount = 0
    ): void {
        if (! preg_match('/Cupón:\s*([A-Z0-9_-]+)/i', $observaciones, $m)) {
            return;
        }

        $code = strtoupper($m[1]);
        if (! Schema::hasTable('vale_descuento')) {
            return;
        }

        $updated = DB::table('vale_descuento')
            ->whereRaw('UPPER(codigo) = ?', [$code])
            ->where(function ($q) {
                $q->whereNull('usos_maximos')
                    ->orWhere('usos_maximos', '<=', 0)
                    ->orWhereRaw('COALESCE(usos_actuales, 0) < usos_maximos');
            })
            ->update([
                'usos_actuales' => DB::raw('COALESCE(usos_actuales, 0) + 1'),
                'updated_at' => now(),
            ]);

        if ($updated < 1) {
            return;
        }

        if (Schema::hasTable('vale_descuento_uso')) {
            DB::table('vale_descuento_uso')->insert([
                'codigo' => $code,
                'idventa' => $idventa > 0 ? $idventa : null,
                'email' => self::normalizeEmail($email) ?: null,
                'telefono' => $telefono ? substr(trim($telefono), 0, 32) : null,
                'descuento_clp' => max(0, $discount),
                'created_at' => now(),
            ]);
        }
    }

    /**
     * @param  object  $vale
     */
    private static function computeDiscount(object $vale, int $subtotal): int
    {
        $tipo = strtoupper((string) ($vale->tipo ?? 'PORCENTAJE'));
        $valor = (float) $vale->valor;

        if ($tipo === 'PORCENTAJE' || $tipo === 'PERCENT') {
            return (int) min($subtotal, round($subtotal * $valor / 100));
        }

        return (int) min($subtotal, round($valor));
    }

    private static function withinSchedule(object $vale): bool
    {
        $start = self::column($vale, 'hora_inicio');
        $end = self::column($vale, 'hora_fin');
        if ($start === null && $end === null) {
            return true;
        }

        $hour = (int) now()->format('G');
        $start = $start !== null ? (int) $start : 0;
        $end = $end !== null ? (int) $end : 23;

        if ($start <= $end) {
            return $hour >= $start && $hour < $end;
        }

        return $hour >= $start || $hour < $end;
    }

    private static function withinWeekdays(object $vale): bool
    {
        $raw = trim((string) (self::column($vale, 'dias_semana') ?? ''));
        if ($raw === '') {
            return true;
        }

        $allowed = array_filter(array_map('intval', preg_split('/\s*,\s*/', $raw)));
        if ($allowed === []) {
            return true;
        }

        $today = (int) now()->format('N');

        return in_array($today, $allowed, true);
    }

    private static function customerHasPaidOrder(string $email, ?string $telefono): bool
    {
        if (! Schema::hasTable('venta')) {
            return false;
        }

        $q = DB::table('venta')->whereRaw('LOWER(cliente_email) = ?', [$email])
            ->whereRaw("LOWER(COALESCE(estado, '')) = 'pagado'");

        if ($telefono && trim($telefono) !== '') {
            $tel = preg_replace('/\D+/', '', $telefono) ?: '';
            if (strlen($tel) >= 8) {
                $suffix = substr($tel, -8);

                return $q->exists() || DB::table('venta')
                    ->where('cliente_telefono', 'like', '%'.$suffix.'%')
                    ->whereRaw("LOWER(COALESCE(estado, '')) = 'pagado'")
                    ->exists();
            }
        }

        return $q->exists();
    }

    private static function emailUsedCoupon(string $code, string $email): bool
    {
        if (! Schema::hasTable('vale_descuento_uso')) {
            return false;
        }

        return DB::table('vale_descuento_uso')
            ->whereRaw('UPPER(codigo) = ?', [strtoupper($code)])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->exists();
    }

    private static function normalizeEmail(?string $email): string
    {
        return strtolower(trim((string) $email));
    }

    private static function truthy(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    private static function column(object $row, string $key): mixed
    {
        return property_exists($row, $key) ? $row->{$key} : null;
    }
}
