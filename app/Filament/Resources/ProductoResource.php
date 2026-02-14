<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductoResource\Pages;
use App\Models\Producto;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProductoResource extends Resource
{
    protected static ?string $model = Producto::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationLabel = 'Productos';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información Básica')->schema([
                Forms\Components\TextInput::make('nombre')->required()->maxLength(100),
                Forms\Components\TextInput::make('codigobarra')->label('Código de Barras')->maxLength(50),
                Forms\Components\Textarea::make('descripcion')->label('Descripción')->rows(3),
            ]),
            Forms\Components\Section::make('Precios y Stock')->schema([
                Forms\Components\TextInput::make('precio')->label('Precio Venta')->numeric()->required()->prefix('$'),
                Forms\Components\TextInput::make('precio_costo')->label('Precio Costo')->numeric()->prefix('$'),
                Forms\Components\TextInput::make('stock_actual')->label('Stock Actual')->numeric()->default(0),
                Forms\Components\TextInput::make('cantidad')->label('Cantidad')->numeric()->default(0),
                Forms\Components\TextInput::make('stock_minimo')->label('Stock Mínimo')->numeric()->default(5),
                Forms\Components\TextInput::make('alerta_stock_minimo')->label('Alerta Stock Mínimo')->numeric()->default(5),
            ])->columns(2),
            Forms\Components\Section::make('Categoría y Unidad')->schema([
                Forms\Components\Select::make('idcategoria')
                    ->label('Categoría')
                    ->relationship('categoria', 'nombre')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('idunidadmedida')
                    ->label('Unidad de Medida')
                    ->relationship('unidadMedida', 'nombre')
                    ->searchable()
                    ->preload(),
            ]),
            Forms\Components\Section::make('Imagen y Estado')->schema([
                Forms\Components\FileUpload::make('imagen')
                    ->image()
                    ->directory('productos')
                    ->visibility('public'),
                Forms\Components\Toggle::make('activo')->label('Activo')->default(true),
            ]),
            Forms\Components\Section::make('Estadísticas')->schema([
                Forms\Components\TextInput::make('veces_vendido')->label('Veces Vendido')->numeric()->disabled(),
                Forms\Components\DateTimePicker::make('ultima_venta')->label('Última Venta')->disabled(),
            ])->columns(2)->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\ImageColumn::make('imagen')->circular()->defaultImageUrl(url('/default-product.png')),
            Tables\Columns\TextColumn::make('nombre')->searchable()->sortable()->limit(40),
            Tables\Columns\TextColumn::make('codigobarra')->label('Código')->searchable()->toggleable(),
            Tables\Columns\TextColumn::make('categoria.nombre')->label('Categoría')->sortable()->toggleable(),
            Tables\Columns\TextColumn::make('precio')->label('Precio')->money('CLP')->sortable()->alignment('right'),
            Tables\Columns\TextColumn::make('stock_actual')
                ->label('Stock')
                ->sortable()
                ->alignment('center')
                ->badge()
                ->color(fn (int $state): string => $state <= 5 ? 'danger' : ($state <= 20 ? 'warning' : 'success')),
            Tables\Columns\TextColumn::make('veces_vendido')
                ->label('Ventas')
                ->sortable()
                ->alignment('center')
                ->toggleable(),
            Tables\Columns\IconColumn::make('activo')->label('Activo')->boolean()->alignment('center'),
        ])->filters([
            Tables\Filters\SelectFilter::make('categoria')->relationship('categoria', 'nombre'),
            Tables\Filters\TernaryFilter::make('activo')->label('Activo'),
            Tables\Filters\Filter::make('bajo_stock')
                ->label('Stock bajo')
                ->query(fn ($query) => $query->whereColumn('stock_actual', '<=', 'stock_minimo')),
        ])->actions([
            Tables\Actions\EditAction::make()->button()->size('sm'),
            Tables\Actions\DeleteAction::make()->button()->size('sm'),
        ])->bulkActions([
            Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
                Tables\Actions\BulkAction::make('activar')
                    ->label('Activar seleccionados')
                    ->action(fn ($records) => $records->each->update(['activo' => true]))
                    ->requiresConfirmation(),
                Tables\Actions\BulkAction::make('desactivar')
                    ->label('Desactivar seleccionados')
                    ->action(fn ($records) => $records->each->update(['activo' => false]))
                    ->requiresConfirmation(),
            ]),
        ])->defaultSort('veces_vendido', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProductos::route('/'),
            'create' => Pages\CreateProducto::route('/create'),
            'edit' => Pages\EditProducto::route('/{record}/edit'),
        ];
    }
}
