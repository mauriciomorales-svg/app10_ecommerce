#!/bin/bash
set -e
NGINX=/etc/nginx/sites-enabled/dondemorales
python3 << 'PY'
from pathlib import Path
nginx = Path('/etc/nginx/sites-enabled/dondemorales')
text = nginx.read_text()
text = text.replace(
    'proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;',
    'proxy_set_header Host $host;'
)
# Fix any other corrupted host headers
text = text.replace('System.Management.Automation.Internal.Host.InternalHost', '$host')
nginx.write_text(text)
print('fixed_host_headers')
PY
nginx -t
systemctl reload nginx
curl -s -o /dev/null -w "css=%{http_code}\n" https://www.dondemorales.cl/css/filament/filament/app.css
curl -s https://www.dondemorales.cl/admin/login | grep -m1 'app.css'
