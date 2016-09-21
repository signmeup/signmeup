.PHONY: prod prod-all prod-run prod-run-all

## Dev

# Simply use `docker-compose up` to run all 3 services.
# Use other standard docker-compose commands to interact with the containers.
#
# Automatically combines docker-compose.yml with docker-compose.override.yml.


## Production

# Builds and runs the app with prod settings.
# Does not affect other running services. Use when you've changed just the app.
prod:
	git fetch --tags && \
	git checkout production && \
	export VERSION='$(shell git describe --tags)' && \
	git checkout $$VERSION && \
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)' && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build app && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d app

# Builds and runs all services with prod settings.
# Use when you've updated the nginx or mongo configuration too.
prod-all:
	git fetch --tags && \
	git checkout production && \
	export VERSION='$(shell git describe --tags)' && \
	git checkout $$VERSION && \
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)' && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Runs the built image with prod settings.
# Use if you manually stopped the app container, but haven't changed anything.
prod-run:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)' && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d app

# Runs all built services with prod settings.
# Use if you manually stopped the containers, but haven't changed anything.
prod-run-all:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)' && \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
