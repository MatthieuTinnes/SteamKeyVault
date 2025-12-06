#!/bin/sh
# Script to inject runtime environment variables into config.js

CONFIG_FILE="/usr/share/nginx/html/config.js"

# Recreate config.js with environment variables
echo "window.config = {" > "$CONFIG_FILE"
if [ -n "$VITE_API_BASE_URL" ]; then
  echo "  VITE_API_BASE_URL: \"${VITE_API_BASE_URL}\"" >> "$CONFIG_FILE"
else
  echo "  VITE_API_BASE_URL: \"http://localhost:8000/api\"" >> "$CONFIG_FILE"
fi
echo "};" >> "$CONFIG_FILE"

echo "Generated config.js at $CONFIG_FILE"
cat "$CONFIG_FILE"

# Start nginx
exec nginx -g 'daemon off;'
