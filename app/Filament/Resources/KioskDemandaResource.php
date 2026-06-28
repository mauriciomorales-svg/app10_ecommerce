<?php

namespace App\Filament\Resources;

use App\Filament\Resources\KioskDemandaResource\Pages;
use App\Filament\Resources\ProductoResource;
use App\Models\KioskSearchLog;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class KioskDemandaResource extends Resource
{
    protected static ?string $model = KioskSearchLog::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-microphone';

    protected static string | UnitEnum | null $navigationGroup = 'Tienda';

    protected static ?string $navigationLabel = 'Demanda kiosco';

    protected static ?string $modelLabel = 'Consulta kiosco';

    protected static ?string $pluralModelLabel = 'Consultas kiosco';

    protected static ?int $navigationSort = 1;

    protected static ?string $slug = 'kiosco-demanda';

    public static function canAccess(): bool
    {
        return DbSchema::hasTable('kiosk_search_logs');
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
                    ->label('Pregunta')
                    ->searchable()
                    ->limit(50)
                    ->tooltip(fn (KioskSearchLog $record): string => $record->query),
                TextColumn::make('outcome')
                    ->label('Resultado')
                    ->badge()
                    ->formatStateUsing(fn (KioskSearchLog $record): string => $record->outcomeLabel())
                    ->color(fn (KioskSearchLog $record): string => $record->outcomeColor()),
                TextColumn::make('input_method')
                    ->label('Entrada')
                    ->toggleable()
                    ->placeholder('—'),
                TextColumn::make('results_count')
                    ->label('Mostrados')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('device_id')
                    ->label('Dispositivo')
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('from_cache')
                    ->label('Cache')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('demanda')
                    ->label('Tipo de demanda')
                    ->form([
                        \Filament\Forms\Components\Select::make('value')
                            ->label('Filtrar')
                            ->options([
                                'sin_resultado' => 'Sin resultado (no encontrado / otro)',
                                'sin_stock' => 'Sin stock',
                                'con_resultado' => 'Con resultado',
                            ]),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return match ($data['value'] ?? null) {
                            'sin_resultado' => $query->whereIn('outcome', ['not_found', 'other']),
                            'sin_stock' => $query->where('outcome', 'out_of_stock'),
                            'con_resultado' => $query->whereIn('outcome', ['found', 'product_detail', 'partial']),
                            default => $query,
                        };
                    }),
                SelectFilter::make('outcome')
                    ->label('Resultado exacto')
                    ->options([
                        'found' => 'Encontrado',
                        'not_found' => 'No encontrado',
                        'partial' => 'Similar',
                        'out_of_stock' => 'Sin stock',
                        'product_detail' => 'Detalle producto',
                        'menu' => 'Menú',
                        'other' => 'Otro',
                    ]),
                SelectFilter::make('device_id')
                    ->label('Dispositivo')
                    ->options(fn (): array => KioskSearchLog::query()
                        ->distinct()
                        ->orderBy('device_id')
                        ->pluck('device_id', 'device_id')
                        ->all()),
                Filter::make('recientes')
                    ->label('Últimos 7 días')
                    ->query(fn (Builder $query): Builder => $query->where('created_at', '>=', now()->subDays(7))),
            ])
            ->recordActions([
                Action::make('buscar_catalogo')
                    ->label('Buscar en catálogo')
                    ->icon('heroicon-o-magnifying-glass')
                    ->url(fn (KioskSearchLog $record): string => ProductoResource::getUrl('index') . '?tableSearch=' . urlencode($record->query)),
                Action::make('crear_producto')
                    ->label('Nuevo producto')
                    ->icon('heroicon-o-plus')
                    ->color('success')
                    ->visible(fn (KioskSearchLog $record): bool => in_array($record->outcome, ['not_found', 'other'], true))
                    ->url(fn (KioskSearchLog $record): string => ProductoResource::getUrl('create') . '?nombre=' . urlencode($record->query)),
            ])
            ->emptyStateHeading('Aún no hay consultas registradas')
            ->emptyStateDescription('Las búsquedas del kiosco en tienda (/inventario/kiosk/) aparecerán aquí.')
            ->striped()
            ->paginationPageOptions([25, 50, 100])
            ->defaultPaginationPageOption(50);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListKioskDemanda::route('/'),
        ];
    }
}
