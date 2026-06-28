<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\VentaResource;
use App\Models\Venta;
use App\Support\AdminAccess;
use App\Support\VentaEstado;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentSalesWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = 'full';

    public static function canView(): bool
    {
        return AdminAccess::canViewSales(auth()->user());
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('Últimas ventas')
            ->query(
                Venta::query()
                    ->whereIn('estado', VentaEstado::paidValues())
                    ->orderByDesc('fecha')
                    ->limit(10)
            )
            ->columns([
                TextColumn::make('numero_venta')->label('N°')->limit(12),
                TextColumn::make('fecha')->label('Fecha')->dateTime('d/m H:i'),
                TextColumn::make('cliente_nombre')->label('Cliente')->limit(20)->placeholder('—'),
                TextColumn::make('medio_pago')->label('Pago')->badge(),
                TextColumn::make('total')->label('Total')->money('CLP'),
            ])
            ->recordActions([
                ViewAction::make()
                    ->url(fn (Venta $record): string => VentaResource::getUrl('view', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
