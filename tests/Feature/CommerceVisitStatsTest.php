<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class CommerceVisitStatsTest extends TestCase
{
    public function test_stats_returns_503_when_analytics_key_not_configured(): void
    {
        Config::set('services.jobs_hours.analytics_key', '');

        $this->getJson('/api/commerce/visits/stats?days=7&site=jobshours')
            ->assertStatus(503)
            ->assertJsonPath('success', false);
    }

    public function test_stats_returns_401_without_key(): void
    {
        Config::set('services.jobs_hours.analytics_key', 'test-analytics-key');

        $this->getJson('/api/commerce/visits/stats?days=7&site=jobshours')
            ->assertStatus(401)
            ->assertJsonPath('message', 'Clave incorrecta.');
    }

    public function test_stats_returns_401_with_wrong_key(): void
    {
        Config::set('services.jobs_hours.analytics_key', 'test-analytics-key');

        $this->getJson('/api/commerce/visits/stats?days=7&site=jobshours', [
            'X-JH-Analytics-Key' => 'wrong',
        ])
            ->assertStatus(401);
    }

    public function test_stats_accepts_key_via_header(): void
    {
        Config::set('services.jobs_hours.analytics_key', 'test-analytics-key');

        $this->getJson('/api/commerce/visits/stats?days=7&site=jobshours', [
            'X-JH-Analytics-Key' => 'test-analytics-key',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('stats.available', false);
    }

    public function test_stats_accepts_key_via_query_string(): void
    {
        Config::set('services.jobs_hours.analytics_key', 'test-analytics-key');

        $this->getJson('/api/commerce/visits/stats?days=7&site=jobshours&key=test-analytics-key')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
