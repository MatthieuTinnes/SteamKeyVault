#!/bin/sh
# Script to inject runtime environment variables into config.js

CONFIG_FILE="/usr/share/nginx/html/config.js"

# Recreate config.js with environment variables
echo "window.config = {" > "$CONFIG_FILE"
if [ -n "$VITE_API_BASE_URL" ]; then
  api_base="$VITE_API_BASE_URL"
else
  api_base="http://localhost:8000/api"
fi

if [ -n "$VITE_TURNSTILE_SITE_KEY" ]; then
  turnstile_key="$VITE_TURNSTILE_SITE_KEY"
else
  turnstile_key=""
fi

echo "  VITE_API_BASE_URL: \"${api_base}\"," >> "$CONFIG_FILE"
echo "  VITE_TURNSTILE_SITE_KEY: \"${turnstile_key}\"" >> "$CONFIG_FILE"
echo "};" >> "$CONFIG_FILE"

echo "Generated config.js at $CONFIG_FILE"
cat "$CONFIG_FILE"

# Start nginx
exec nginx -g 'daemon off;'
