<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ProductoResource;
use App\Models\Producto;
use App\Models\ValeDescuento;
use App\Models\Venta;
use App\Support\VentaEstado;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Schema as DbSchema;

class CommerceOverviewWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected ?string $heading = 'Resumen del catálogo';

    protected function getStats(): array
    {
        $productQuery = Producto::query()->withoutGlobalScopes(['commerce_store']);
        $productQuery->getModel()->setAppends([]);

        $total = (clone $productQuery)->count();
        $activos = (clone $productQuery)->where('activo', true)->count();
        $bajoStock = (clone $productQuery)
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->count();

        $ventasHoy = Venta::query()
            ->whereIn('estado', VentaEstado::paidValues())
            ->whereDate('fecha', today())
            ->sum('total');

        $ventasSemana = Venta::query()
            ->whereIn('estado', VentaEstado::paidValues())
            ->where('fecha', '>=', now()->startOfWeek())
            ->sum('total');

        $cupones = DbSchema::hasTable('vale_descuento')
            ? ValeDescuento::query()->where('activo', true)->count()
            : 0;

        return [
            Stat::make('Productos', number_format($total, 0, ',', '.'))
                ->description("{$activos} activos en catálogo")
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary')
                ->url(ProductoResource::getUrl('index')),
            Stat::make('Stock bajo', number_format($bajoStock, 0, ',', '.'))
                ->description('Requieren reposición')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($bajoStock > 0 ? 'warning' : 'success')
                ->url(ProductoResource::getUrl('index')),
            Stat::make('Ventas hoy', '$' . number_format((float) $ventasHoy, 0, ',', '.'))
                ->description('Semana: $' . number_format((float) $ventasSemana, 0, ',', '.'))
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),
            Stat::make('Cupones activos', (string) $cupones)
                ->description('Promociones vigentes')
                ->descriptionIcon('heroicon-m-ticket')
                ->color('info'),
        ];
    }
}
