#!/bin/bash
source .env

BACKUP_FILE="db_dump_$(date +%Y-%m-%d).sql"
S3_PATH="s3://$S3_BUCKET_NAME/backups/$BACKUP_FILE"

# Дамп БД и загрузка в S3
docker-compose exec -T db pg_dump -U $PGUSER -d $PGDATABASE > $BACKUP_FILE
aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE $S3_PATH
aws --endpoint-url=$S3_ENDPOINT s3 cp $S3_PATH "s3://$S3_BUCKET_NAME/backups/db_dump_latest.sql"
rm $BACKUP_FILE

echo "Backup completed: $S3_PATH"