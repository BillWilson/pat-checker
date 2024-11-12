# Project Name

This project is a take-home assignment for an interview. It demonstrates how to set up and run the application using Docker Compose and Makefile commands.

## Prerequisites

- Docker
- Docker Compose
- Make

## How to Run the App

### Using Docker Compose

1. **Setup environment files and build containers:**
   ```sh
   make setup
   ```

2. **Start the services:**
   ```sh
   make start
   ```

3. **Stop the services:**
   ```sh
   make stop
   ```

4. **Stop and remove all containers:**
   ```sh
   make down
   ```

5. **View logs from all containers:**
   ```sh
   make logs
   ```

6. **List all running containers:**
   ```sh
   make ps
   ```

7. **Clean up: stop containers, remove volumes and docker networks:**
   ```sh
   make clean
   ```

8. **Initialize database with migrations and seed data:**
   ```sh
   make init-db
   ```

9. **Full initialization: setup environment and initialize database:**
   ```sh
   make init
   ```

### Using Makefile Commands

- **Build or rebuild all services:**
  ```sh
  make build
  ```

- **Start services in development mode:**
  ```sh
  make dev
  ```

- **Rebuild and restart all services:**
  ```sh
  make rebuild
  ```

## Docker Compose Configuration

The `docker-compose.yaml` file defines the following services:

- **app**: 
  - Build context: `.`
  - Dockerfile: `Dockerfile.dev`
  - Ports: `8000:8000`
  - Depends on: `db`
  - Volumes: `./:/var/www/html`
  - Networks: `app-network`

- **db**:
  - Image: `pgvector/pgvector:pg16`
  - Environment: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `PGDATA`
  - Volumes: `dbdata`, `./.deploy/postgres/vector_extension.sql`
  - Ports: `54321:5432`
  - Networks: `app-network`

- **web**:
  - Build context: `web`
  - Dockerfile: `Dockerfile`
  - Ports: `8080:8080`
  - Environment: `NODE_ENV`, `NEXT_PUBLIC_API_HOST`
  - Depends on: `api`
  - Healthcheck: `CMD curl -f http://localhost:8080/`

- **api**:
  - Build context: `api`
  - Dockerfile: `Dockerfile`
  - Ports: `8000:8000`
  - Depends on: `db`
  - Networks: `app-network`

Networks and volumes are configured to ensure proper communication and data persistence.

## Conclusion

This README provides the necessary steps to set up and run the application using Docker Compose and Makefile commands. If you have any questions or need further assistance, feel free to reach out.

Feel free to customize this document further as needed.
