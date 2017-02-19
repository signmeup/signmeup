#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Usage: ./mongo-restore.sh /backup/<backup-name>/signmeup'
    exit 1
fi

echo "Making a backup first..."
docker exec signmeup_backup_1 /backup.sh

echo "Dropping current database and restoring from $1..."
docker exec signmeup_backup_1 /restore.sh "--drop $1"
