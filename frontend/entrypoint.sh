#!/bin/sh
echo "window.API_URL = '${API_URL:-http://localhost:4000}';" > /app/src/env.js
exec npm start