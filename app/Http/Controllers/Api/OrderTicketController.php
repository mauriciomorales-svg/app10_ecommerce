<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class OrderTicketController extends Controller
{
    public function show($idventa)
    {
        $venta = Venta::find($idventa);
        if (!$venta) {
            return response('Orden no encontrada', 404);
        }

        $detalles = DB::table('detalle_venta')->where('idventa', $idventa)->get();
        $observaciones = $venta->observaciones ?? '';

        // Extraer datos del cliente de observaciones
        $clienteInfo = str_replace('Pago online - ', '', $observaciones);

        $html = $this->renderTicket($venta, $detalles, $clienteInfo);
        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    private function renderTicket($venta, $detalles, $clienteInfo)
    {
        $fecha = $venta->fecha ? date('d/m/Y H:i', strtotime($venta->fecha)) : '-';
        $estado = strtoupper($venta->estado ?? 'PENDIENTE');
        $total = number_format($venta->total, 0, ',', '.');

        $itemsHtml = '';
        $inventarioHtml = '';
        $itemNum = 0;

        foreach ($detalles as $detalle) {
            $itemNum++;
            $producto = Producto::find($detalle->idproducto);
            $nombre = $producto ? $producto->nombre : "Producto #{$detalle->idproducto}";
            $esPack = $producto && $producto->es_pack;
            $subtotal = number_format($detalle->subtotal ?? ($detalle->precio_unitario * $detalle->cantidad), 0, ',', '.');

            $bundleConfig = null;
            if (!empty($detalle->bundle_configuration)) {
                $bundleConfig = json_decode($detalle->bundle_configuration, true);
            }

            $itemsHtml .= "<div class='item'>";
            $itemsHtml .= "<div class='item-header'>ITEM {$itemNum}: " . strtoupper($nombre) . " x{$detalle->cantidad}</div>";
            $itemsHtml .= "<div class='item-price'>\${$subtotal}</div>";

            if ($esPack && $bundleConfig && !empty($bundleConfig['modifiers'])) {
                $itemsHtml .= "<div class='section-title'>CONFIGURACI&Oacute;N DEL PACK:</div>";
                foreach ($bundleConfig['modifiers'] as $mod) {
                    $modPrice = isset($mod['price']) && $mod['price'] > 0 ? ' (+$' . number_format($mod['price'], 0, ',', '.') . ')' : '';
                    $itemsHtml .= "<div class='modifier'>[X] {$mod['name']}{$modPrice}</div>";

                    // Agregar al inventario
                    $inventarioHtml .= "<div class='inv-item'>- {$detalle->cantidad}x {$mod['name']}</div>";
                }
            } else {
                // Producto individual o pack sin bundle config
                $inventarioHtml .= "<div class='inv-item'>- {$detalle->cantidad}x {$nombre}</div>";
            }

            if ($bundleConfig && !empty($bundleConfig['customization'])) {
                $itemsHtml .= "<div class='section-title'>PERSONALIZACI&Oacute;N:</div>";
                foreach ($bundleConfig['customization'] as $key => $value) {
                    if (empty($value)) continue;
                    $label = $this->fieldLabel($key);
                    $itemsHtml .= "<div class='custom-field'>{$label}: \"{$value}\"</div>";
                }
            }

            $itemsHtml .= "</div>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Orden #{$venta->idventa} - DondeMorales</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 20px; }
  .ticket {
    max-width: 400px; margin: 0 auto; background: white;
    border: 2px dashed #333; padding: 24px; border-radius: 8px;
  }
  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 12px; }
  .header h1 { font-size: 20px; letter-spacing: 2px; }
  .header .orden { font-size: 24px; font-weight: bold; margin: 8px 0; }
  .header .estado {
    display: inline-block; padding: 4px 12px; border-radius: 4px;
    font-weight: bold; font-size: 14px;
  }
  .estado-pagado { background: #d4edda; color: #155724; }
  .estado-pendiente { background: #fff3cd; color: #856404; }
  .estado-rechazado { background: #f8d7da; color: #721c24; }
  .info { margin: 12px 0; font-size: 13px; line-height: 1.6; }
  .info strong { display: inline-block; min-width: 80px; }
  .separator { border-top: 1px dashed #999; margin: 12px 0; }
  .item { margin: 12px 0; padding: 8px; background: #f9f9f9; border-left: 3px solid #d81b60; }
  .item-header { font-weight: bold; font-size: 14px; }
  .item-price { font-size: 13px; color: #d81b60; font-weight: bold; }
  .section-title { font-size: 12px; font-weight: bold; margin-top: 8px; color: #555; text-decoration: underline; }
  .modifier { font-size: 12px; margin-left: 8px; line-height: 1.5; }
  .custom-field { font-size: 12px; margin-left: 8px; line-height: 1.5; font-style: italic; }
  .inventory { margin: 12px 0; padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; }
  .inventory h3 { font-size: 13px; margin-bottom: 6px; }
  .inv-item { font-size: 12px; line-height: 1.6; }
  .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 12px; }
  .total span { color: #d81b60; }
  .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #999; }
  .print-btn {
    display: block; width: 100%; margin: 16px auto 0; padding: 12px;
    background: #d81b60; color: white; border: none; border-radius: 8px;
    font-size: 16px; font-weight: bold; cursor: pointer;
  }
  .print-btn:hover { background: #ad1457; }
  @media print {
    body { padding: 0; background: white; }
    .ticket { border: none; max-width: 100%; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <h1>DONDE MORALES</h1>
    <div class="orden">ORDEN #{$venta->idventa}</div>
    <span class="estado estado-{$this->estadoClass($venta->estado)}">{$estado}</span>
  </div>

  <div class="info">
    <div><strong>CLIENTE:</strong> {$clienteInfo}</div>
    <div><strong>FECHA:</strong> {$fecha}</div>
    <div><strong>PAGO:</strong> {$venta->medio_pago}</div>
  </div>

  <div class="separator"></div>

  {$itemsHtml}

  <div class="separator"></div>

  <div class="inventory">
    <h3>INVENTARIO A SACAR DE ESTANTER&Iacute;A:</h3>
    {$inventarioHtml}
  </div>

  <div class="total">TOTAL: <span>\${$total}</span></div>

  <div class="footer">
    Santiago Watt 205, Renaico - DondeMorales.cl<br>
    Generado: {$fecha}
  </div>
</div>

<button class="print-btn" onclick="window.print()">Imprimir Comanda</button>
</body>
</html>
HTML;
    }

    private function estadoClass($estado)
    {
        return match (strtolower($estado ?? '')) {
            'pagado' => 'pagado',
            'rechazado' => 'rechazado',
            default => 'pendiente',
        };
    }

    private function fieldLabel($key)
    {
        return match ($key) {
            'label_name' => 'ETIQUETA',
            'card_message' => 'MENSAJE TARJETA',
            'theme' => 'TEM&Aacute;TICA',
            'photo_url' => 'FOTO',
            default => strtoupper($key),
        };
    }
}
