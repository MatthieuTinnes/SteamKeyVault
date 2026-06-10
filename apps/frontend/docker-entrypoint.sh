#!/bin/sh
# Script to inject runtime environment variables into config.js

CONFIG_FILE="/usr/share/nginx/html/config.js"

# VITE_API_BASE_URL is required in Docker — must be set in the .env file
if [ -z "$VITE_API_BASE_URL" ]; then
  echo "ERROR: VITE_API_BASE_URL is not set. Please define it in your .env file." >&2
  exit 1
fi
api_base="$VITE_API_BASE_URL"

if [ -n "$VITE_TURNSTILE_SITE_KEY" ]; then
  turnstile_key="$VITE_TURNSTILE_SITE_KEY"
else
  turnstile_key=""
fi

# Recreate config.js with environment variables
echo "window.config = {" > "$CONFIG_FILE"

echo "  VITE_API_BASE_URL: \"${api_base}\"," >> "$CONFIG_FILE"
echo "  VITE_TURNSTILE_SITE_KEY: \"${turnstile_key}\"," >> "$CONFIG_FILE"
echo "  VITE_COMMIT_HASH: \"${COMMIT_HASH:-}\"," >> "$CONFIG_FILE"
echo "  VITE_DEPLOY_DATE: \"${DEPLOY_DATE:-}\"" >> "$CONFIG_FILE"
echo "};" >> "$CONFIG_FILE"

echo "Generated config.js at $CONFIG_FILE"
cat "$CONFIG_FILE"

# Start nginx
exec nginx -g 'daemon off;'
