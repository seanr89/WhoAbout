# Variables
DOCKER_COMPOSE = docker compose

.PHONY: all build up down logs postgres bookings-api clean help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

compose-build: ## Build the Docker images
	$(DOCKER_COMPOSE) build

compose-up: ## Start all services in detached mode
	$(DOCKER_COMPOSE) up -d

compose-down: ## Stop and remove containers, networks
	$(DOCKER_COMPOSE) down

compose-logs: ## Follow logs for all services
	$(DOCKER_COMPOSE) logs -f

compose-postgres: ## Start only the postgres service
	$(DOCKER_COMPOSE) up -d postgres

compose-bookings-api: ## Start only the bookings-api service
	$(DOCKER_COMPOSE) up -d bookings-api

clean: ## Stop containers and remove volumes/images
	$(DOCKER_COMPOSE) down -v --rmi local --remove-orphans
