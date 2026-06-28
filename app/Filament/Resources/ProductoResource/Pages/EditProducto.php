<?php

namespace App\Filament\Resources\ProductoResource\Pages;

use App\Filament\Resources\ProductoResource;
use App\Filament\Resources\ProductoResource\Concerns\SyncsProductIntegrations;
use App\Models\Producto;
use App\Services\ProductBuilderTemplateService;
use Filament\Actions;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\View;
use Filament\Schemas\Schema;
use Filament\Support\Exceptions\Halt;

class EditProducto extends EditRecord
{
    use SyncsProductIntegrations;

    protected static string $resource = ProductoResource::class;

    public function mount(int | string $record): void
    {
        parent::mount($record);

        if ($message = session('dm_photo_upload')) {
            Notification::make()->title($message)->success()->send();
        }

        if ($message = session('dm_photo_upload_error')) {
            Notification::make()->title($message)->danger()->send();
        }

        if (session('dm_photo_session_expired')) {
            Notification::make()
                ->title('Sesión expirada')
                ->body('Recarga la página (F5) e intenta de nuevo.')
                ->warning()
                ->send();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('aplicar_plantilla')
                ->label('Aplicar plantilla')
                ->icon('heroicon-o-clipboard-document-list')
                ->color('gray')
                ->form([
                    Select::make('template')
                        ->label('Plantilla')
                        ->options(function (): array {
                            return collect(ProductBuilderTemplateService::templates())
                                ->filter(fn (array $t): bool => (bool) ($t['available'] ?? false))
                                ->mapWithKeys(fn (array $t, string $key): array => [
                                    $key => $t['label'] . (isset($t['description']) ? ' — ' . $t['description'] : ''),
                                ])
                                ->all();
                        })
                        ->required()
                        ->helperText('Copia grupos, campos y sugerencias desde un producto referencia.'),
                    Toggle::make('replace')
                        ->label('Reemplazar personalización actual')
                        ->default(true),
                ])
                ->action(function (array $data, Producto $record): void {
                    try {
                        $count = ProductBuilderTemplateService::applyTemplate(
                            $record,
                            (string) $data['template'],
                            (bool) ($data['replace'] ?? true)
                        );
                        Notification::make()
                            ->title('Plantilla aplicada')
                            ->body("Se copiaron {$count} elementos de configuración.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('No se pudo aplicar la plantilla')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),
            Actions\Action::make('copiar_personalizacion')
                ->label('Copiar desde producto')
                ->icon('heroicon-o-square-2-stack')
                ->color('gray')
                ->form([
                    Select::make('source_product_id')
                        ->label('Producto origen')
                        ->searchable()
                        ->getSearchResultsUsing(function (string $search): array {
                            return Producto::query()
                                ->withoutGlobalScopes(['commerce_store'])
                                ->where('idproducto', '!=', $this->getRecord()->idproducto)
                                ->where(function ($q) use ($search) {
                                    $q->where('nombre', 'ilike', "%{$search}%")
                                        ->orWhere('codigobarra', 'ilike', "%{$search}%");
                                })
                                ->orderBy('nombre')
                                ->limit(40)
                                ->pluck('nombre', 'idproducto')
                                ->all();
                        })
                        ->required(),
                    Toggle::make('replace')
                        ->label('Reemplazar personalización actual')
                        ->default(true),
                ])
                ->action(function (array $data, Producto $record): void {
                    try {
                        $count = ProductBuilderTemplateService::copyPersonalizationFrom(
                            (int) $data['source_product_id'],
                            $record,
                            (bool) ($data['replace'] ?? true)
                        );
                        Notification::make()
                            ->title('Personalización copiada')
                            ->body("Se copiaron {$count} elementos.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Error al copiar')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),
            Actions\Action::make('probar_armador')
                ->label('Probar armador')
                ->icon('heroicon-o-squares-2x2')
                ->color('info')
                ->url(fn (Producto $record): string => rtrim((string) config('app.url'), '/')
                    . '/producto/' . $record->idproducto . '?armar=1')
                ->openUrlInNewTab()
                ->visible(fn (Producto $record): bool => $record->es_pack
                    || $record->bundleOptions()->exists()
                    || $record->customizationFields()->exists()),
            Actions\Action::make('ver_web')
                ->label('Ver en tienda')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->color('gray')
                ->url(fn (Producto $record): string => url('/?buscar=' . urlencode($record->nombre)))
                ->openUrlInNewTab(),
            Actions\DeleteAction::make()
                ->before(function (Producto $record): void {
                    if ($record->detalleVentas()->exists()) {
                        Notification::make()
                            ->title('No se puede eliminar')
                            ->body('Este producto tiene ventas registradas. Desactívalo en su lugar.')
                            ->danger()
                            ->send();

                        throw new Halt;
                    }
                }),
        ];
    }

    protected function afterSave(): void
    {
        $this->syncIntegrations();
    }

    public function content(Schema $schema): Schema
    {
        if ($this->hasCombinedRelationManagerTabsWithContent()) {
            return parent::content($schema);
        }

        return $schema->components([
            Section::make('Foto en la tienda')
                ->description('Se muestra en dondemorales.cl y en el listado de productos.')
                ->schema([
                    View::make('filament.resources.producto-resource.components.product-photo-panel')
                        ->viewData(fn (): array => [
                            'producto' => $this->getRecord()->fresh(),
                        ]),
                ])
                ->columnSpanFull(),
            $this->getFormContentComponent(),
            $this->getRelationManagersContentComponent(),
        ]);
    }
}
