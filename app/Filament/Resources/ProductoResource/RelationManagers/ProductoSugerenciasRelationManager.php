<?php

namespace App\Filament\Resources\ProductoResource\RelationManagers;

use App\Models\Producto;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema as DbSchema;

class ProductoSugerenciasRelationManager extends RelationManager
{
    protected static string $relationship = 'sugerenciasOrigen';

    protected static ?string $title = 'Sugerencias en el armador';

    protected static ?string $recordTitleAttribute = 'mensaje';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return DbSchema::hasTable('producto_sugerencias');
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('producto_sugerido_id')
                ->label('Producto sugerido')
                ->searchable()
                ->getSearchResultsUsing(function (string $search): array {
                    return Producto::query()
                        ->withoutGlobalScopes(['commerce_store'])
                        ->where('activo', true)
                        ->where('stock_actual', '>', 0)
                        ->where(function ($q) use ($search) {
                            $q->where('nombre', 'ilike', "%{$search}%")
                                ->orWhere('codigobarra', 'ilike', "%{$search}%");
                        })
                        ->orderBy('nombre')
                        ->limit(40)
                        ->pluck('nombre', 'idproducto')
                        ->all();
                })
                ->getOptionLabelUsing(fn ($value): ?string => Producto::query()
                    ->withoutGlobalScopes(['commerce_store'])
                    ->where('idproducto', $value)
                    ->value('nombre'))
                ->required(),
            TextInput::make('mensaje')
                ->label('Mensaje')
                ->maxLength(120)
                ->placeholder('¿Algo más para tu pedido?'),
            TextInput::make('tipo')
                ->label('Tipo')
                ->maxLength(32)
                ->default('cross_sell'),
            TextInput::make('orden')
                ->label('Orden')
                ->numeric()
                ->default(0),
            Toggle::make('activo')->label('Activo')->default(true),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('productoSugerido.nombre')
                    ->label('Producto')
                    ->limit(40),
                TextColumn::make('mensaje')->limit(40),
                TextColumn::make('orden')->sortable(),
                IconColumn::make('activo')->boolean(),
            ])
            ->defaultSort('orden')
            ->headerActions([
                CreateAction::make()->label('Agregar sugerencia'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->emptyStateHeading('Sin sugerencias')
            ->emptyStateDescription('Productos opcionales que aparecen al final del armador («¿Algo más?»).');
    }
}
