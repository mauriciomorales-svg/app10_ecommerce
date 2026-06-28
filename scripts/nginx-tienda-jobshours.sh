#!/usr/bin/env bash
# Nginx tienda JobsHours — SOLO tienda.jobshours.com
set -euo pipefail

SITE="/etc/nginx/sites-available/tienda-jobshours"
ENABLED="/etc/nginx/sites-enabled/00-tienda-jobshours"
CERT="/etc/letsencrypt/live/tienda.jobshours.com"

if [[ ! -f "$CERT/fullchain.pem" ]]; then
  certbot certonly --nginx -d tienda.jobshours.com --non-interactive --agree-tos -m comercial@jobshours.com || true
fi

cat > "$SITE" << 'NGINX'
# HTTP: proxy directo (Cloudflare Flexible conecta por :80)
server {
    listen 80;
    listen [::]:80;
    server_name tienda.jobshours.com;

    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /fotos_productos/ {
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }
}

# HTTPS: origen con certificado (Cloudflare Full)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tienda.jobshours.com;

    ssl_certificate /etc/letsencrypt/live/tienda.jobshours.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tienda.jobshours.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /fotos_productos/ {
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/tienda-jobshours
ln -sf "$SITE" "$ENABLED"
nginx -t
systemctl reload nginx

echo "=== tienda.jobshours.com ==="
curl -sI -H 'Host: tienda.jobshours.com' http://127.0.0.1/ | grep -E 'HTTP|x-middleware|Location'
curl -sI -k --resolve tienda.jobshours.com:443:127.0.0.1 https://tienda.jobshours.com/ | grep -E 'HTTP|x-middleware'
curl -s -H 'Host: tienda.jobshours.com' http://127.0.0.1/ | grep -o '<title>[^<]*</title>'
