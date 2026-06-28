<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ProductoResource;
use App\Models\Producto;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockProductsWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'lg' => 1,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->heading('Stock bajo')
            ->description('Productos en o bajo el mínimo')
            ->query(
                fn () => tap(
                    Producto::query()
                        ->withoutGlobalScopes(['commerce_store'])
                        ->whereColumn('stock_actual', '<=', 'stock_minimo')
                        ->orderBy('stock_actual')
                        ->limit(8),
                    fn ($q) => $q->getModel()->setAppends([])
                )
            )
            ->columns([
                TextColumn::make('nombre')->limit(28),
                TextColumn::make('stock_actual')->label('Stock')->alignCenter(),
                TextColumn::make('stock_minimo')->label('Mín.')->alignCenter(),
            ])
            ->recordActions([
                EditAction::make()
                    ->url(fn (Producto $record): string => ProductoResource::getUrl('edit', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
