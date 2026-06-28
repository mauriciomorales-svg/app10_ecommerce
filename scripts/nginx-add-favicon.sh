#!/bin/bash
# Sirve favicon del admin Laravel (evita 404 de Next.js en la tienda).
CONF="/etc/nginx/sites-enabled/dondemorales"
MARKER="location = /favicon.svg"

if grep -q "$MARKER" "$CONF"; then
  echo "favicon locations already present"
  exit 0
fi

python3 << 'PY'
from pathlib import Path
path = Path("/etc/nginx/sites-enabled/dondemorales")
text = path.read_text()
block = """
    location = /favicon.ico {
        return 302 /favicon.svg;
    }

    location = /favicon.svg {
        alias /var/www/app10_ecommerce/public/favicon.svg;
        default_type image/svg+xml;
        access_log off;
    }

"""
needle = "    location / {"
if needle not in text:
    raise SystemExit("could not find location / block")
path.write_text(text.replace(needle, block + needle, 1))
print("nginx favicon block added")
PY

nginx -t && systemctl reload nginx
