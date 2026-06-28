<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VentaResource\Pages;
use App\Models\Venta;
use App\Support\AdminAccess;
use App\Support\VentaEstado;
use BackedEnum;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class VentaResource extends Resource
{
    protected static ?string $model = Venta::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-currency-dollar';

    protected static string | UnitEnum | null $navigationGroup = 'Ventas';

    protected static ?string $navigationLabel = 'Ventas';

    protected static ?int $navigationSort = 10;

    public static function canViewAny(): bool
    {
        return AdminAccess::canViewSales(auth()->user());
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Información de venta')->schema([
                TextInput::make('numero_venta')->label('N° venta')->disabled(),
                TextInput::make('total')->label('Total')->numeric()->disabled()->prefix('$'),
                Select::make('medio_pago')->label('Medio de pago')->options([
                    'efectivo' => 'Efectivo',
                    'tarjeta' => 'Tarjeta',
                    'webpay' => 'WebPay',
                    'transferencia' => 'Transferencia',
                ])->disabled(),
                Select::make('estado')->label('Estado')->options(VentaEstado::labels())->disabled(),
            ]),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(['default' => 1, 'lg' => 2])->schema([
                Section::make('Venta')->schema([
                    TextEntry::make('numero_venta')->label('N° venta'),
                    TextEntry::make('fecha')->label('Fecha')->dateTime('d/m/Y H:i'),
                    TextEntry::make('medio_pago')->label('Medio de pago')->badge(),
                    TextEntry::make('estado')->label('Estado')->badge(),
                    TextEntry::make('total')->label('Total')->money('CLP'),
                    TextEntry::make('subtotal')->label('Subtotal')->money('CLP'),
                    TextEntry::make('descuento')->label('Descuento')->money('CLP'),
                ])->columns(2),
                Section::make('Cliente / entrega')->schema([
                    TextEntry::make('cliente_nombre')->label('Nombre')->placeholder('—'),
                    TextEntry::make('cliente_email')->label('Email')->placeholder('—'),
                    TextEntry::make('cliente_telefono')->label('Teléfono')->placeholder('—'),
                    TextEntry::make('delivery_address')->label('Dirección')->placeholder('—'),
                    TextEntry::make('fulfillment_type')->label('Tipo entrega')->placeholder('—'),
                    TextEntry::make('observaciones')->label('Observaciones')->placeholder('—'),
                ])->columns(2),
            ]),
            Section::make('Productos')->schema([
                RepeatableEntry::make('detalles')
                    ->label('')
                    ->schema([
                        TextEntry::make('producto.nombre')->label('Producto'),
                        TextEntry::make('cantidad')->label('Cant.'),
                        TextEntry::make('precio_venta')->label('Precio')->money('CLP'),
                        TextEntry::make('subtotal')->label('Subtotal')->money('CLP'),
                    ])
                    ->columns(4),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('numero_venta')->label('N° venta')->searchable(),
            TextColumn::make('fecha')->label('Fecha')->dateTime('d/m/Y H:i')->sortable(),
            TextColumn::make('cliente_nombre')->label('Cliente')->searchable()->toggleable(),
            TextColumn::make('medio_pago')->label('Pago')->badge()->color(fn (?string $state): string => match ($state) {
                'webpay' => 'success',
                'tarjeta' => 'warning',
                'efectivo' => 'gray',
                default => 'gray',
            }),
            TextColumn::make('total')->label('Total')->money('CLP')->sortable(),
            TextColumn::make('estado')
                ->label('Estado')
                ->badge()
                ->formatStateUsing(fn (?string $state): string => VentaEstado::labels()[strtolower((string) $state)] ?? ucfirst((string) $state))
                ->color(fn (?string $state): string => match (strtolower((string) $state)) {
                    'pagado', 'activo' => 'success',
                    'pendiente' => 'warning',
                    'rechazado', 'anulado' => 'danger',
                    default => 'gray',
                }),
        ])->filters([
            SelectFilter::make('estado')
                ->label('Estado')
                ->options(VentaEstado::labels()),
            SelectFilter::make('medio_pago')->label('Medio de pago'),
            Filter::make('fecha')->schema([
                DatePicker::make('desde')->label('Desde'),
                DatePicker::make('hasta')->label('Hasta'),
            ])->query(fn ($query, array $data) => $query
                ->when($data['desde'] ?? null, fn ($q, $desde) => $q->whereDate('fecha', '>=', $desde))
                ->when($data['hasta'] ?? null, fn ($q, $hasta) => $q->whereDate('fecha', '<=', $hasta))),
        ])->recordActions([
            ViewAction::make(),
        ])
            ->defaultSort('fecha', 'desc')
            ->paginationPageOptions([25, 50, 100])
            ->defaultPaginationPageOption(25)
            ->extremePaginationLinks()
            ->striped()
            ->searchPlaceholder('Buscar venta o cliente…');
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->with(['detalles.producto']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVentas::route('/'),
            'view' => Pages\ViewVenta::route('/{record}'),
        ];
    }
}
