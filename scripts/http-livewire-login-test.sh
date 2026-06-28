#!/bin/bash
set -e
BASE="https://www.dondemorales.cl"
JAR="/tmp/dm-login-cookies.txt"
rm -f "$JAR"

curl -s -c "$JAR" "$BASE/admin/login" -o /tmp/login.html

CSRF=$(grep -oP 'name="csrf-token" content="\K[^"]+' /tmp/login.html | head -1)
SNAPSHOT=$(grep -oP 'wire:snapshot="\K[^"]+' /tmp/login.html | head -1)
LW_ID=$(grep -oP 'livewire-[a-f0-9]+/update' /tmp/login.html | head -1)

echo "csrf=${CSRF:0:20}..."
echo "livewire=$LW_ID"

if [ -z "$SNAPSHOT" ] || [ -z "$LW_ID" ]; then
  echo "missing snapshot or livewire endpoint"
  exit 1
fi

PAYLOAD=$(python3 - <<PY
import json
snapshot = '''$SNAPSHOT'''
payload = {
    "_token": "$CSRF",
    "components": [{
        "snapshot": snapshot,
        "updates": {
            "data.email": "admin",
            "data.password": "admin"
        },
        "calls": [{"path": "", "method": "authenticate", "params": []}]
    }]
}
print(json.dumps(payload))
PY
)

HTTP=$(curl -s -b "$JAR" -c "$JAR" -o /tmp/login-response.json -w "%{http_code}" \
  -X POST "$BASE/$LW_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: $CSRF" \
  -H "X-Livewire: true" \
  -d "$PAYLOAD")

echo "post_status=$HTTP"
head -c 500 /tmp/login-response.json
echo

DASH=$(curl -s -b "$JAR" -o /dev/null -w "%{http_code}" "$BASE/admin")
echo "admin_after_login=$DASH"
