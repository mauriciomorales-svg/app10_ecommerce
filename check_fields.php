<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$p = \App\Models\Producto::where('nombre', 'ilike', '%cachantun%')->first();
$attrs = $p->getAttributes();
foreach ($attrs as $key => $val) {
    $type = gettype($val);
    $ok = json_encode($val);
    if ($ok === false) {
        echo "FAIL: $key ($type) = " . substr(print_r($val, true), 0, 50) . "\n";
    }
}
echo "Done checking fields\n";
