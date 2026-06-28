<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StoreSearchDemandaResource\Pages;
use App\Filament\Resources\ProductoResource;
use App\Models\StoreSearchLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class StoreSearchDemandaResource extends Resource
{
    protected static ?string $model = StoreSearchLog::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-magnifying-glass';

    protected static string | UnitEnum | null $navigationGroup = 'Tienda';

    protected static ?string $navigationLabel = 'Búsquedas web';

    protected static ?string $modelLabel = 'Búsqueda web';

    protected static ?string $pluralModelLabel = 'Búsquedas web';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'tienda-busquedas';

    public static function canAccess(): bool
    {
        return DbSchema::hasTable('store_search_logs');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                TextColumn::make('query')
                    ->label('Búsqueda')
                    ->searchable()
                    ->limit(48)
                    ->tooltip(fn (StoreSearchLog $record): string => $record->query),
                TextColumn::make('scope')
                    ->label('Sección')
                    ->badge()
                    ->formatStateUsing(fn (StoreSearchLog $record): string => $record->scopeLabel())
                    ->color(fn (StoreSearchLog $record): string => match ($record->scope) {
                        'regalos' => 'danger',
                        'salada' => 'warning',
                        'helados' => 'info',
                        'packs' => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('outcome')
                    ->label('Resultado')
                    ->badge()
                    ->formatStateUsing(fn (StoreSearchLog $record): string => $record->outcomeLabel())
                    ->color(fn (StoreSearchLog $record): string => $record->outcomeColor()),
                TextColumn::make('total_results')
                    ->label('Productos')
                    ->alignCenter()
                    ->sortable(),
                TextColumn::make('page')
                    ->label('Página')
                    ->toggleable()
                    ->placeholder('—')
                    ->limit(24),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('sin_resultado')
                    ->label('Sin resultados')
                    ->query(fn (Builder $query): Builder => $query->where('outcome', 'not_found')),
                SelectFilter::make('scope')
                    ->label('Sección')
                    ->options([
                        'home' => 'Inicio',
                        'regalos' => 'Regalos',
                        'salada' => 'Comida',
                        'helados' => 'Helados',
                        'packs' => 'Packs',
                    ]),
                SelectFilter::make('outcome')
                    ->label('Resultado')
                    ->options([
                        'found' => 'Con resultados',
                        'not_found' => 'Sin resultados',
                    ]),
                Filter::make('recientes')
                    ->label('Últimos 7 días')
                    ->query(fn (Builder $query): Builder => $query->where('created_at', '>=', now()->subDays(7))),
            ])
            ->recordActions([
                Action::make('buscar_catalogo')
                    ->label('Buscar en catálogo')
                    ->icon('heroicon-o-magnifying-glass')
                    ->url(fn (StoreSearchLog $record): string => ProductoResource::getUrl('index').'?tableSearch='.urlencode($record->query)),
                Action::make('crear_producto')
                    ->label('Nuevo producto')
                    ->icon('heroicon-o-plus')
                    ->color('success')
                    ->visible(fn (StoreSearchLog $record): bool => $record->outcome === 'not_found')
                    ->url(fn (StoreSearchLog $record): string => ProductoResource::getUrl('create').'?nombre='.urlencode($record->query)),
            ])
            ->emptyStateHeading('Aún no hay búsquedas registradas')
            ->emptyStateDescription('Las búsquedas en dondemorales.cl (inicio, regalos, comida, helados, packs) aparecerán aquí.')
            ->striped()
            ->paginationPageOptions([25, 50, 100])
            ->defaultPaginationPageOption(50);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStoreSearchDemanda::route('/'),
        ];
    }
}
