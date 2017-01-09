#!/bin/bash

git checkout production && \
git fetch --tags && \

export VERSION="$(git describe --tags)" && \
echo "Deploying SignMeUp $VERSION" && \
git checkout $VERSION && \

docker-compose up --build
