.PHONY: prod prod-all prod-run prod-run-all

## Dev

# Simply use `docker-compose up` to run all 3 services.
# Use other standard docker-compose commands to interact with the containers.
# 
# Automatically combines docker-compose.yml with docker-compose.override.yml.


## Bundle

# Bundle is a middle-ground. It bundles up the app into a node.js app,
# but has settings configured for a local setup. Use this to make sure your
# app works fine in bundled form too. Then proceed to deploy on prod.

# Builds and runs the app with bundle settings.
# Does not affect other running services. Use when you've changed just the app.
bundle:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.bundle.yml build app; \
	docker-compose -f docker-compose.yml -f docker-compose.bundle.yml up --no-deps -d app

# Builds and runs all services with bundle settings.
# Use when you've updated the nginx or mongo configuration too.
bundle-all:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.bundle.yml build; \
	docker-compose -f docker-compose.yml -f docker-compose.bundle.yml up -d


## Production

# Builds and runs the app with prod settings.
# Does not affect other running services. Use when you've changed just the app.
prod:
	git pull; \
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build app; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d app

# Builds and runs all services with prod settings.
# Use when you've updated the nginx or mongo configuration too.
prod-all:
	git pull; \
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Runs the built image with prod settings.
# Use if you manually stopped the app container, but haven't changed anything.
prod-run:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d app

# Runs all built services with prod settings.
# Use if you manually stopped the containers, but haven't changed anything.
prod-run-all:
	export METEOR_SETTINGS='$(shell cat ./app/settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
