<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoriaResource\Pages;
use App\Models\Categoria;
use App\Support\AdminAccess;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\EditAction;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class CategoriaResource extends Resource
{
    protected static ?string $model = Categoria::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-tag';

    protected static string | UnitEnum | null $navigationGroup = 'Catálogo';

    protected static ?string $navigationLabel = 'Categorías';

    protected static ?string $modelLabel = 'Categoría';

    protected static ?int $navigationSort = 2;

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

    public static function canAccess(): bool
    {
        return DbSchema::hasTable('categoria');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->schema([
                TextInput::make('nombre')->required()->maxLength(120),
                Textarea::make('descripcion')->rows(2),
                Toggle::make('activo')->label('Activa')->default(true),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nombre')->searchable()->sortable(),
                TextColumn::make('descripcion')->limit(40)->toggleable(),
                IconColumn::make('activo')->label('Activa')->boolean(),
            ])
            ->defaultSort('nombre')
            ->recordActions([
                EditAction::make(),
            ])
            ->striped()
            ->paginationPageOptions([25, 50, 100])
            ->defaultPaginationPageOption(25);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategorias::route('/'),
            'create' => Pages\CreateCategoria::route('/create'),
            'edit' => Pages\EditCategoria::route('/{record}/edit'),
        ];
    }
}
