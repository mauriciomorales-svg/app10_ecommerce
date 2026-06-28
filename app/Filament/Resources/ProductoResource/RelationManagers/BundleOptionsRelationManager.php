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
use Illuminate\Support\Facades\Schema as DbSchema;

class BundleOptionsRelationManager extends RelationManager
{
    protected static string $relationship = 'bundleOptions';

    protected static ?string $title = 'Opciones y grupos';

    protected static ?string $recordTitleAttribute = 'group_name';

    public static function canViewForRecord(\Illuminate\Database\Eloquent\Model $ownerRecord, string $pageClass): bool
    {
        return DbSchema::hasTable('product_bundle_options');
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('group_name')
                ->label('Nombre del grupo')
                ->required()
                ->maxLength(100)
                ->placeholder('Ej: Elige tu bebida, Salsa, Tamaño'),
            Select::make('input_type')
                ->label('Tipo de selección')
                ->options([
                    'radio' => 'Una opción (radio)',
                    'checkbox' => 'Varias opciones (checkbox)',
                ])
                ->required()
                ->default('radio'),
            Select::make('child_product_id')
                ->label('Producto opción')
                ->searchable()
                ->getSearchResultsUsing(function (string $search): array {
                    return Producto::query()
                        ->withoutGlobalScopes(['commerce_store'])
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
            Toggle::make('is_required')
                ->label('Obligatorio')
                ->default(true),
            TextInput::make('price_modifier')
                ->label('Recargo ($)')
                ->numeric()
                ->default(0)
                ->minValue(0),
            TextInput::make('quantity_deduction')
                ->label('Unidades de stock a descontar')
                ->numeric()
                ->default(1)
                ->minValue(1)
                ->helperText('Del producto opción al vender.'),
            TextInput::make('sort_order')
                ->label('Orden')
                ->numeric()
                ->default(0),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('group_name')->label('Grupo')->searchable()->sortable(),
                TextColumn::make('input_type')
                    ->label('Tipo')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'checkbox' ? 'Varias' : 'Una'),
                TextColumn::make('childProduct.nombre')
                    ->label('Producto opción')
                    ->limit(35)
                    ->placeholder('—'),
                TextColumn::make('price_modifier')
                    ->label('Recargo')
                    ->money('CLP', locale: 'es'),
                IconColumn::make('is_required')->label('Oblig.')->boolean(),
                TextColumn::make('sort_order')->label('Orden')->sortable(),
            ])
            ->defaultSort('sort_order')
            ->headerActions([
                CreateAction::make()->label('Agregar opción'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->emptyStateHeading('Sin opciones configuradas')
            ->emptyStateDescription('Agrega grupos (bebida, salsa, topping…) vinculados a productos hijo del inventario.');
    }
}
