.PHONY: dev dev-all dev-build dev-build-all prod prod-all prod-build prod-build-all

# Dev

# Runs the built image with dev settings.
dev:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose up --no-deps -d app

# Runs all built services.
dev-all:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose up -d

# Builds and runs just the app. 
# Does not affect other running services.
dev-build:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose build app; \
	docker-compose up --no-deps -d app

# Builds and runs all services.
# Use when you've updated the nginx or mongo configuration too.
dev-build-all:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose build; \
	docker-compose up -d


# Production

# Runs the built image with prod settings.
prod:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prd.yml up --no-deps -d app

# Runs all built services with prod settings.
prod-all:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose -f docker-compose.yml -f docker-compose.prd.yml up --no-deps -d app

# Builds and runs the app with prod settings.
# Does not affect other running services.
prod-build:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose build app; \
	docker-compose -f docker-compose.yml -f docker-compose.prd.yml up --no-deps -d app

# Builds and runs all services with prod settings.
# Use when you've updated the nginx or mongo configuration too.
prod-build-all:
	@export METEOR_SETTINGS='$(shell cat settings.json)'; \
	docker-compose build
	docker-compose -f docker-compose.yml -f docker-compose.prd.yml up --no-deps -d app
