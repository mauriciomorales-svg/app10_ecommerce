<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CommerceVisitStatsService
{
    /**
     * @return array<string, mixed>
     */
    public static function summary(int $days = 30, ?string $site = null): array
    {
        if (! Schema::hasTable('commerce_events')) {
            return [
                'available' => false,
                'message' => 'Tabla commerce_events no existe. Ejecuta migraciones.',
            ];
        }

        $days = max(1, min($days, 90));
        $since = now()->subDays($days - 1)->startOfDay();
        $todayStart = now()->startOfDay();

        $base = DB::table('commerce_events')
            ->where('event', 'page_view')
            ->where('created_at', '>=', $since);

        if ($site !== null && $site !== '') {
            $base->where('payload->site', $site);
        }

        $pageViews = (clone $base)->count();
        $uniqueSessions = (clone $base)
            ->whereNotNull('session_id')
            ->distinct()
            ->count('session_id');

        $todayQuery = DB::table('commerce_events')
            ->where('event', 'page_view')
            ->where('created_at', '>=', $todayStart);

        if ($site !== null && $site !== '') {
            $todayQuery->where('payload->site', $site);
        }

        $todayPageViews = (clone $todayQuery)->count();
        $todayUniqueSessions = (clone $todayQuery)
            ->whereNotNull('session_id')
            ->distinct()
            ->count('session_id');

        $byDay = (clone $base)
            ->selectRaw('DATE(created_at) as day')
            ->selectRaw('COUNT(*) as page_views')
            ->selectRaw('COUNT(DISTINCT session_id) as unique_sessions')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'date' => (string) $row->day,
                'page_views' => (int) $row->page_views,
                'unique_sessions' => (int) $row->unique_sessions,
            ])
            ->values()
            ->all();

        $byPage = (clone $base)
            ->select('page')
            ->selectRaw('COUNT(*) as page_views')
            ->selectRaw('COUNT(DISTINCT session_id) as unique_sessions')
            ->groupBy('page')
            ->orderByDesc('page_views')
            ->limit(25)
            ->get()
            ->map(fn ($row) => [
                'page' => $row->page ?: '(sin ruta)',
                'page_views' => (int) $row->page_views,
                'unique_sessions' => (int) $row->unique_sessions,
            ])
            ->values()
            ->all();

        return [
            'available' => true,
            'period_days' => $days,
            'site' => $site,
            'generated_at' => now()->toIso8601String(),
            'totals' => [
                'page_views' => $pageViews,
                'unique_sessions' => $uniqueSessions,
                'today_page_views' => $todayPageViews,
                'today_unique_sessions' => $todayUniqueSessions,
            ],
            'by_day' => $byDay,
            'by_page' => $byPage,
        ];
    }
}
