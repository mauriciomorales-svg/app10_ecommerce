<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VentaResource\Pages;
use App\Models\Venta;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VentaResource extends Resource
{
    protected static ?string $model = Venta::class;
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';
    protected static ?string $navigationLabel = 'Ventas';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información de Venta')->schema([
                Forms\Components\TextInput::make('num_comprobante')->label('N° Comprobante')->disabled(),
                Forms\Components\TextInput::make('total_venta')->label('Total')->numeric()->disabled()->prefix('$'),
                Forms\Components\Select::make('tipo_pago')->label('Tipo de Pago')->options(['efectivo' => 'Efectivo', 'tarjeta' => 'Tarjeta', 'webpay' => 'WebPay'])->disabled(),
                Forms\Components\Select::make('estado')->label('Estado')->options(['activo' => 'Activo', 'anulado' => 'Anulado']),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('num_comprobante')->label('N° Comprobante')->searchable(),
            Tables\Columns\TextColumn::make('fecha_hora')->label('Fecha')->dateTime('d/m/Y H:i')->sortable(),
            Tables\Columns\TextColumn::make('trabajador.nombre')->label('Vendedor'),
            Tables\Columns\TextColumn::make('tipo_pago')->label('Pago')->badge()->color(fn (string $state): string => match ($state) {
                'webpay' => 'success',
                'tarjeta' => 'warning',
                default => 'gray',
            }),
            Tables\Columns\TextColumn::make('total_venta')->label('Total')->money('CLP')->sortable(),
            Tables\Columns\IconColumn::make('estado')->label('Activo')->boolean(),
        ])->filters([
            Tables\Filters\SelectFilter::make('tipo_pago')->label('Tipo de Pago'),
            Tables\Filters\Filter::make('fecha_hora')->form([
                Forms\Components\DatePicker::make('desde'),
                Forms\Components\DatePicker::make('hasta'),
            ])->query(fn ($query, $data) => $query->when($data['desde'], fn ($q) => $q->whereDate('fecha_hora', '>=', $data['desde']))->when($data['hasta'], fn ($q) => $q->whereDate('fecha_hora', '<=', $data['hasta']))),
        ])->defaultSort('fecha_hora', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVentas::route('/'),
            'view' => Pages\ViewVenta::route('/{record}'),
        ];
    }
}
