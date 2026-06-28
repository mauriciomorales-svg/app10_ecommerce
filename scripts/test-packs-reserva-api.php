<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$c = app(App\Http\Controllers\Api\HomeExperienceController::class);
$r = $c->index();
$d = json_decode($r->getContent(), true);

echo 'packs_reserva secciones: ' . count($d['packs_reserva']['secciones'] ?? []) . PHP_EOL;
foreach ($d['packs_reserva']['secciones'] ?? [] as $s) {
    $withId = count(array_filter($s['items'], fn ($i) => ! empty($i['idproducto'])));
    echo $s['titulo'] . ': ' . count($s['items']) . " items, con id: $withId\n";
}
