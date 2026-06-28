<x-filament-widgets::widget>
    <x-filament::section heading="{{ static::$heading }}">
        @if ($this->getRows()->isEmpty())
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Sin búsquedas fallidas en los últimos 7 días — o aún no hay datos registrados.
            </p>
        @else
            <div class="overflow-x-auto">
                <table class="fi-ta-table w-full text-start text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="px-3 py-2 text-start font-semibold">Búsqueda</th>
                            <th class="px-3 py-2 text-start font-semibold">Sección</th>
                            <th class="px-3 py-2 text-center font-semibold">Veces</th>
                            <th class="px-3 py-2 text-start font-semibold">Última</th>
                            <th class="px-3 py-2 text-end font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($this->getRows() as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="px-3 py-2 font-medium">{{ $row->query }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-300">{{ $this->scopeLabel($row->scope) }}</td>
                                <td class="px-3 py-2 text-center">{{ $row->veces }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-300">
                                    {{ \Illuminate\Support\Carbon::parse($row->ultima)->format('d/m/Y H:i') }}
                                </td>
                                <td class="px-3 py-2 text-end whitespace-nowrap">
                                    <a href="{{ $this->catalogUrl($row->query) }}"
                                       class="text-primary-600 hover:underline text-xs font-semibold me-3">
                                        Catálogo
                                    </a>
                                    <a href="{{ $this->createProductUrl($row->query) }}"
                                       class="text-success-600 hover:underline text-xs font-semibold">
                                        + Producto
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
