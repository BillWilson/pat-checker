# Default shell
SHELL := /bin/bash

# Docker compose command
DC := docker compose

.PHONY: help setup init build start stop down logs ps clean init-db

# Default target when just running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial setup: copy env files and build containers
	@echo "Copying environment files..."
	@if [ ! -f api/.env ]; then \
		cp .env.api api/.env; \
		echo "Copied api/.env.example to api/.env"; \
	fi
	@if [ ! -f web/.env ]; then \
		cp .env.web web/.env; \
		echo "Copied web/.env.example to web/.env"; \
	fi
	@$(MAKE) build

build: ## Build or rebuild all services
	@echo "Building Docker images..."
	$(DC) build
	$(DC) up -d --remove-orphans

start: ## Start all services
	@echo "Starting services..."
	$(DC) up -d

stop: ## Stop all services
	@echo "Stopping services..."
	$(DC) stop

down: ## Stop and remove all containers
	@echo "Removing containers..."
	$(DC) down

logs: ## View logs from all containers
	$(DC) logs -f

ps: ## List all running containers
	$(DC) ps

clean: down ## Clean up: stop containers, remove volumes and docker networks
	@echo "Cleaning up..."
	$(DC) down -v

init-db: ## Initialize database with migrations and seed data
	@echo "Running database migrations..."
	$(DC) exec api php artisan migrate --force
	@echo "Creating patents..."
	$(DC) exec api php artisan app:create-patent
	@echo "Creating products..."
	$(DC) exec api php artisan app:create-product

# Full initialization target that sets up everything
init: setup init-db ## Full initialization: setup environment and initialize database
	@echo "Project initialization completed!"

# Development specific commands
dev: ## Start services in development mode
	@echo "Starting services in development mode..."
	$(DC) up

rebuild: down build ## Rebuild and restart all services
	@echo "Services rebuilt and restarted!"
