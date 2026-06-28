<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CommerceEventService
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public static function track(string $event, array $payload = [], ?string $sessionId = null, ?string $page = null): void
    {
        if (! Schema::hasTable('commerce_events')) {
            return;
        }

        $event = substr(preg_replace('/[^a-z0-9_]/i', '_', $event) ?: 'unknown', 0, 64);

        DB::table('commerce_events')->insert([
            'event' => $event,
            'payload' => json_encode($payload, JSON_UNESCAPED_UNICODE),
            'session_id' => $sessionId ? substr($sessionId, 0, 64) : null,
            'page' => $page ? substr($page, 0, 255) : null,
            'created_at' => now(),
        ]);
    }
}
