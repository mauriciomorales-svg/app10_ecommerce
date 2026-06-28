<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductoResource\Pages;
use App\Filament\Resources\ProductoResource\RelationManagers;
use App\Models\CommerceStore;
use App\Models\Producto;
use App\Services\ProductBuilderProfileService;
use App\Services\ProductImageUrlService;
use App\Support\AdminAccess;
use BackedEnum;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class ProductoResource extends Resource
{
    protected static ?string $model = Producto::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-shopping-bag';

    protected static string | UnitEnum | null $navigationGroup = 'Catálogo';

    protected static ?string $navigationLabel = 'Productos';

    protected static ?string $modelLabel = 'Producto';

    protected static ?string $pluralModelLabel = 'Productos';

    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return AdminAccess::canManageCatalog(auth()->user());
    }

    public static function canCreate(): bool
    {
        return AdminAccess::canManageCatalog(auth()->user());
    }

    public static function canEdit($record): bool
    {
        return AdminAccess::canManageCatalog(auth()->user());
    }

    public static function canDelete($record): bool
    {
        return AdminAccess::canManageCatalog(auth()->user());
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getEloquentQuery()
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->withoutGlobalScopes(['commerce_store']);

        // Evita N+1 y timeouts en listado (~2000 productos): los appends del API web no van al admin.
        $query->getModel()->setAppends([]);

        return $query->with([
            'categoria:idcategoria,nombre',
            'categorias:idcategoria,nombre',
        ]);
    }

    public static function fotoPreviewUrl(?Producto $record): ?string
    {
        // Misma lógica que la tienda (archivo en /fotos_productos o /api/productos/{id}/imagen).
        return $record?->imagen_url;
    }

    /** URL absoluta https://www.dondemorales.cl/... igual que ve el navegador en la tienda. */
    public static function productImageUrl(?Producto $record): ?string
    {
        $path = static::fotoPreviewUrl($record);

        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url($path);
    }

    /** Vista previa admin — con parámetros anti-caché. */
    public static function productImagePreviewUrl(?Producto $record): ?string
    {
        $url = ProductImageUrlService::absoluteUrl(static::fotoPreviewUrl($record), cacheBust: true);

        if ($url === null) {
            return null;
        }

        $v = request()->query('v');
        if ($v !== null && $v !== '') {
            $url .= (str_contains($url, '?') ? '&' : '?') . 'v=' . rawurlencode((string) $v);
        }

        return $url;
    }

    /** Misma heurística que ProductImagePlaceholder.tsx en la tienda Next.js. */
    public static function inferPlaceholderVariant(Producto $record): string
    {
        $nombre = mb_strtolower($record->nombre ?? '');
        $cats = collect($record->categorias ?? [])
            ->pluck('nombre')
            ->filter()
            ->map(fn (string $n): string => mb_strtolower($n))
            ->join(' ');

        if (str_contains($nombre, 'helado') || (str_contains($cats, 'toppi') && str_contains($cats, 'helado'))) {
            return 'toppis';
        }

        if (
            str_contains($nombre, 'chorrillana') ||
            str_contains($nombre, 'completo') ||
            str_contains($nombre, 'churrasco') ||
            str_contains($cats, 'chorrillana') ||
            str_contains($cats, 'churrasco')
        ) {
            return 'salada';
        }

        if (
            $record->es_pack ||
            $record->has_bundle_options ||
            str_contains($nombre, 'pack') ||
            str_contains($nombre, 'canasta') ||
            str_contains($cats, 'regalo')
        ) {
            return ($record->has_customization || $record->has_bundle_options) ? 'regalos' : 'pack';
        }

        if (str_contains($nombre, 'regalo') || str_contains($nombre, 'canasta')) {
            return 'regalos';
        }

        return 'retail';
    }

    public static function placeholderLabel(string $variant): string
    {
        return match ($variant) {
            'toppis' => "Toppi's",
            'regalos' => 'Regalo',
            'salada' => 'Salada',
            'pack' => 'Pack',
            default => 'Producto',
        };
    }

    public static function productPlaceholderImageUrl(): string
    {
        return 'data:image/svg+xml,' . rawurlencode(
            '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">'
            . '<rect fill="#f1f5f9" width="52" height="52" rx="8"/>'
            . '<path fill="#94a3b8" d="M16 34l6-8 5 6 4-5 6 7H16z"/>'
            . '<circle fill="#94a3b8" cx="20" cy="18" r="3"/>'
            . '</svg>'
        );
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(['default' => 1, 'lg' => 3])->schema([
                Grid::make(1)->columnSpan(['lg' => 2])->schema([
                    Section::make('Información básica')->schema([
                        TextInput::make('nombre')->required()->maxLength(255),
                        TextInput::make('codigobarra')
                            ->label('Código de barras')
                            ->required()
                            ->maxLength(100)
                            ->helperText('Obligatorio para sincronizar la foto con web y WhatsApp.'),
                        Textarea::make('descripcion')->label('Descripción')->rows(4),
                    ]),
                    Section::make('Precios y stock')->schema([
                        TextInput::make('precio')->label('Precio venta')->numeric()->required()->prefix('$'),
                        TextInput::make('precio_costo')->label('Precio costo')->numeric()->prefix('$'),
                        TextInput::make('stock_actual')->label('Stock actual')->numeric()->default(0),
                        TextInput::make('stock_minimo')->label('Stock mínimo')->numeric()->default(5),
                        TextInput::make('alerta_stock_minimo')->label('Alerta stock mínimo')->numeric()->default(5),
                    ])->columns(2),
                    Section::make('Categorías')->schema([
                        Select::make('idcategoria')
                            ->label('Categoría principal')
                            ->relationship('categoria', 'nombre')
                            ->searchable()
                            ->preload(),
                        Select::make('categorias')
                            ->label('Categorías (web / filtros)')
                            ->relationship('categorias', 'nombre')
                            ->multiple()
                            ->searchable()
                            ->preload(),
                    ]),
                    Section::make('Estado')->schema([
                        Toggle::make('activo')
                            ->label('Activo en inventario')
                            ->helperText('Si lo apagas, desaparece también del mostrador y apps internas.')
                            ->default(true),
                        Toggle::make('venta_web')
                            ->label('Compra online (dondemorales.cl)')
                            ->helperText('Apágalo para mostrar el producto pero venderlo solo en local. Enfoque web: pack, helados, regalos y comida.')
                            ->default(true)
                            ->visible(fn () => DbSchema::hasColumn('productos', 'venta_web')),
                        Toggle::make('es_pack')
                            ->label('Pack cerrado · composición')
                            ->helperText('Canasta/regalo: productos fijos en la pestaña «Componentes». Para combo helado sin elección use «Opciones y grupos» (pack cerrado · menú). Pack con elección del cliente = pack abierto. Ver docs/TERMINOLOGIA_PRODUCTOS.md')
                            ->default(false),
                        Select::make('builder_profile')
                            ->label('Perfil armador web')
                            ->options(fn (): array => ProductBuilderProfileService::selectOptions())
                            ->default('auto')
                            ->helperText('Define la UX del armador en la tienda. «Automático» infiere por nombre/categoría; usa un perfil fijo para productos nuevos.')
                            ->visible(fn () => DbSchema::hasColumn('productos', 'builder_profile')),
                        TextInput::make('veces_vendido')->label('Veces vendido')->numeric()->disabled(),
                    ])->columns(2),
                ]),
                Grid::make(1)->columnSpan(['lg' => 1])->schema([
                    Section::make('Tienda')->schema([
                        Select::make('commerce_store_id')
                            ->label('Tienda ecommerce')
                            ->relationship('commerceStore', 'name')
                            ->default(fn () => CommerceStore::query()
                                ->where('slug', config('commerce.default_store_slug', 'default'))
                                ->value('id'))
                            ->searchable()
                            ->preload()
                            ->visible(fn () => DbSchema::hasColumn('productos', 'commerce_store_id')),
                    ]),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->queryStringIdentifier('productos')
            ->columns([
                TextColumn::make('commerceStore.name')
                    ->label('Tienda')
                    ->toggleable(isToggledHiddenByDefault: true),
                ImageColumn::make('foto')
                    ->label('Foto')
                    ->square()
                    ->height(52)
                    ->width(52)
                    ->checkFileExistence(false)
                    ->defaultImageUrl(static::productPlaceholderImageUrl())
                    ->getStateUsing(fn (Producto $record): ?string => static::fotoPreviewUrl($record)),
                TextColumn::make('nombre')->searchable(false)->sortable()->limit(40)->weight('medium'),
                TextColumn::make('codigobarra')->label('Código')->searchable(false)->toggleable(),
                TextColumn::make('categoria.nombre')->label('Categoría')->sortable()->toggleable(),
                TextColumn::make('precio')
                    ->label('Precio')
                    ->sortable()
                    ->money('CLP', locale: 'es'),
                TextColumn::make('stock_actual')
                    ->label('Stock')
                    ->sortable()
                    ->alignCenter(),
                IconColumn::make('activo')->label('Activo')->boolean(),
                IconColumn::make('venta_web')
                    ->label('Web')
                    ->boolean()
                    ->visible(fn () => DbSchema::hasColumn('productos', 'venta_web')),
                TextColumn::make('personalizacion')
                    ->label('Armador')
                    ->badge()
                    ->getStateUsing(function (Producto $record): ?string {
                        if ($record->es_pack) {
                            return 'Pack';
                        }
                        if ($record->bundleOptions()->exists()) {
                            return 'Opciones';
                        }
                        if ($record->customizationFields()->exists()) {
                            return 'Campos';
                        }

                        return null;
                    })
                    ->color(fn (?string $state): string => match ($state) {
                        'Pack' => 'warning',
                        'Opciones' => 'info',
                        'Campos' => 'success',
                        default => 'gray',
                    })
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('commerce_store_id')
                    ->label('Tienda')
                    ->relationship('commerceStore', 'name')
                    ->visible(fn () => DbSchema::hasColumn('productos', 'commerce_store_id')),
                SelectFilter::make('idcategoria')
                    ->label('Categoría')
                    ->relationship('categoria', 'nombre'),
                TernaryFilter::make('activo')->label('Activo'),
                TernaryFilter::make('venta_web')
                    ->label('Compra online')
                    ->visible(fn () => DbSchema::hasColumn('productos', 'venta_web')),
                Filter::make('bajo_stock')
                    ->label('Stock bajo')
                    ->query(fn ($query) => $query->whereColumn('stock_actual', '<=', 'stock_minimo')),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    ->before(function (Producto $record): void {
                        if ($record->detalleVentas()->exists()) {
                            \Filament\Notifications\Notification::make()
                                ->title('Tiene ventas asociadas — desactívalo en su lugar.')
                                ->danger()
                                ->send();

                            throw new \Filament\Support\Exceptions\Halt;
                        }
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('activar')
                        ->label('Activar seleccionados')
                        ->icon('heroicon-o-check-circle')
                        ->action(fn ($records) => $records->each->update(['activo' => true]))
                        ->requiresConfirmation(),
                    BulkAction::make('desactivar')
                        ->label('Desactivar seleccionados')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn ($records) => $records->each->update(['activo' => false]))
                        ->requiresConfirmation(),
                    BulkAction::make('pausar_venta_web')
                        ->label('Pausar compra online')
                        ->icon('heroicon-o-pause-circle')
                        ->color('warning')
                        ->visible(fn () => DbSchema::hasColumn('productos', 'venta_web'))
                        ->action(fn ($records) => $records->each->update(['venta_web' => false]))
                        ->requiresConfirmation(),
                    BulkAction::make('activar_venta_web')
                        ->label('Activar compra online')
                        ->icon('heroicon-o-globe-alt')
                        ->color('success')
                        ->visible(fn () => DbSchema::hasColumn('productos', 'venta_web'))
                        ->action(fn ($records) => $records->each->update(['venta_web' => true]))
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('idproducto', 'desc')
            ->striped()
            ->extremePaginationLinks()
            ->paginationPageOptions([25, 50, 100])
            ->defaultPaginationPageOption(25)
            ->searchPlaceholder('Buscar por nombre o código…');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\BundleOptionsRelationManager::class,
            RelationManagers\CustomizationFieldsRelationManager::class,
            RelationManagers\ProductoSugerenciasRelationManager::class,
            RelationManagers\PackComponentesRelationManager::class,
        ];
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
