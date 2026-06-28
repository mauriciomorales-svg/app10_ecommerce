<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ValeDescuentoResource\Pages;
use App\Models\ValeDescuento;
use BackedEnum;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\EditAction;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class ValeDescuentoResource extends Resource
{
    protected static ?string $model = ValeDescuento::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-ticket';

    protected static string | UnitEnum | null $navigationGroup = 'Marketing';

    protected static ?string $navigationLabel = 'Cupones';

    protected static ?string $modelLabel = 'Cupón';

    public static function canAccess(): bool
    {
        return DbSchema::hasTable('vale_descuento');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->schema([
                TextInput::make('codigo')->required()->maxLength(50)->unique(ignoreRecord: true),
                Select::make('tipo')
                    ->options(['PORCENTAJE' => 'Porcentaje', 'MONTO' => 'Monto fijo'])
                    ->required()
                    ->default('PORCENTAJE'),
                TextInput::make('valor')->numeric()->required()->minValue(0),
                TextInput::make('descripcion')->maxLength(255),
                TextInput::make('monto_minimo')->numeric()->default(0)->label('Mínimo productos ($)'),
                Toggle::make('solo_primera_compra')->label('Solo primera compra web'),
                DatePicker::make('fecha_inicio'),
                DatePicker::make('fecha_fin'),
                TextInput::make('hora_inicio')->numeric()->minValue(0)->maxValue(23)->label('Hora inicio (0-23)'),
                TextInput::make('hora_fin')->numeric()->minValue(0)->maxValue(23)->label('Hora fin (0-23)'),
                TextInput::make('dias_semana')->maxLength(32)->label('Días ISO (1=lun…7=dom)')->placeholder('1,2,3,4'),
                TextInput::make('usos_maximos')->numeric()->default(0)->helperText('0 = ilimitado'),
                TextInput::make('usos_actuales')->numeric()->default(0)->disabled(),
                Toggle::make('activo')->default(true),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('codigo')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('tipo'),
                Tables\Columns\TextColumn::make('valor'),
                Tables\Columns\TextColumn::make('monto_minimo')->label('Mín. $'),
                Tables\Columns\IconColumn::make('solo_primera_compra')->boolean()->label('1ª compra'),
                Tables\Columns\TextColumn::make('usos_actuales')->label('Usos'),
                Tables\Columns\TextColumn::make('usos_maximos')->label('Máx'),
                Tables\Columns\IconColumn::make('activo')->boolean(),
            ])
            ->defaultSort('codigo')
            ->recordActions([
                EditAction::make(),
            ])
            ->striped();
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListValeDescuentos::route('/'),
            'create' => Pages\CreateValeDescuento::route('/create'),
            'edit' => Pages\EditValeDescuento::route('/{record}/edit'),
        ];
    }
}
