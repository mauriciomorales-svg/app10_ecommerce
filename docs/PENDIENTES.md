# Pendientes — DondeMorales / JobsHours

Lista de trabajo **no urgente** o **postergado a propósito**.  
Última revisión: 2026-05-19.

---

## Notificaciones al comprador

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Postergado | **WhatsApp automático (Cloud API)** | Sin `WHATSAPP_ACCESS_TOKEN` ni `WHATSAPP_PHONE_NUMBER_ID` en producción. Hoy solo enlaces `wa.me` en checkout y `/pago/resultado`. |
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

## Producto / integración (futuro)

| Estado | Tarea | Notas |
|--------|--------|--------|
| ⏸️ Postergado | **Bot WhatsApp conversacional** (`app8_bot_whatsapp` u otro) | No es lo mismo que Cloud API. DondeMorales hoy no está enlazado a un bot que responda chats. |
| ✅ Hecho | **Seguimiento público** `/seguimiento` | Enlace firmado 30 días; poll cada 30 s; en pago/resultado y mensajes. |
| 💡 Idea | WhatsApp solo recordatorio pago envío | Priorizar un solo mensaje automático antes que todos los hitos. |

---

## Hecho recientemente (referencia)

- Timeline 5 pasos en `/pago/resultado` + página `/seguimiento` (link firmado)
- Sync estado JobsHours + migración `jobshours_request_status` / `jobshours_payment_status`
- Pushes JobsHours (asignado, en camino, entregado) — API `ce16ab7`
- Deploy producción vía `deploy-from-windows.ps1` (2026-05-19)
- Cron `schedule:run` activo en `app10_ecommerce` y `jobshour-api`

---

## Cómo usar este archivo

1. Mover ítems a **Hecho** cuando se completen (con fecha).
2. No borrar postergados: marcar ⏸️ y motivo.
3. Secretos **nunca** en este archivo; solo nombres de variables.
