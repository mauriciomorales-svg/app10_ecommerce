# DondeMorales.cl — Plan marketing, modelo de ventas y análisis integral

**Negocio:** Donde Morales Renaico  
**Dominio:** https://dondemorales.cl  
**Proyecto técnico:** `app10_ecommerce` (+ `inventario-api` compartido)  
**Última revisión:** 2026-06-03  

Este documento reúne: (1) el **plan de marketing Facebook → web**, (2) el **modelo de ventas** de dondemorales.cl, (3) **auditoría** del sitio y del código, y (4) **errores y fricciones de flujo** detectados.

---

## 1. Resumen ejecutivo

DondeMorales opera un **negocio mixto** (minimarket + Toppi's + regalos) con tienda física en Watt 205 y e-commerce en dondemorales.cl. Tiene ~4,7K seguidores en Facebook y bases técnicas sólidas (catálogo +1.900 SKU, checkout Flow/MP, cupones, landings `/helados`, `/regalos`, `/salada`).

**Objetivo del plan:** convertir la comunidad de Facebook en tráfico cualificado y **+20% ventas online en 3 meses**.

**Hallazgo central:** la tienda **puede vender**, pero el circuito Facebook → medición → conversión tiene huecos (Pixel apagado, sin UTM, notificaciones email/WhatsApp postergadas). Además hay **fricciones de UX** en checkout, envío y mensajes post-pago que pueden hacer perder ventas aunque el tráfico desde Facebook aumente.

---

# Parte A — Plan de marketing digital (Facebook → dondemorales.cl)

## Introducción

Este plan está diseñado para **Donde Morales Renaico**, negocio mixto con sólida presencia en Facebook (~4,7K seguidores) y plataforma e-commerce en dondemorales.cl. El objetivo es **convertir la lealtad y el alcance de la comunidad de Facebook en tráfico cualificado y ventas directas en el sitio web**, aprovechando fortalezas de ambos canales en el contexto local de Renaico.

## Objetivo general

Aumentar el tráfico desde el perfil de Facebook hacia dondemorales.cl, incrementando las **ventas online** de productos de minimarket, comida salada y regalos personalizados en un **20% durante los próximos tres meses**.

## Audiencia objetivo

Residentes de **Renaico** y alrededores (Angol, Los Ángeles) que ya siguen el perfil de Facebook. Clientes que valoran comercio local, comodidad de compra online y calidad de productos Donde Morales.

## Estrategias clave y tácticas

### 1. Optimización del perfil — **modalidad Creador digital** (vigente)

Perfil confirmado: **Donde Morales Renaico** · categoría **Creador(a) digital** · ~4,7K seguidores · botones **Panel** + **Editar**.

En esta modalidad **no se asume** el botón clásico «Comprar ahora» de una Página de negocio. La conversión se hace así:

| ID | Táctica (creador) | Detalle |
|----|-------------------|---------|
| 1.1 | **Sitio web en Intro** | Campo **Sitio web** → `dondemorales.cl` con UTM (ver guía) |
| 1.2 | **Enlace destacado** | Sección **Enlaces** → «Tienda online» → `bio.dondemorales.cl` o `/toppis` |
| 1.3 | **Publicación fijada** | Post permanente con link + cupón **MORALESWEB10** |
| 1.4 | **WhatsApp secundario** | Consultas; la compra se empuja a la web en texto y creativos |
| 1.5 | **Portada + bio** | Foto de portada (hoy vacía) + horario alineado con tienda |

**Guía paso a paso:** `docs/GUIA-FACEBOOK-CREADOR-DIGITAL-DONDEMORALES.md`

**Estado web:** bio.dondemorales.cl, `/toppis`, UTM en pedidos y banner oferta — **listo**. Falta configurar links **en el perfil Meta** (acción manual del dueño).

### 2. Contenido orientado a la venta online

| ID | Táctica | Detalle |
|----|---------|---------|
| 2.1 | **Producto / combo exclusivo web** | Publicación semanal con producto o combo **solo en dondemorales.cl** |
| 2.2 | **Contenido interactivo** | Encuestas/Reels con sticker enlace a sección web (ej. Toppi's → `/helados`) |
| 2.3 | **Detrás de cámaras** | Preparación de pedidos online, empaquetado de regalos, selección minimarket |
| 2.4 | **Testimonios** | Capturas de reseñas de compradores web |

**Enlaces recomendados:** `/helados`, `/regalos`, `/salada`, `/producto/{id}` (no solo home).

### 3. Promociones y ofertas exclusivas online

| ID | Táctica | Detalle |
|----|---------|---------|
| 3.1 | **Cupón bienvenida** | Ej. `MORALESWEB10` (10% 1ª compra), promocionado solo en Facebook |
| 3.2 | **Ofertas flash** | Ofertas por tiempo limitado canjeables solo en la web |
| 3.3 | **Beneficios por volumen** | Reforzar empaques gratis desde $10.000 (bolsa) y $25.000 (caja regalo) |

**Estado técnico:** cupones implementados en Filament + checkout `?coupon=`. Empaques gratis ya en home.

### 4. Publicidad pagada (Meta Ads)

| ID | Táctica | Detalle |
|----|---------|---------|
| 4.1 | **Campañas tráfico / conversiones** | Segmentación Renaico + intereses (comida, minimarket, regalos) |
| 4.2 | **Retargeting** | Visitantes que no completaron compra; recordatorio o descuento |

**Bloqueo actual:** Meta Pixel **no configurado** en producción → retargeting y conversiones limitadas.

### 5. Integración y experiencia del usuario

| ID | Táctica | Detalle |
|----|---------|---------|
| 5.1 | **Enlaces profundos** | Enlazar a producto/categoría, no solo home |
| 5.2 | **Monitoreo** | Facebook Panel Profesional + analytics web (UTM, Pixel, eventos propios) |

## Métricas de éxito (KPIs)

| KPI | Descripción |
|-----|-------------|
| Tráfico web desde Facebook | Clics en enlaces FB → dondemorales.cl |
| Tasa de conversión | % visitantes FB que compran |
| AOV | Ticket promedio pedidos atribuidos a FB |
| Ventas online totales | Ingresos vía dondemorales.cl |
| Engagement FB | Comentarios, compartidos, reacciones en posts que promocionan la web |

## Conclusión del plan

Donde Morales tiene base excelente para el éxito digital. La clave es **constancia en ejecución** y **adaptación según datos**. El e-commerce ya soporta la mayoría de tácticas; falta medición y pulir fricciones de checkout (ver Parte D).

## Referencias externas

1. [Estrategias de marketing en Facebook para 2026](https://www.invoicesimple.com/es/blog/facebook-marketing-strategy/)
2. [13 Best E-Commerce Marketing Strategies + Best Practices for 2026](https://www.drip.com/blog/e-commerce-marketing-strategies)

---

# Parte B — Modelo de ventas de dondemorales.cl

## B.1 Visión general

DondeMorales combina **retail físico** y **e-commerce unificado** sobre una sola base de datos (`dbisabel2`). El cliente puede comprar por cuatro “carriles” principales que convergen en el **mismo carrito y checkout**:

```text
                    ┌─────────────────────────────────────┐
                    │         dondemorales.cl             │
                    └─────────────────────────────────────┘
           ┌────────┬────────┬────────┬────────────────────┐
           ▼        ▼        ▼        ▼                    ▼
     Minimarket   Helados   Regalos   Salado (Toppi's)   JobsHours*
     (catálogo)   /helados  /regalos  /salada            (mismo código,
     1900+ SKU    combos    packs     bases + toppings    otro dominio)
           │        │        │        │                    │
           └────────┴────────┴────────┴────────────────────┘
                              │
                         Carrito único
                              │
                    Checkout (retiro / envío)
                              │
                    Flow.cl  /  Mercado Pago
                              │
                    Venta pagada → stock / comanda
                              │
              Retiro Watt 205  o  Envío (JobsHours)*

* JobsHours: integración para envíos y landings B2B; no es el foco del plan FB local.
```

## B.2 Canales de venta

| Canal | Rol | Conversión |
|-------|-----|------------|
| **Tienda física** | POS / atención presencial | Efectivo, tarjeta, Flow en mostrador |
| **Web dondemorales.cl** | Canal objetivo del plan FB | Flow + MP online |
| **bio.dondemorales.cl** | Hub redes → web | Link «Tienda Online» |
| **WhatsApp** | Consultas + bot IA (inventario-api) | Hoy **no** cierra venta automática igual que web |
| **Facebook / IG / TikTok** | Descubrimiento y confianza | Debe empujar a web (plan) |
| **Kiosk en tienda** | Catálogo táctil (inventario-api) | Complemento presencial |

## B.3 Tipos de producto y precio

### Minimarket (retail)

- Productos unitarios con precio fijo, categorías (snacks, bebidas, regalos ocasiones, etc.).
- Ficha `/producto/{id}`; búsqueda y filtros en home.
- Stock en BD (`stock`, `stock_actual`); disponibilidad en web depende de sync (ver errores).

### Experiencias Toppi's — Helados (`/helados`)

- Combos (yogurt desde $2.990, soft, artesanal, etc.).
- Configuración vía modal/pasos; puede incluir cupón en URL hacia checkout.
- Carrito con `bundle_configuration` JSON en `detalle_venta`.

### Experiencias — Regalos (`/regalos`)

- Packs **100% personalizables** (componentes + campos extra).
- Upsell de empaque premium en checkout (`PackagingSelector`).

### Experiencias — Salado (`/salada`)

- Bases (papas, wok, chorrillana, completo) + toppings cobrados.
- Misma lógica de packs/modificadores.

### Packs personalizables (motor “Experience”)

Productos con `es_pack=true`:

```text
Pack
 ├── bundle_options (grupos radio/checkbox, price_modifier)
 └── customization_fields (texto, select, etc.)
```

Flujo: `ProductBuilderModal` → pasos obligatorios/opcionales → resumen precio dinámico → carrito.

## B.4 Modelo de fulfillment (entrega)

| Modo | Código | Cliente ve | Backend |
|------|--------|--------------|---------|
| **Retiro en tienda** | `pickup` | Fecha retiro (próximos 7 días), dirección Watt 205 | Click & Collect clásico |
| **Envío a domicilio** | `delivery` | Dirección + cotización envío | Integración JobsHours para publicar solicitud de envío tras pago |
| **Servicio digital** | `digital_service` | Sin fecha retiro física | Fuerza MP; usado en contextos JobsHours |

Checkout recoge: nombre, email, teléfono (+569), fecha retiro (retiro), empaque, cupón, método de pago.

## B.5 Modelo de ingresos y margen

| Palanca | Mecanismo |
|---------|-----------|
| **Ticket base** | Suma productos + modificadores de pack |
| **Cross-sell** | `CartCrossSell`, productos sugeridos en carrito |
| **Umbrales empaque** | Bolsa reforzada gratis ≥ $10.000; caja regalo ≥ $25.000 |
| **Cupones** | Descuento % o monto; reglas 1ª compra, mínimo, vigencia (Filament) |
| **Envío** | Cargo adicional calculado (`/api/checkout/delivery-quote`) |
| **Toppi's extras** | Margen en toppings y bases saladas (estrategia rentabilidad vs. descuentos masivos) |

**Política promociones:** evitar cupones permanentes agresivos; campañas acotadas (`TOPPIS-ESTRATEGIA-DIGITAL-2026.md`).

## B.6 Flujo de venta web (paso a paso)

```text
1. Descubrimiento (FB, bio, búsqueda, recomendación)
2. Landing (home, /helados, /regalos, /salada, /producto/id)
3. Personalización (ProductBuilderModal si es pack)
4. Carrito (localStorage + context React)
5. /cart → revisión
6. /checkout
   - Umbrales empaque + pedido mínimo
   - Cupón (opcional, ?coupon= en URL)
   - Retiro vs envío
   - Preview totales (/api/checkout/preview)
7. Pago
   - POST /api/pagos/flow  → redirect Flow
   - POST /api/pagos/mp-online → redirect MP
8. Webhook / confirm → venta.estado = pagado → descuento stock
9. /pago/resultado → código retiro / timeline envío / seguimiento
10. Retiro en tienda o entrega por courier (JobsHours)
```

## B.7 Pagos

| Proveedor | Uso típico DondeMorales | Métodos |
|-----------|-------------------------|---------|
| **Flow.cl** | Minimarket, retiro, default | WebPay, débito, crédito |
| **Mercado Pago online** | Carrito con categoría restaurante/Toppi's si está configurado | MP checkout |

Estado en `/api/pagos/providers` define qué ve el cliente. Carrito “restaurant” puede **cambiar default a MP** automáticamente.

## B.8 Post-venta

| Elemento | Función |
|----------|---------|
| **Código / comprobante** | Retiro en Watt 205 |
| **`/seguimiento`** | URL firmada 30 días, polling estado |
| **Email confirmación** | Código listo; **email prod no activado** (Resend pendiente) |
| **WhatsApp automático** | Cloud API documentada; **token prod pendiente** |
| **Filament `/admin`** | Ventas, productos, cupones, fotos |

## B.9 Operación e inventario (soporte al modelo)

Apps Flutter (`gestion_inventario`, fotos, packs) + `inventario-api` mantienen catálogo, fotos por código de barras y kiosk. La web **lee** el mismo PostgreSQL; desfase stock/fotos entre apps y web es un riesgo operativo.

---

# Parte C — Auditoría dondemorales.cl (web y técnica)

## C.1 Home y landings

**Fortalezas:** hero Toppi's, bloques Helados/Regalos/Salado, empaques gratis, flujo 3 pasos, estado abierto/cerrado, confianza local.

**Brechas vs. plan:** sin banner “oferta semana”, sin UTM, sin `/toppis` dedicado.

## C.2 Stack y marketing implementado

| Función | Estado |
|---------|--------|
| Cupones Filament + API | ✅ |
| Deep link `?coupon=` | ✅ |
| Meta Pixel | ⚠️ Código sí; **prod sin ID** |
| `commerce_events` | ⚠️ Parcial (JobsHours page views) |
| UTM persistido | ❌ |
| GA4 / GTM | ❌ |
| sitemap / robots | ❌ |

Arquitectura: Nginx → Next :3001, Laravel :8002, inventario-api :8003.

## C.3 Cruce plan × proyecto

| Estrategia | ¿Listo? |
|------------|---------|
| 1 Perfil FB | Operativo en Meta (no código) |
| 2 Contenido | Landings OK; banner semanal pendiente |
| 3 Promos | Cupones OK; crear MORALESWEB10 |
| 4 Meta Ads | Requiere Pixel |
| 5 UX + medición | Enlaces profundos OK; analytics incompleto |

## C.4 KPIs — medición hoy

| KPI | Hoy |
|-----|-----|
| Ventas web totales | ✅ Filament / SQL |
| Engagement FB | ✅ Panel Meta |
| Clics FB → web | Parcial (Meta, sin UTM interno) |
| Conversión / AOV FB | ❌ Sin atribución |

---

# Parte D — Errores y fricciones de flujo

Clasificación: **🔴 Alto** (puede impedir venta o generar reclamo) · **🟠 Medio** (abandono o confusión) · **🟡 Bajo** (operativo / medición)

## D.1 Descubrimiento → carrito

| # | Severidad | Problema | Detalle / evidencia |
|---|-----------|----------|---------------------|
| D1 | 🟠 | **Post FB lleva a home genérica** | Usuario no encuentra el producto del anuncio; debe usar enlace a `/producto/id` o landing |
| D2 | 🟡 | **Sin UTM ni origen en pedido** | Imposible saber si la venta vino de FB orgánico o pago |
| D3 | 🟡 | **Pixel Meta apagado** | `NEXT_PUBLIC_META_PIXEL_ID` vacío en VPS; `InitiateCheckout`/`Purchase` no llegan a Meta |
| D4 | 🟠 | **WhatsApp vs web competidores** | Perfil FB con botón WhatsApp desvía compra web; bio tiene ambos sin prioridad clara |
| D5 | 🟡 | **Números WhatsApp inconsistentes en docs** | bio: `56975647756` vs informe negocio `56976647756` — verificar cuál es el oficial |

## D.2 Personalización de packs (Toppi's / regalos)

| # | Severidad | Problema | Detalle |
|---|-----------|----------|---------|
| D6 | 🔴 | **Pack incompleto puede bloquearse tarde** | Si faltan opciones obligatorias en `ProductBuilderModal`, error puede aparecer al agregar o en checkout |
| D7 | 🟠 | **Precio dinámico no obvio en FB** | Creativos con precio fijo; en web el total sube con toppings — expectativa rota |
| D8 | 🟡 | **Cupón en helados → checkout vacío** | Mensaje manda a `/helados` si carrito vacío con `?coupon=`; usuario FB con solo cupón se pierde |

## D.3 Carrito y checkout

| # | Severidad | Problema | Detalle |
|---|-----------|----------|---------|
| D9 | 🟠 | **Carrito solo en localStorage** | Cambio de dispositivo o navegador privado = carrito perdido |
| D10 | 🟠 | **Pedido mínimo** | `min_order_products` puede rechazar con `alert()` genérico |
| D11 | 🔴 | **Envío sin cotizar** | `fulfillmentType=delivery` sin `delivery.amount` → alert «Calcula el costo de envío»; abandono |
| D12 | 🟠 | **Doble método de pago confuso** | Flow vs MP; carrito restaurante fuerza MP si está disponible — usuario puede no entender por qué cambió |
| D13 | 🟠 | **Revalidación cupón al cambiar email/tel** | Cupón 1ª compra se invalida si datos cambian mid-checkout |
| D14 | 🟡 | **Errores de pago con `alert()`** | UX pobre en móvil; sin recuperación guiada |

## D.4 Pago y confirmación

| # | Severidad | Problema | Detalle |
|---|-----------|----------|---------|
| D15 | 🔴 | **Webhook Flow / MP fallido** | Pago exitoso en pasarela pero venta queda `pendiente` si webhook no llega |
| D16 | 🟠 | **Polling timeout en `/pago/resultado`** | Tras ~36 intentos: mensaje de demora; cliente ansioso desde FB |
| D17 | 🟠 | **Mensaje JobsHours en pedido envío DondeMorales** | Texto «Completa el envío en JobsHours (paso 2)» confunde si cliente solo conoce DondeMorales |
| D18 | 🟡 | **MP restaurante vs Flow minimarket** | Mezclar ítems Toppi's + minimarket en un carrito puede complicar método de pago óptimo |

## D.5 Post-venta y operación

| # | Severidad | Problema | Detalle |
|---|-----------|----------|---------|
| D19 | 🔴 | **Sin email confirmación en prod** | Cliente no recibe comprobante automático (`MAIL_*` / Resend pendiente) |
| D20 | 🟠 | **Sin WhatsApp automático post-compra** | Cloud API no configurada; depende de seguimiento manual |
| D21 | 🟠 | **Stock web desactualizado** | Algunos listados usan stock placeholder (99); riesgo vender sin stock real |
| D22 | 🟡 | **Seguimiento existe pero poco promovido** | `/seguimiento` útil; no visible en mensajes FB estándar |

## D.6 Impacto directo en el plan de marketing (+20%)

| Fricción | Efecto en KPI |
|----------|----------------|
| Sin Pixel/UTM | No se optimiza campaña FB; retargeting imposible |
| Envío mal cotizado | Abandono checkout mata conversión |
| Email/WhatsApp off | Menos repetición; más consultas manuales |
| Enlace home vs profundo | Menor conversión desde posts específicos |
| Confusión WhatsApp | FB genera chats, no ventas web |

## D.7 Diagrama de puntos de fuga

```text
Facebook (4.7K)
    │
    ├─► WhatsApp ─────────────► venta manual (no atribuida a web)     [D4]
    │
    └─► dondemorales.cl
            │
            ├─► Home (producto no encontrado) ──► abandono             [D1]
            ├─► Pack builder (opciones) ──► abandono                   [D6,D7]
            ├─► Carrito lost (otro device) ──► abandono                 [D9]
            ├─► Checkout envío sin quote ──► abandono                  [D11]
            ├─► Pago OK / webhook fail ──► reclamo                     [D15]
            └─► Resultado / sin email ──► incertidumbre                 [D16,D19]
```

---

# Parte E — Prioridades (marketing + flujo)

## E.1 P0 — Medición y conversión FB (dev + config)

1. Activar `NEXT_PUBLIC_META_PIXEL_ID` en producción.
2. Captura UTM + `trackPageView` DondeMorales + guardar origen en venta.
3. Crear cupón **MORALESWEB10** en Filament.
4. Cambiar CTA perfil FB a «Visitar sitio web».

## E.2 P1 — Reducir fuga checkout (dev)

1. UX envío: bloquear botón pagar hasta cotizar; copy claro Renaico/Angol.
2. Mensajes post-pago DondeMorales (sin jerga JobsHours para clientes retail).
3. Deep links documentados para cada tipo de post FB.

## E.3 P2 — Post-venta y confianza

1. Activar email Resend (confirmación + link seguimiento).
2. WhatsApp Cloud API — al menos confirmación de pedido pagado.
3. Banner «Oferta de la semana» + landing `/toppis`.

## E.4 P3 — Operación

1. Auditar stock web vs. inventario real.
2. Unificar número WhatsApp oficial en bio, web y documentación.
3. sitemap + GA4 opcional.

---

# Parte F — URLs de campaña Facebook

```text
https://dondemorales.cl/helados?utm_source=facebook&utm_medium=organic&utm_campaign=combo_semana
https://dondemorales.cl/regalos?utm_source=facebook&utm_medium=paid&utm_campaign=regalo_mes
https://dondemorales.cl/checkout?coupon=MORALESWEB10&utm_source=facebook&utm_medium=organic&utm_campaign=bienvenida
https://dondemorales.cl/producto/123?utm_source=facebook&utm_medium=organic&utm_campaign=producto_destacado
```

---

# Parte G — Referencias internas

| Documento | Ruta |
|-----------|------|
| Modelo de negocio detallado | `INFORME_MODELO_NEGOCIOS_DONDEMORALES.md` |
| Estrategia Toppi's | `inventario-api/docs/TOPPIS-ESTRATEGIA-DIGITAL-2026.md` |
| Pendientes ecommerce | `app10_ecommerce/docs/PENDIENTES.md` |
| Checkout | `frontend-ecommerce/src/app/checkout/page.tsx` |
| Cupones | `app/Services/ValeDescuentoService.php` |
| Pago resultado | `frontend-ecommerce/src/app/pago/resultado/page.tsx` |
| Meta Pixel | `frontend-ecommerce/src/app/components/MetaPixel.tsx` |

---

# Parte H — Conclusión

El **plan de marketing Facebook → dondemorales.cl** es coherente con el negocio y con la plataforma existente. El **modelo de ventas** es híbrido (minimarket + experiencias Toppi's + regalos, retiro/envío, Flow/MP), no un e-commerce simple de catálogo fijo.

Para lograr el **+20% en 3 meses**, además de contenido y ads en Facebook, hay que:

1. **Medir** (Pixel + UTM + origen en venta).
2. **Reducir fricciones** en envío, post-pago y enlaces profundos.
3. **Activar post-venta** (email/WhatsApp) para repetir compra.

La tienda no necesita reemplazarse; necesita **cerrar el circuito** entre la comunidad de Facebook y una compra web sin fricción ni dudas después del pago.
