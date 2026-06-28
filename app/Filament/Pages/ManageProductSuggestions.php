<?php

namespace App\Filament\Pages;

use App\Models\Categoria;
use App\Support\AdminAccess;
use App\Support\ProductSuggestionConfig;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Concerns\CanUseDatabaseTransactions;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Exceptions\Halt;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Schema as DbSchema;
use Throwable;
use UnitEnum;

/**
 * @property-read Schema $form
 */
class ManageProductSuggestions extends Page
{
    use CanUseDatabaseTransactions;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static string | UnitEnum | null $navigationGroup = 'Marketing';

    protected static ?string $navigationLabel = 'Sugerencias de productos';

    protected static ?string $title = 'Sugerencias de productos';

    protected static ?int $navigationSort = 10;

    protected static ?string $slug = 'sugerencias-productos';

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    public static function canAccess(): bool
    {
        return AdminAccess::canManageCatalog(auth()->user())
            && DbSchema::hasTable('configuracion');
    }

    public function mount(): void
    {
        $this->fillForm();
    }

    protected function fillForm(): void
    {
        $this->form->fill(ProductSuggestionConfig::formDefaults());
    }

    public function save(): void
    {
        try {
            $this->beginDatabaseTransaction();

            $data = $this->form->getState();

            ProductSuggestionConfig::saveLimits(
                (int) ($data['max_results'] ?? 6),
                (int) ($data['max_results_kiosko'] ?? 3),
            );
            ProductSuggestionConfig::saveCategoryPairs($data['category_pairs'] ?? []);

            $this->commitDatabaseTransaction();
        } catch (Halt $exception) {
            $exception->shouldRollbackDatabaseTransaction()
                ? $this->rollBackDatabaseTransaction()
                : $this->commitDatabaseTransaction();

            return;
        } catch (Throwable $exception) {
            $this->rollBackDatabaseTransaction();

            throw $exception;
        }

        Notification::make()
            ->success()
            ->title('Sugerencias guardadas')
            ->body('Web, kiosko y POS usarán estas reglas al instante.')
            ->send();
    }

    public function restoreFileDefaults(): void
    {
        ProductSuggestionConfig::clearOverrides();
        $this->fillForm();

        Notification::make()
            ->success()
            ->title('Valores del archivo restaurados')
            ->body('Se eliminaron los overrides en base de datos.')
            ->send();
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema
            ->operation('edit')
            ->statePath('data');
    }

    public function form(Schema $schema): Schema
    {
        $categories = fn (): array => Categoria::query()
            ->orderBy('nombre')
            ->pluck('nombre', 'nombre')
            ->all();

        return $schema->components([
            Section::make('Límites')
                ->description('Cuántos productos sugerir en cada canal.')
                ->columns(2)
                ->schema([
                    TextInput::make('max_results')
                        ->label('Máximo en web (carrito)')
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(12)
                        ->required(),
                    TextInput::make('max_results_kiosko')
                        ->label('Máximo en kiosko / POS')
                        ->numeric()
                        ->minValue(1)
                        ->maxValue(6)
                        ->required(),
                ]),
            Section::make('Reglas por categoría')
                ->description('Si el cliente lleva un producto de la categoría origen, se sugieren productos de las categorías destino. Los overrides por producto (pestaña sugerencias en catálogo) tienen prioridad.')
                ->schema([
                    Repeater::make('category_pairs')
                        ->label('Reglas')
                        ->addActionLabel('Agregar regla')
                        ->reorderable()
                        ->collapsible()
                        ->itemLabel(fn (array $state): ?string => $state['from'] ?? 'Nueva regla')
                        ->schema([
                            Select::make('from')
                                ->label('Categoría origen')
                                ->options($categories)
                                ->searchable()
                                ->required(),
                            Select::make('suggest')
                                ->label('Sugerir categorías')
                                ->options($categories)
                                ->multiple()
                                ->searchable()
                                ->required(),
                            TextInput::make('mensaje')
                                ->label('Mensaje al cliente')
                                ->maxLength(255)
                                ->placeholder('¿Bebida para acompañar?')
                                ->required(),
                        ]),
                ]),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('restoreDefaults')
                ->label('Restaurar archivo')
                ->icon('heroicon-o-arrow-path')
                ->color('gray')
                ->requiresConfirmation()
                ->modalHeading('¿Restaurar valores del archivo?')
                ->modalDescription('Se borrarán los cambios guardados en la base de datos y volverán las reglas de inventario-api/config/product_suggestions.php.')
                ->action(fn () => $this->restoreFileDefaults()),
        ];
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Guardar cambios')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            $this->getFormContentComponent(),
        ]);
    }

    public function getFormContentComponent(): Component
    {
        return Form::make([EmbeddedSchema::make('form')])
            ->id('form')
            ->livewireSubmitHandler('save')
            ->footer([
                Actions::make($this->getFormActions())
                    ->alignment($this->getFormActionsAlignment())
                    ->fullWidth($this->hasFullWidthFormActions())
                    ->sticky($this->areFormActionsSticky())
                    ->key('form-actions'),
            ]);
    }

    protected function hasFullWidthFormActions(): bool
    {
        return false;
    }

    public function getSubheading(): string | Htmlable | null
    {
        if (ProductSuggestionConfig::hasDbOverrides()) {
            return 'Usando reglas personalizadas en base de datos (prioridad sobre el archivo PHP).';
        }

        return 'Mostrando reglas del archivo de configuración. Al guardar, quedarán en base de datos.';
    }
}
