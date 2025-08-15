#!/bin/bash
source .env

BACKUP_FILE=${1:-"db_dump_latest.sql"}
S3_PATH="s3://$S3_BUCKET_NAME/backups/$BACKUP_FILE"

# Восстановление
aws --endpoint-url=$S3_ENDPOINT s3 cp $S3_PATH - | docker-compose exec -T db psql -U $PGUSER -d $PGDATABASE

echo "Restored from: $S3_PATH"