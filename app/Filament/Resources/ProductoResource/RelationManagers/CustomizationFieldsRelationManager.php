<?php

namespace App\Filament\Resources\ProductoResource\RelationManagers;

use App\Support\CustomizationFieldOptions;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema as DbSchema;

class CustomizationFieldsRelationManager extends RelationManager
{
    protected static string $relationship = 'customizationFields';

    protected static ?string $title = 'Campos personalizados';

    protected static ?string $recordTitleAttribute = 'label';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return DbSchema::hasTable('customization_fields');
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('label')
                ->label('Etiqueta visible')
                ->required()
                ->maxLength(120),
            TextInput::make('field_key')
                ->label('Clave interna')
                ->required()
                ->maxLength(64)
                ->alphaDash()
                ->helperText('Sin espacios. Ej: nombre_destinatario, hora_entrega'),
            Select::make('field_type')
                ->label('Tipo')
                ->options([
                    'text' => 'Texto corto',
                    'textarea' => 'Texto largo',
                    'select' => 'Lista desplegable',
                ])
                ->required()
                ->default('text')
                ->live(),
            Textarea::make('select_options_lines')
                ->label('Opciones (una por línea)')
                ->rows(4)
                ->visible(fn ($get) => $get('field_type') === 'select')
                ->dehydrated(false)
                ->afterStateHydrated(function (Textarea $component, ?Model $record): void {
                    if (! $record) {
                        return;
                    }
                    $component->state(CustomizationFieldOptions::toLines($record->options));
                }),
            Toggle::make('is_required')->label('Obligatorio')->default(false),
            TextInput::make('extra_cost')
                ->label('Recargo ($)')
                ->numeric()
                ->default(0)
                ->minValue(0),
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
                TextColumn::make('label')->searchable()->sortable(),
                TextColumn::make('field_key')->label('Clave')->toggleable(),
                TextColumn::make('field_type')->label('Tipo')->badge(),
                TextColumn::make('extra_cost')->label('Recargo')->money('CLP', locale: 'es'),
                IconColumn::make('is_required')->label('Oblig.')->boolean(),
                TextColumn::make('sort_order')->label('Orden')->sortable(),
            ])
            ->defaultSort('sort_order')
            ->headerActions([
                CreateAction::make()
                    ->label('Agregar campo')
                    ->mutateFormDataUsing(function (array $data): array {
                        if (($data['field_type'] ?? '') === 'select') {
                            $data['options'] = CustomizationFieldOptions::fromLines((string) ($data['select_options_lines'] ?? ''));
                        } else {
                            $data['options'] = null;
                        }
                        unset($data['select_options_lines']);

                        return $data;
                    }),
            ])
            ->recordActions([
                EditAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        if (($data['field_type'] ?? '') === 'select') {
                            $data['options'] = CustomizationFieldOptions::fromLines((string) ($data['select_options_lines'] ?? ''));
                        } else {
                            $data['options'] = null;
                        }
                        unset($data['select_options_lines']);

                        return $data;
                    }),
                DeleteAction::make(),
            ])
            ->emptyStateHeading('Sin campos personalizados')
            ->emptyStateDescription('Ideal para regalos: nombre del destinatario, hora de entrega, dedicatoria…');
    }
}
