<?php

namespace Tests\Unit;

use App\Support\MarketingAttribution;
use Illuminate\Http\Request;
use Tests\TestCase;

class MarketingAttributionTest extends TestCase
{
    public function test_from_request_sanitizes_fields(): void
    {
        $request = Request::create('/', 'POST', [
            'marketing' => [
                'utm_source' => 'facebook',
                'utm_medium' => 'paid',
                'utm_campaign' => 'combo_semana',
                'referrer' => 'https://facebook.com/',
                'landing_path' => '/helados',
            ],
        ]);

        $attr = MarketingAttribution::fromRequest($request);

        $this->assertSame('facebook', $attr['utm_source']);
        $this->assertSame('paid', $attr['utm_medium']);
        $this->assertSame('combo_semana', $attr['utm_campaign']);
        $this->assertSame('/helados', $attr['landing_path']);
    }

    public function test_append_to_observaciones(): void
    {
        $text = MarketingAttribution::appendToObservaciones('Web | Cliente: Ana', [
            'utm_source' => 'facebook',
            'utm_campaign' => 'bienvenida',
        ]);

        $this->assertStringContainsString('Atribución:', $text);
        $this->assertStringContainsString('utm_source=facebook', $text);
    }
}
