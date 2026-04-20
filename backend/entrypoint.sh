#!/bin/sh
set -e

echo "Running Liquibase migrations..."
liquibase \
  --search-path=/app/liquibase/changelog,/app/liquibase/changelog/changes,/app/liquibase/changelog/changes/sql \
  --url="jdbc:postgresql://${DB_HOST:-postgres}:${DB_PORT:-5432}/${DB_NAME:-memorygame}" \
  --username="${DB_USER:-memorygame}" \
  --password="${DB_PASSWORD:-memorygame}" \
  --changelog-file=db.changelog-master.yaml \
  update

echo "Liquibase migrations completed. Starting backend..."
exec npm start

