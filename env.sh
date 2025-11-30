#!/bin/sh
# Script to inject runtime environment variables into the built JavaScript

# Replace placeholder in built files with actual environment variable
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" {} +

echo "Environment variables injected:"
echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}"

# Start nginx
exec nginx -g 'daemon off;'
