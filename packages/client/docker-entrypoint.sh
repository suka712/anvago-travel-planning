#!/bin/sh
set -e

# Default to port 80 if PORT not set
export PORT="${PORT:-80}"

# Substitute PORT in nginx config
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting nginx on port $PORT"

# Start nginx
exec nginx -g 'daemon off;'
