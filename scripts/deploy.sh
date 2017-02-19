#!/bin/bash

if [[ $1 == "production" ]]; then
    echo "Deploying production..."

    git checkout production
    git fetch --all
    git reset --hard origin/production

    export VERSION="$(git describe --tags)"
    echo "Deploying SignMeUp $VERSION..."
    git checkout $VERSION

    docker-compose up -d --build
elif [[ $1 == "local" ]]; then
    echo "Deploying locally..."

    docker-compose up -d --build
else
    echo "Usage: ./deploy.sh <production/local>"
fi
