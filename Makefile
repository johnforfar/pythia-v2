# Makefile for Pythia V2 Local Development

.PHONY: all up down logs logs-db logs-collectors logs-backend logs-frontend clean-db setup-backend-env setup-frontend-env

# Default target
all: up

# Bring up all services
up: up-db up-collectors up-backend up-frontend
	@echo "Pythia V2 environment is up."

# Bring down all services
down: down-frontend down-backend down-collectors down-db
	@echo "Pythia V2 environment is down."

# Start PostgreSQL
up-db:
	@echo "Starting PostgreSQL..."
	@docker compose -f pythia-backend/docker-compose.postgres.yml up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec local_pythia_postgres pg_isready -U pythiauser -d pythiadb -q; do \
		echo -n "."; sleep 1; \
	done; echo " PostgreSQL is ready."

# Stop PostgreSQL
down-db:
	@echo "Stopping PostgreSQL..."
	@docker compose -f pythia-backend/docker-compose.postgres.yml down

# Start openmesh-collectors (Kafka, Zookeeper, Schema Registry)
up-collectors:
	@echo "Starting Openmesh Collectors (Kafka services)..."
	@cd openmesh-collectors && docker compose up -d
	@echo "Openmesh Collectors services started."

# Stop openmesh-collectors
down-collectors:
	@echo "Stopping Openmesh Collectors services..."
	@cd openmesh-collectors && docker compose down

# Start pythia-backend
up-backend: setup-backend-env
	@echo "Starting Pythia Backend..."
	@cd pythia-backend && docker compose up -d --build
	@echo "Pythia Backend started."

# Stop pythia-backend
down-backend:
	@echo "Stopping Pythia Backend..."
	@cd pythia-backend && docker compose down

# Setup .env file for pythia-backend
setup-backend-env:
	@if [ ! -f pythia-backend/.env ]; then \
		echo "Creating .env file for pythia-backend..."; \
		echo "DATABASE_URL=\"postgresql://pythiauser:pythiapassword@postgres_db:5432/pythiadb?schema=public\"" > pythia-backend/.env; \
		echo "PYTHIA_PORT=3000" >> pythia-backend/.env; \
		echo "# Add other environment variables for pythia-backend here (e.g., LLM API keys for local models)"; \
		echo ".env file created in pythia-backend. Please review and update if necessary."; \
	else \
		echo "pythia-backend/.env file already exists."; \
	fi

# Start pythia-frontend
up-frontend: setup-frontend-env
	@echo "Building Pythia Frontend (forcing no-cache)..."
	@cd pythia-frontend && docker compose build --no-cache
	@echo "Starting Pythia Frontend..."
	@cd pythia-frontend && docker compose up -d
	@echo "Pythia Frontend started."

# Stop pythia-frontend
down-frontend:
	@echo "Stopping Pythia Frontend..."
	@cd pythia-frontend && docker compose down

# Setup .env file for pythia-frontend
setup-frontend-env:
	@if [ ! -f pythia-frontend/.env ]; then \
		echo "Creating .env file for pythia-frontend..."; \
		echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > pythia-frontend/.env; \
		echo "# Add other environment variables for pythia-frontend here"; \
		echo ".env file created in pythia-frontend. Please review and update if necessary."; \
	else \
		echo "pythia-frontend/.env file already exists."; \
	fi

# View logs
logs:
	@echo "Use 'make logs-db', 'make logs-collectors', 'make logs-backend', or 'make logs-frontend'"

logs-db:
	@docker compose -f pythia-backend/docker-compose.postgres.yml logs -f

logs-collectors:
	@cd openmesh-collectors && docker compose logs -f

logs-backend:
	@cd pythia-backend && docker compose logs -f

logs-frontend:
	@cd pythia-frontend && docker compose logs -f

# Clean PostgreSQL data (USE WITH CAUTION!)
clean-db: down-db
	@echo "Removing PostgreSQL data volume (local_pythia_postgres)..."
	@docker volume rm postgres_pythia_data || true
	@echo "PostgreSQL data cleaned."
