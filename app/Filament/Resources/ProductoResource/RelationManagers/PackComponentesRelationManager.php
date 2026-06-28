<?php

namespace App\Filament\Resources\ProductoResource\RelationManagers;

use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema as DbSchema;

class PackComponentesRelationManager extends RelationManager
{
    protected static string $relationship = 'componentes';

    protected static ?string $title = 'Pack cerrado · composición';

    protected static ?string $recordTitleAttribute = 'nombre';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return DbSchema::hasTable('producto_composicion') && (bool) $ownerRecord->es_pack;
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('cantidad')
                ->label('Cantidad por pack')
                ->numeric()
                ->required()
                ->default(1)
                ->minValue(1),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nombre')->label('Componente')->searchable(),
                TextColumn::make('codigobarra')->label('Código')->toggleable(),
                TextColumn::make('stock_actual')->label('Stock')->alignCenter(),
                TextColumn::make('pivot.cantidad')->label('Cant./pack')->sortable(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Agregar componente')
                    ->preloadRecordSelect()
                    ->recordSelectSearchColumns(['nombre', 'codigobarra'])
                    ->schema([
                        TextInput::make('cantidad')
                            ->label('Cantidad por pack')
                            ->numeric()
                            ->required()
                            ->default(1)
                            ->minValue(1),
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DetachAction::make(),
            ])
            ->emptyStateHeading('Pack sin componentes')
            ->emptyStateDescription('Vincula los productos que conforman este pack y cuántas unidades lleva cada uno.');
    }
}
