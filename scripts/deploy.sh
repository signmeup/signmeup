#!/bin/bash

git checkout production
git fetch --all
git reset --hard origin/production

export VERSION="$(git describe --tags)"
echo "Deploying SignMeUp $VERSION..."
git checkout $VERSION

docker-compose up --build
