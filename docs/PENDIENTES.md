# Pendientes — DondeMorales / JobsHours

Lista de trabajo **no urgente** o **postergado a propósito**.  
Última revisión: 2026-06-23.

---

## Modo cotización vs modo carrito (B2B)

**Documento maestro:** [`inventario-api/docs/PENDIENTE-MODO-COTIZACION-B2B-2026.md`](../../inventario-api/docs/PENDIENTE-MODO-COTIZACION-B2B-2026.md)

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Diseño | `checkout.mode`: `cart` \| `quote` en `commerce_stores.settings` | DondeMorales sigue en `cart`. |
| ⏸️ Pendiente | Frontend: carrito cotización sin total ni checkout MP | Reutilizar `CartContext`; botón distinto. |
| ⏸️ Pendiente | Ocultar precios en API/UI (`catalog.pricing_mode`) | `AddToCartButton`, listados, ficha producto. |
| ⏸️ Pendiente | Página `/cotizacion/{token}` | Similar a JobsHours `tienda/cotizacion/[token]`. |
| ⏸️ Pendiente | OK Isabel antes de migraciones | No mezclar con deploy packs DM. |

---

## Marketing Facebook → dondemorales.cl

Análisis completo: **`docs/ANALISIS-PROFUNDO-MARKETING-FACEBOOK-DONDEMORALES.md`**  
**Operativa creador digital:** **`docs/GUIA-FACEBOOK-CREADOR-DIGITAL-DONDEMORALES.md`**

| Estado | Tarea | Notas |
|--------|--------|--------|
| ✅ Hecho | **Análisis profundo web + brechas vs. plan** | Jun 2026 |
| ✅ Hecho | **UTM + page_view DondeMorales + atribución en venta** | `marketingAttribution.ts`, columnas `venta.utm_*`, checkout envía `marketing` |
| ✅ Hecho | **Cupón MORALESWEB10** | `commerce:seed-coupons` en prod |
| ✅ Hecho | **Banner oferta semana + `/toppis`** | `HomeWeeklyOfferBanner`, `config/marketing.php` |
| ✅ Hecho | **Checkout envío + post-pago DondeMorales** | UX envío, mensajes sin jerga JobsHours |
| ✅ Hecho | **Presentación FB (100 chars)** | Bio: `dondemorales.cl · Toppi's · regalos · MORALESWEB10 · Retiro Watt 205` |
| ✅ Hecho | **bio.dondemorales.cl** | WhatsApp **56975647756** + link tienda con UTM |
| ⏸️ Manual (creador) | **Enlaces en perfil Meta** | Sección **Enlaces** → Tienda online (`bio.dondemorales.cl` o `/toppis`) |
| ⏸️ Manual (creador) | **Post fijado** | Link + cupón MORALESWEB10 — plantilla en guía creador |
| ⏸️ Manual (creador) | **Foto de portada** | Pendiente en perfil |
| ⏸️ **Bloqueado Meta** | **WhatsApp en Información de contacto (perfil FB)** | No se pudo agregar por verificaciones Meta. Número oficial: **56975647756**. Mientras tanto: WA solo en **bio.dondemorales.cl** y texto «WA consultas» en bio. Reintentar cuando Meta apruebe / desbloquee. |
| ⏸️ Pendiente | **Meta Pixel en prod** | Configurar `META_PIXEL_ID` + `NEXT_PUBLIC_META_PIXEL_ID` en VPS (código listo) |

**Monetización Meta / Mauricio Morales Urra:** ver **`docs/ANALISIS-MONETIZACION-FACEBOOK-MAURICIO-MORALES.md`** (solicitud enviada jun 2026).

---

## Notificaciones al comprador

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Postergado | **WhatsApp automático (Cloud API)** | Sin `WHATSAPP_ACCESS_TOKEN` ni `WHATSAPP_PHONE_NUMBER_ID` en producción (negocio Meta **sí** verificado). Guía: `docs/WHATSAPP-CLOUD-API.md`. Comando: `php artisan commerce:whatsapp-check`. |
| ⏸️ Pendiente | **Email en producción** | Código listo (`CommerceMail`, confirmación al pagar, hitos). Falta en VPS: `MAIL_MAILER=resend` + `RESEND_API_KEY` (o SMTP). |
| ⏸️ Pendiente | **Email alerta tienda** | `DELIVERY_ALERT_EMAIL` vacío en `.env` del servidor. |

Verificación en servidor:

```bash
php /var/www/app10_ecommerce/scripts/check-notify-env.php
```

---

## Seguridad y claves

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Pendiente | **Rotar claves y tokens privados** | Revisar y renovar periódicamente (no dejar los mismos años). |
| ⏸️ Pendiente | | `JOBSHOURS_STORE_DEMAND_TOKEN` (integración tienda → API) |
| ⏸️ Pendiente | | Mercado Pago / Flow (secret keys, webhooks) |
| ⏸️ Pendiente | | `RESEND_API_KEY` (cuando se active correo) |
| ⏸️ Pendiente | | `WHATSAPP_ACCESS_TOKEN` (cuando se active Cloud API) |
| ⏸️ Pendiente | | Claves SSH del VPS (`jobshours-droplet`, etc.) |
| ⏸️ Pendiente | | `.env` de producción: confirmar que no está en git y que permisos son restrictivos (`chmod 600`) |

Tras rotar: `php artisan config:clear` y `pm2 reload dondemorales-api`.

---

## Infra y deploy

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Pendiente | **Git remoto en VPS DondeMorales** | `/var/www/app10_ecommerce` no tiene `origin` configurado. Deploy actual: `scripts/deploy-from-windows.ps1` (tarball). Opcional: clonar desde GitHub + `deploy-on-server.sh` solo con `git pull`. |
| ⏸️ Pendiente | **Host `digitalocean` (167.99.105.4)** | SSH en timeout desde red local; DondeMorales en producción está en `jobshours-droplet`. Documentar o retirar host obsoleto en `~/.ssh/config`. |
| ⏸️ Pendiente | **Nginx — nombres de servidor duplicados** | Warnings en deploy JobsHours (`jobshours.com` conflicting). Revisar `sites-enabled` y dejar un solo `server_name` por dominio. |
| ⏸️ Pendiente | **Actualizar Next.js** | Build avisa vulnerabilidad en `14.2.0`; planificar upgrade cuando haya ventana de prueba. |

---

## Módulo minimarket · Hogar familiar + delivery Jobshours

Documento maestro: **`inventario-api/docs/PENDIENTE-MODULO-MINIMARKET-FAMILIAR-2026.md`**

Estrategia acordada (jun 2026): packs familiares (once, receta, asado) — **no regalo** — selladora al vacío, compra puente cuando falte stock, delivery vía **demanda publicada en Jobshours** (al inicio Isabel repartidor; después red abierta). Clientes reales y simulaciones según fase.

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Pendiente | **`JOBSHOURS_STORE_DEMAND_ENABLED=true` en prod** | Sin esto no se publica mandado tras pago envío. Ver `scripts/check-notify-env.php`. |
| ⏸️ Pendiente | **Pedido real pack + delivery punta a punta** | Validar `jobshours_request_id`, timeline, aceptación en mapa JH. |
| ⏸️ Pendiente | **Cuarto módulo web** `/minimarket` o `/hogar` | Hero 4 columnas + packs `familiar_*`. |
| ⏸️ Pendiente | **Packs piloto en creador** | 1) Once familiar 4 · 2) Verduras semana · 3) 1 receta (mongoliana/cazuela). |
| ⏸️ Pendiente | **`builder_profile` familiar_*** | Separar de `regalo`; actualizar `web_compra_focus.php`. |
| ⏸️ Dogfooding | **Actores: cliente / tienda / repartidor / sistema** | Incógnito + `commerce:simulate-delivery-order`; hoja de fricción. |
| 💡 Referencia | Informe demanda FB Renaico/Angol | `Downloads/index.html` (100 productos jun 2026); cruce con inventario. |

Fases delivery:
1. Isabel acepta demandas en Jobshours.
2. Otro repartidor de confianza.
3. Bolsa abierta (TTL mandado + fallback retiro si nadie acepta).

---

## Producto / integración (futuro)

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Postergado | **Bot WhatsApp conversacional** (`app8_bot_whatsapp` u otro) | No es lo mismo que Cloud API. DondeMorales hoy no está enlazado a un bot que responda chats. |
| ✅ Hecho | **Seguimiento público** `/seguimiento` | Enlace firmado 30 días; poll cada 30 s; en pago/resultado y mensajes. |
| ✅ Diseño | **Store-demand API** (DM → JH) | `JobsHoursStoreDemandService`, doc `jobshour-api/docs/INTEGRACION-TIENDA-DEMANDA.md`. |
| 💡 Idea | WhatsApp solo recordatorio pago envío | Priorizar un solo mensaje automático antes que todos los hitos. |

---

## Ticket promedio / cupones (2026-05-22)

| Estado | Tarea | Notas |
|--------|--------|--------|
| ✅ Hecho | Reglas cupón (mínimo, 1ª compra, 1 uso/email) | `ValeDescuentoService` + migración columnas |
| ✅ Hecho | Cross-sell optimizado + checkout | Cache 60s, batch imágenes, barra dual umbrales |
| ✅ Hecho | Panel Filament **Cupones** | `/admin` → Cupones |
| ✅ Hecho | Seed/sync `producto_sugerencias` (~40 pares) | `commerce:sync-cart-suggestions` (auto desde catálogo + config) |

En VPS tras deploy:

```bash
cd /var/www/app10_ecommerce && php artisan migrate --force
php artisan commerce:seed-coupons --force
php artisan commerce:sync-cart-suggestions
```

---

## Hecho recientemente (referencia)

- Mejoras AOV: cupones, cross-sell contextual, umbrales API, analytics `commerce_events`
- Timeline 5 pasos en `/pago/resultado` + página `/seguimiento` (link firmado)
- Sync estado JobsHours + migración `jobshours_request_status` / `jobshours_payment_status`
- Pushes JobsHours (asignado, en camino, entregado) — API `ce16ab7`
- Deploy producción vía `deploy-from-windows.ps1` (2026-05-19)
- Cron `schedule:run` activo en `app10_ecommerce` y `jobshour-api`

---

## Pruebas simuladas

```bash
# Local o VPS (producción requiere --allow-production)
php artisan commerce:simulate-delivery-order --mock-status=accepted --allow-production

# Con mandado real en mapa JobsHours
php artisan commerce:simulate-delivery-order --publish --mock-status=open --allow-production

php scripts/smoke-mvp-tests.php
```

---

## Cómo usar este archivo

1. Mover ítems a **Hecho** cuando se completen (con fecha).
2. No borrar postergados: marcar ⏸️ y motivo.
3. Secretos **nunca** en este archivo; solo nombres de variables.
