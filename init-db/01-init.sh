#!/usr/bin/env bash

set -Eeuo pipefail

readonly REQUIRED_ENV_VARS=(
  POSTGRES_MAIN_USER
  POSTGRES_MAIN_PASSWORD
  POSTGRES_MAIN_DATABASE
  POSTGRES_STANDARD_USER
  POSTGRES_STANDARD_PASSWORD
  POSTGRES_SECURITY_USER
  POSTGRES_SECURITY_PASSWORD
)

check_env_vars_set() {
  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      echo "ERROR: Environment variable '$var' is not set." >&2
      return 1
    fi
  done
  return 0
}

main() {
  check_env_vars_set || exit 1

  echo "Initializing database..."

  PGPASSWORD="$POSTGRES_MAIN_PASSWORD" psql \
    --username "$POSTGRES_MAIN_USER" \
    --dbname "$POSTGRES_MAIN_DATABASE" \
    --set standard_user="$POSTGRES_STANDARD_USER" \
    --set standard_password="$POSTGRES_STANDARD_PASSWORD" \
    --set security_user="$POSTGRES_SECURITY_USER" \
    --set security_password="$POSTGRES_SECURITY_PASSWORD" <<'EOSQL'

-- =========================
-- 1. Create Schemas
-- =========================

CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS seo;
CREATE SCHEMA IF NOT EXISTS taxonomy;

-- =========================
-- 2. Create Roles (Idempotent)
-- =========================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'standard_user') THEN
    EXECUTE format(
      'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
      :'standard_user',
      :'standard_password'
    );
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'security_user') THEN
    EXECUTE format(
      'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
      :'security_user',
      :'security_password'
    );
  END IF;
END
$$;

-- =========================
-- 3. Permissions - Standard
-- =========================

GRANT USAGE ON SCHEMA content TO :"standard_user";
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA content
  TO :"standard_user";

ALTER DEFAULT PRIVILEGES IN SCHEMA content
  GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLES TO :"standard_user";

-- =========================
-- 4. Permissions - Security
-- =========================

GRANT USAGE ON SCHEMA security TO :"security_user";
GRANT ALL PRIVILEGES
  ON ALL TABLES IN SCHEMA security
  TO :"security_user";

GRANT USAGE ON SCHEMA content TO :"security_user";
GRANT SELECT
  ON ALL TABLES IN SCHEMA content
  TO :"security_user";

-- =========================
-- 5. Secure public schema
-- =========================

REVOKE ALL ON SCHEMA public FROM PUBLIC;

EOSQL

  echo "Database initialization complete."
}

main "$@"
