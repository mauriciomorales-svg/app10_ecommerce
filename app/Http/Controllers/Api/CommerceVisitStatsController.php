<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CommerceVisitStatsService;
use Illuminate\Http\Request;

class CommerceVisitStatsController extends Controller
{
    public function index(Request $request)
    {
        $expected = trim((string) config('services.jobs_hours.analytics_key', ''));
        if ($expected === '') {
            return response()->json([
                'success' => false,
                'message' => 'Analytics no configurado. Define JH_ANALYTICS_KEY en el servidor.',
            ], 503);
        }

        $provided = trim((string) (
            $request->header('X-JH-Analytics-Key')
            ?: $request->query('key', '')
        ));

        if (! hash_equals($expected, $provided)) {
            return response()->json([
                'success' => false,
                'message' => 'Clave incorrecta.',
            ], 401);
        }

        $days = (int) $request->query('days', 30);
        $site = $request->query('site');
        $site = is_string($site) && $site !== '' ? $site : 'jobshours';

        $stats = CommerceVisitStatsService::summary($days, $site);

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }
}
