#!/usr/bin/env bash
# Read-only database backup. Run outside the public source repository.
set -euo pipefail
umask 077
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL securely in your shell; do not commit or paste it in chat.}"
backup_dir="${1:?Usage: backup-db.sh /absolute/private/backup-directory}"
[[ "$backup_dir" = /* ]] || { echo 'Use an absolute destination.' >&2; exit 1; }
command -v pg_dump >/dev/null || { echo 'Install PostgreSQL client tools matching the server major version.' >&2; exit 1; }
mkdir -p "$backup_dir"
backup_file="$backup_dir/database-$(date -u +%Y%m%dT%H%M%SZ).dump"
[[ ! -e "$backup_file" ]] || { echo 'Destination already exists.' >&2; exit 1; }
pg_dump --dbname="$SUPABASE_DB_URL" --format=custom --no-owner --no-acl --file="$backup_file"
pg_restore --list "$backup_file" > "$backup_file.contents.txt"
sha256sum "$backup_file" > "$backup_file.sha256"
echo "Backup created: $backup_file"
# Storage object rows are included, but the file bytes in Supabase Storage are not a PostgreSQL table.
# Download those objects separately through the authenticated Storage API before calling this a full platform backup.
