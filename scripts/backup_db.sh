#!/bin/bash
# source .env

# BACKUP_FILE="db_dump_$(date +%Y-%m-%d).sql"
# S3_PATH="s3://$S3_BUCKET_NAME/backups/$BACKUP_FILE"

# # Дамп БД и загрузка в S3
# # docker-compose exec -T db pg_dump -U $PGUSER -d $PGDATABASE > $BACKUP_FILE - это не рабочий код - дефис
# docker compose exec -T db pg_dump -U $PGUSER -d $PGDATABASE > $BACKUP_FILE
# aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE $S3_PATH
# aws --endpoint-url=$S3_ENDPOINT s3 cp $S3_PATH "s3://$S3_BUCKET_NAME/backups/db_dump_latest.sql"
# rm $BACKUP_FILE

# echo "Backup completed: $S3_PATH"

# source .env

# # Экспортируем переменные для AWS CLI
# export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY
# export AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY
# export AWS_DEFAULT_REGION=$S3_REGION

# BACKUP_FILE="db_dump_$(date +%Y-%m-%d).sql"
# S3_PATH="s3://$S3_BUCKET_NAME/backups/$BACKUP_FILE"

# # Дамп БД
# docker compose exec -T db pg_dump -U $PGUSER -d $PGDATABASE > $BACKUP_FILE

# # Загрузка в S3
# aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE $S3_PATH
# aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE "s3://$S3_BUCKET_NAME/backups/db_dump_latest.sql"

# # Удаляем временный файл
# rm $BACKUP_FILE
# echo "Backup completed: $S3_PATH"


source .env

# Настройка SSL
export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY
export AWS_CA_BUNDLE=/etc/ssl/certs/selectel-s3.pem

BACKUP_FILE="db_dump_$(date +%Y-%m-%d).sql"
S3_PATH="s3://$S3_BUCKET_NAME/backups/$BACKUP_FILE"

docker compose exec -T db pg_dump -U $PGUSER -d $PGDATABASE > $BACKUP_FILE

aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE $S3_PATH
aws --endpoint-url=$S3_ENDPOINT s3 cp $BACKUP_FILE "s3://$S3_BUCKET_NAME/backups/db_dump_latest.sql"

rm $BACKUP_FILE
echo "Backup completed: $S3_PATH"