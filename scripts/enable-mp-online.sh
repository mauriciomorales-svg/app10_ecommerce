#!/usr/bin/env bash
set -euo pipefail
EC=/var/www/app10_ecommerce/.env
IA=/var/www/inventario-api/.env
MP_TOKEN=$(grep -E '^MERCADOPAGO_ACCESS_TOKEN=' "$IA" | cut -d= -f2- | tr -d '"')
MP_SECRET=$(grep -E '^MERCADOPAGO_WEBHOOK_SECRET=' "$IA" | cut -d= -f2- | tr -d '"' || true)
if [ -z "$MP_TOKEN" ]; then
  echo "No MP token in inventario-api"
  exit 1
fi
touch "$EC"
grep -q '^MERCADOPAGO_ACCESS_TOKEN=' "$EC" || echo "MERCADOPAGO_ACCESS_TOKEN=" >> "$EC"
grep -q '^PAYMENTS_MP_ONLINE_ENABLED=' "$EC" || echo 'PAYMENTS_MP_ONLINE_ENABLED=false' >> "$EC"
grep -q '^MERCADOPAGO_WEBHOOK_SECRET=' "$EC" || echo "MERCADOPAGO_WEBHOOK_SECRET=" >> "$EC"
python3 << PY
from pathlib import Path
ec = Path("$EC")
lines = ec.read_text().splitlines()
out = []
keys = {
    "MERCADOPAGO_ACCESS_TOKEN": "$MP_TOKEN",
    "PAYMENTS_MP_ONLINE_ENABLED": "true",
    "MERCADOPAGO_WEBHOOK_SECRET": "$MP_SECRET",
}
seen = set()
for line in lines:
    k = line.split("=", 1)[0] if "=" in line else line
    if k in keys:
        out.append(f"{k}={keys[k]}")
        seen.add(k)
    else:
        out.append(line)
for k, v in keys.items():
    if k not in seen:
        out.append(f"{k}={v}")
ec.write_text("\n".join(out) + "\n")
PY
cd /var/www/app10_ecommerce
php artisan config:clear
pm2 reload dondemorales-api --update-env
curl -s -H 'Host: tienda.jobshours.com' http://127.0.0.1:8002/api/pagos/providers
echo
