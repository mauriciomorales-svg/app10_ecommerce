<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Repeater;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BooleanColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationLabel = 'Productos';

    protected static ?string $modelLabel = 'Producto';

    protected static ?string $pluralModelLabel = 'Productos';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información Básica')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nombre')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),

                        TextInput::make('sku')
                            ->label('SKU')
                            ->unique(ignoreRecord: true)
                            ->maxLength(50),

                        Select::make('category_id')
                            ->label('Categoría')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                TextInput::make('name')
                                    ->label('Nombre')
                                    ->required(),
                                TextInput::make('slug')
                                    ->label('Slug')
                                    ->required()
                                    ->unique(),
                            ]),
                    ]),

                Forms\Components\Section::make('Precios y Stock')
                    ->schema([
                        TextInput::make('price')
                            ->label('Precio')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->maxValue(999999.99),

                        TextInput::make('compare_price')
                            ->label('Precio Comparación')
                            ->numeric()
                            ->prefix('$')
                            ->helperText('Precio tachado para mostrar descuento'),

                        TextInput::make('stock')
                            ->label('Stock')
                            ->numeric()
                            ->default(0),

                        Toggle::make('track_stock')
                            ->label('Controlar Stock')
                            ->default(true),
                    ])->columns(2),

                Forms\Components\Section::make('Descripción')
                    ->schema([
                        Textarea::make('short_description')
                            ->label('Descripción Corta')
                            ->rows(2)
                            ->maxLength(500),

                        Textarea::make('description')
                            ->label('Descripción Completa')
                            ->rows(5),
                    ]),

                Forms\Components\Section::make('Atributos y Variantes')
                    ->schema([
                        KeyValue::make('attributes')
                            ->label('Atributos (Color, Talla, etc.)')
                            ->keyLabel('Atributo')
                            ->valueLabel('Valores (separados por coma)')
                            ->helperText('Ej: color → rojo, azul, verde'),

                        Repeater::make('images')
                            ->label('Imágenes')
                            ->simple(
                                TextInput::make('url')
                                    ->label('URL de la imagen')
                                    ->url()
                            )
                            ->collapsible(),
                    ]),

                Forms\Components\Section::make('Configuración')
                    ->schema([
                        Toggle::make('active')
                            ->label('Activo')
                            ->default(true),

                        Toggle::make('featured')
                            ->label('Destacado')
                            ->default(false),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('main_image')
                    ->label('Imagen')
                    ->circular()
                    ->defaultImageUrl(url('/images/product-placeholder.png')),

                TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category.name')
                    ->label('Categoría')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('price')
                    ->label('Precio')
                    ->money('CLP')
                    ->sortable(),

                TextColumn::make('stock')
                    ->label('Stock')
                    ->sortable()
                    ->color(fn (int $state): string => $state <= 5 ? 'danger' : ($state <= 20 ? 'warning' : 'success')),

                TextColumn::make('sku')
                    ->label('SKU')
                    ->searchable(),

                BooleanColumn::make('active')
                    ->label('Activo'),

                BooleanColumn::make('featured')
                    ->label('Destacado'),

                TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->relationship('category', 'name')
                    ->label('Categoría'),

                TernaryFilter::make('active')
                    ->label('Activo'),

                TernaryFilter::make('featured')
                    ->label('Destacado'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
