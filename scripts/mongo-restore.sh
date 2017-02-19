#!/bin/bash

GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

if [[ $# -eq 0 ]] ; then
    echo "Usage: mongo-restore.sh /backup/<backup-name>/signmeup\n"
    exit 1
fi

printf "${GREEN}Making a backup first...${NC}\n"
docker exec signmeup_backup_1 /backup.sh

printf "${RED}Dropping current database and restoring from $1...${NC}\n"
docker exec signmeup_backup_1 /restore.sh "--drop $1"
