#!/usr/bin/env bash
# Deploy DondeMorales (app10_ecommerce) en el VPS — ejecutar EN el servidor.
# Uso: bash /var/www/app10_ecommerce/scripts/deploy-on-server.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/app10_ecommerce}"
FRONT_DIR="$APP_DIR/frontend-ecommerce"
LOG="/var/log/dondemorales-deploy.log"
BRANCH="${DEPLOY_BRANCH:-master}"

exec > >(tee -a "$LOG") 2>&1
echo "=== dondemorales deploy $(date -Is) branch=$BRANCH ==="

cd "$APP_DIR"

if [ "${SKIP_GIT_RESET:-0}" != "1" ] && [ -d .git ] && git remote get-url origin >/dev/null 2>&1; then
  git fetch origin "$BRANCH" 2>/dev/null || git fetch origin 2>/dev/null || true
  git reset --hard "origin/$BRANCH" 2>/dev/null || git reset --hard "origin/master" 2>/dev/null || true
else
  echo "Sin git remoto: usando archivos ya presentes en $APP_DIR"
fi

composer install --no-dev --optimize-autoloader --no-interaction

php artisan migrate --force
php artisan db:seed --class=AdminRolesSeeder --force
php scripts/seed-packs-reserva-mejoras.php --apply 2>/dev/null || true
php artisan commerce:ensure-packaging-products
php artisan jobshours:install-shop --force-bundles
php artisan commerce:store-set-host jobshours tienda.jobshours.com 2>/dev/null || true
php artisan commerce:sync-product-categories
php artisan commerce:sync-cart-suggestions
php artisan commerce:optimize-catalog
php artisan config:clear
php artisan route:clear
php artisan view:clear

cd "$FRONT_DIR"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"
export NEXT_TELEMETRY_DISABLED=1
rm -rf .next
npm run build

test -f .next/BUILD_ID
echo "Next BUILD_ID=$(cat .next/BUILD_ID)"

pm2 reload dondemorales-api --update-env 2>/dev/null || pm2 restart dondemorales-api
pm2 reload dondemorales-web --update-env 2>/dev/null || pm2 restart dondemorales-web
pm2 save 2>/dev/null || true

sleep 3
curl -s -o /dev/null -w "api_up=%{http_code}\n" --max-time 10 http://127.0.0.1:8002/api/productos/categorias || true
curl -s -o /dev/null -w "web_up=%{http_code}\n" --max-time 15 http://127.0.0.1:3001/ || true
curl -s -o /dev/null -w "checkout_opts=%{http_code}\n" --max-time 10 "http://127.0.0.1:8002/api/checkout/options?subtotal=5000" || true
curl -s -o /dev/null -w "jh_store=%{http_code}\n" --max-time 10 -H "Host: tienda.jobshours.com" http://127.0.0.1:8002/api/commerce/store || true

bash "$APP_DIR/scripts/nginx-tienda-jobshours.sh" 2>/dev/null || echo "nginx tienda-jobshours: omitido o error (revisar DNS/SSL aparte)"

cd "$APP_DIR" && php artisan jobshours:install-shop 2>/dev/null || true

cd "$APP_DIR" && php artisan commerce:retry-jobshours-publish 2>/dev/null || true

echo "=== deploy done $(date -Is) ==="
echo "Cron recomendado: * * * * * cd $APP_DIR && php artisan schedule:run >> /var/log/dondemorales-schedule.log 2>&1"
