# Variables
DOCKER_COMPOSE = docker compose

.PHONY: all build up down logs clean help \
		up-bookings-api down-bookings-api logs-bookings-api restart-bookings-api \
		up-postgres down-postgres logs-postgres restart-postgres \
		db-migrate-add

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Global Commands
build: ## Build the Docker images
	$(DOCKER_COMPOSE) build

up: ## Start all services in detached mode
	$(DOCKER_COMPOSE) up -d

down: ## Stop and remove containers, networks
	$(DOCKER_COMPOSE) down

logs: ## Follow logs for all services
	$(DOCKER_COMPOSE) logs -f

clean: ## Stop containers and remove volumes/images
	$(DOCKER_COMPOSE) down -v --rmi local --remove-orphans

# Bookings API Service
up-bookings-api: ## Start only the bookings-api service
	$(DOCKER_COMPOSE) up -d bookings-api

down-bookings-api: ## Stop and remove the bookings-api service
	$(DOCKER_COMPOSE) rm -s -v bookings-api

logs-bookings-api: ## Follow logs for the bookings-api service
	$(DOCKER_COMPOSE) logs -f bookings-api

restart-bookings-api: down-bookings-api up-bookings-api ## Restart the bookings-api service

# Postgres Service
up-postgres: ## Start only the postgres service
	$(DOCKER_COMPOSE) up -d postgres

down-postgres: ## Stop and remove the postgres service
	$(DOCKER_COMPOSE) rm -s -v postgres

logs-postgres: ## Follow logs for the postgres service
	$(DOCKER_COMPOSE) logs -f postgres

restart-postgres: down-postgres up-postgres ## Restart the postgres service

# Database Migrations
db-migrate-add: ## Create a new EF Core migration (usage: make db-migrate-add NAME=MigrationName)
	@if [ -z "$(NAME)" ]; then echo "Error: NAME is required. Usage: make db-migrate-add NAME=MigrationName"; exit 1; fi
	dotnet ef migrations add $(NAME) --project src/bookings-api --startup-project src/bookings-api
