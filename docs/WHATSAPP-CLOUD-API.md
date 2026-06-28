# WhatsApp Cloud API — DondeMorales

**Negocio Meta verificado:** Donde morales · ID `2742392312761650`  
**Número de contacto tienda (wa.me):** +56 9 7664 7756 (`PACKAGING_WHATSAPP`)

La verificación del negocio **no activa sola** los mensajes automáticos. Hay que crear la app, vincular WhatsApp Business y copiar token + Phone Number ID al `.env` del servidor.

---

## Estado actual (revisado en VPS)

| Componente | Estado |
|------------|--------|
| Verificación negocio Meta | ✅ Verificado (panel Meta) |
| `WHATSAPP_ACCESS_TOKEN` en producción | ❌ No configurado |
| `WHATSAPP_PHONE_NUMBER_ID` en producción | ❌ No configurado |
| Mensajes automáticos al comprador | ❌ Código listo, API apagada |
| Enlaces `wa.me` (consultas / manual) | ✅ Sí |

Verificar en servidor:

```bash
cd /var/www/app10_ecommerce
php scripts/check-notify-env.php
php artisan commerce:whatsapp-check
```

---

## Qué hace la web cuando esté configurado

**No** reemplaza el checkout. Solo **notifica** al teléfono que el cliente dejó al comprar:

- Recordatorio pago envío JobsHours (`DeliveryFulfillmentNotifier`)
- Hitos del reparto (`DeliveryMilestoneNotifier`)
- Recordatorio pendiente (`RemindPendingDeliveryPaymentCommand`)

Si la API no está configurada, el sistema sigue funcionando; simplemente no envía esos WhatsApp automáticos.

---

## Pasos en Meta (después de negocio verificado)

### 1. App en Meta for Developers

1. [developers.facebook.com](https://developers.facebook.com) → **Mis apps** → **Crear app**.
2. Tipo: **Otro** → uso **Negocio**.
3. Nombre sugerido: `DondeMorales Tienda`.
4. En **Configuración de la app** → asociar el **Portfolio comercial** / negocio **Donde morales** (`2742392312761650`).

### 2. Producto WhatsApp

1. En el panel de la app → **Agregar producto** → **WhatsApp** → **Configurar**.
2. **API Setup** (Configuración de API):
   - Debe aparecer el **número de prueba** o tu número Business.
   - Si pide vincular cuenta de WhatsApp Business, usa la misma que +56 9 7664 7756 (o el número oficial de la tienda).
3. Anota:
   - **Phone number ID** (ID del número de teléfono) → `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID** (WABA) — solo referencia en Meta.
4. **Token de acceso**:
   - En desarrollo: token temporal (24 h) desde API Setup.
   - En producción: **token permanente** del **Usuario del sistema** con permisos `whatsapp_business_messaging` y `whatsapp_business_management`.

### 3. Permisos y modo en vivo

1. **App Review** → solicitar **Advanced Access** para `whatsapp_business_messaging` (con negocio verificado suele ser más rápido).
2. Cambiar app a **Modo activo** cuando Meta lo permita.
3. **Plantillas de mensaje** (Message templates): para avisos proactivos fuera de la ventana de 24 h puede hacer falta plantillas aprobadas. Los recordatorios de pedido suelen encajar en categoría **UTILITY**.

### 4. Comprobar en Meta que el número es el correcto

En **Meta Business Suite** → **Configuración** → **Cuentas de WhatsApp**:

- Debe listarse el número de la tienda.
- Estado **Conectado** / **Connected** al mismo portfolio **Donde morales**.

Si el número solo existe en el celular personal y no en WhatsApp Business, hay que migrar a **WhatsApp Business** o registrar el número en Cloud API (Meta guía “Register phone number”).

---

## Variables en el servidor

Editar `/var/www/app10_ecommerce/.env`:

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_API_VERSION=v21.0
```

Luego:

```bash
cd /var/www/app10_ecommerce
php artisan config:clear
php artisan commerce:whatsapp-check
pm2 reload dondemorales-api
```

**Seguridad:** no commitear el token. Rotar si se filtra.

---

## Prueba controlada

Con token configurado:

```bash
php artisan commerce:whatsapp-check --test=569XXXXXXXX
```

Envía un mensaje de prueba al número indicado (formato Chile 9 dígitos o 569...).

---

## Errores frecuentes

| Error | Causa |
|-------|--------|
| `whatsapp_not_configured` | Falta token o phone number ID en `.env` |
| API 190 / token inválido | Token expirado o sin permisos |
| API 131030 | Número destino no tiene WhatsApp o formato mal |
| Mensaje no llega en prod | App en modo desarrollo o plantilla no aprobada |

---

## Relación con la tienda web

- **Comprar:** siempre en dondemorales.cl (carrito + Flow/Mercado Pago).
- **WhatsApp API:** solo notificaciones transaccionales al cliente que ya compró.
- **Consultas:** enlace `wa.me` en pie de página (no es canal de pedido).
