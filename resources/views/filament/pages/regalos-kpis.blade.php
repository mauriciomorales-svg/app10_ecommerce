<x-filament-panels::page>
    @php
        $kpi = $this->getKpis();
        $funnel = $kpi['funnel'] ?? [];
        $abandono = $funnel['abandono_por_paso'] ?? [];
    @endphp

    <div class="mb-4 flex flex-wrap items-center gap-3">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
        <select
            wire:model.live="days"
            class="fi-select-input rounded-lg border-gray-300 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
        >
            <option value="7">Últimos 7 días</option>
            <option value="14">Últimos 14 días</option>
            <option value="30">Últimos 30 días</option>
        </select>
        <span class="text-xs text-gray-500">Desde {{ $kpi['since'] ?? '—' }}</span>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
        {{-- Embudo quiz --}}
        <x-filament::section heading="Embudo quiz regalo">
            <div class="space-y-2 text-sm">
                @php
                    $steps = [
                        ['label' => 'Respondieron pregunta 1', 'n' => $funnel['iniciaron'] ?? 0],
                        ['label' => 'Llegaron a pregunta 2', 'n' => $funnel['pregunta_2'] ?? 0],
                        ['label' => 'Llegaron a pregunta 3', 'n' => $funnel['pregunta_3'] ?? 0],
                        ['label' => 'Completaron quiz', 'n' => $funnel['completaron'] ?? 0],
                    ];
                    $max = max(1, (int) ($funnel['iniciaron'] ?? 1));
                @endphp
                @foreach ($steps as $step)
                    @php $pct = round(100 * ($step['n'] / $max), 0); @endphp
                    <div>
                        <div class="mb-0.5 flex justify-between text-xs">
                            <span>{{ $step['label'] }}</span>
                            <span class="font-semibold">{{ $step['n'] }} ({{ $pct }}%)</span>
                        </div>
                        <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div class="h-full rounded-full bg-rose-500" style="width: {{ $pct }}%"></div>
                        </div>
                    </div>
                @endforeach
            </div>
            @if (! empty($abandono))
                <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Abandono (último paso alcanzado)</p>
                <ul class="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                    @foreach ($abandono as $paso => $veces)
                        <li>Paso {{ $paso }}: <strong>{{ $veces }}</strong> sesiones sin completar</li>
                    @endforeach
                </ul>
            @else
                <p class="mt-3 text-xs text-gray-500">Sin datos de abandono en el período.</p>
            @endif
        </x-filament::section>

        {{-- Packs recomendados por quiz --}}
        <x-filament::section heading="Packs sugeridos por quiz">
            @if (empty($kpi['quiz_packs']))
                <p class="text-sm text-gray-500">Aún no hay quizzes completados en el período.</p>
            @else
                <table class="fi-ta-table w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 text-start font-semibold">Pack</th>
                            <th class="py-2 text-end font-semibold">Veces</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($kpi['quiz_packs'] as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-1.5">{{ $row['pack'] }}</td>
                                <td class="py-1.5 text-end font-medium">{{ $row['veces'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>

        {{-- Ocasiones quiz --}}
        <x-filament::section heading="Ocasiones detectadas (quiz)">
            @if (empty($kpi['quiz_ocasiones']))
                <p class="text-sm text-gray-500">Sin ocasiones registradas.</p>
            @else
                <div class="flex flex-wrap gap-2">
                    @foreach ($kpi['quiz_ocasiones'] as $row)
                        <span class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
                            {{ $row['ocasion'] }}
                            <span class="rounded-full bg-rose-200/80 px-1.5 text-[10px] dark:bg-rose-800">{{ $row['veces'] }}</span>
                        </span>
                    @endforeach
                </div>
            @endif
        </x-filament::section>

        {{-- Upsell checkout --}}
        <x-filament::section heading="Upsell en checkout">
            @if (empty($kpi['upsell']))
                <p class="text-sm text-gray-500">Nadie añadió upsell de regalo en checkout.</p>
            @else
                <table class="fi-ta-table w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 text-start font-semibold">Producto</th>
                            <th class="py-2 text-end font-semibold">Añadidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($kpi['upsell'] as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-1.5">{{ $row['nombre'] }}</td>
                                <td class="py-1.5 text-end font-medium">{{ $row['veces'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>

        {{-- Comparador --}}
        <x-filament::section heading="Comparador de packs">
            @if (empty($kpi['compare']['por_pack']))
                <p class="text-sm text-gray-500">Sin clicks en «Reservar» del comparador.</p>
            @else
                <table class="fi-ta-table w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 text-start font-semibold">Pack</th>
                            <th class="py-2 text-end font-semibold">Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($kpi['compare']['por_pack'] as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-1.5">{{ $row['nombre'] }}</td>
                                <td class="py-1.5 text-end font-medium">{{ $row['veces'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>

        {{-- Búsquedas regalos sin resultado --}}
        <x-filament::section heading="Búsquedas regalos sin resultado">
            @php $topBusq = $kpi['busquedas_regalos']['top_sin_resultado'] ?? []; @endphp
            @if (empty($topBusq))
                <p class="text-sm text-gray-500">Sin búsquedas fallidas en /regalos.</p>
            @else
                <table class="fi-ta-table w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="py-2 text-start font-semibold">Término</th>
                            <th class="py-2 text-end font-semibold">Veces</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($topBusq as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-1.5">{{ $row['query'] }}</td>
                                <td class="py-1.5 text-end font-medium">{{ $row['veces'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </x-filament::section>

        {{-- Ventas packs reales --}}
        <x-filament::section heading="Ventas packs (cobradas)" class="lg:col-span-2">
            @if (empty($kpi['ventas_packs']))
                <p class="text-sm text-gray-500">Sin ventas de packs/regalos en el período.</p>
            @else
                <div class="overflow-x-auto">
                    <table class="fi-ta-table w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-white/10">
                                <th class="px-2 py-2 text-start font-semibold">Producto</th>
                                <th class="px-2 py-2 text-end font-semibold">Unidades</th>
                                <th class="px-2 py-2 text-end font-semibold">Monto $</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($kpi['ventas_packs'] as $row)
                                <tr class="border-b border-gray-100 dark:border-white/5">
                                    <td class="px-2 py-1.5">{{ $row['nombre'] }}</td>
                                    <td class="px-2 py-1.5 text-end font-medium">{{ $row['unidades'] }}</td>
                                    <td class="px-2 py-1.5 text-end font-medium">${{ number_format($row['monto'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
            @if (! empty($kpi['config_mas_pedidos']))
                <p class="mt-3 text-xs text-gray-500">
                    Badges «Recomendado» en web:
                    {{ implode(' · ', $kpi['config_mas_pedidos']) }}
                </p>
            @endif
        </x-filament::section>
    </div>
</x-filament-panels::page>
