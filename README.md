# Pythia V2 - Open Source Query Engine for Web3

Pythia V2 aims to be an easy-to-use data analytics tool focused on providing natural language querying capabilities for on-chain and off-chain data. This version is a more modular and modernized iteration of the original Pythia concept.

## Project Components

The project is structured as a monorepo containing the following key services:

1.  **`openmesh-collectors`**:
    *   A Python-based data collection system.
    *   Responsible for gathering Web3 financial data (and potentially other data) from various on-chain sources (e.g., Ethereum) and off-chain exchanges.
    *   Includes services for Apache Kafka and a specific `ethereum-collector` service.
    *   The Ethereum collector uses the `runner.py` script to fetch on-chain data.
    *   Data is published to Kafka topics (e.g., `ethereum_blocks`, `ethereum_transactions`).
    *   The goal is to eventually feed processed data from Kafka into a PostgreSQL database.

2.  **`pythia-backend`**:
    *   A Node.js application built with the NestJS framework and TypeScript.
    *   Provides the API endpoints for the frontend.
    *   Handles natural language queries (NLQ) from users.
    *   Translates NLQ into SQL queries using a Large Language Model (LLM).
    *   Executes SQL queries against the PostgreSQL database.
    *   Uses Prisma as its ORM.
    *   **(For `openmesh-collectors`) Ethereum RPC Node URL:** If you intend to run the Ethereum collector, you'll need RPC URLs (HTTP and WebSocket) from a provider like Alchemy, Infura, QuickNode, etc. These are configured in `openmesh-collectors/keys/.env`.
    *   **(For `pythia-backend`) LLM API Key/Configuration:** You'll need an API key for your chosen LLM (e.g., ASI-1, or configuration for a local LLM). Configured in `pythia-backend/.env`.

3.  **`pythia-frontend`**:
    *   A Next.js (React) application built with TypeScript.
    *   Provides the user interface for interacting with Pythia.
    *   Allows users to input natural language queries and view the results (tables, charts, etc.).

4.  **PostgreSQL Database**:
    *   The central data store for:
        *   Application-specific data managed by `pythia-backend` (user accounts, chat history, etc.).
        *   Processed on-chain and off-chain data ingested by `openmesh-collectors` (this part of the data pipeline is under development).

5.  **Apache Kafka**:
    *   Used by `openmesh-collectors` as a distributed streaming platform to ingest and process data before it lands in PostgreSQL.

## Local Development Setup

This project uses Docker and Docker Compose, orchestrated by a root `Makefile`, to manage local development services.

**Prerequisites:**

*   **Docker Desktop:** Ensure Docker Desktop is installed and running. The `Makefile` uses `docker compose` (with a space).
*   **Git:** For cloning the repository.
*   **(For `openmesh-collectors`) Ethereum RPC Node URL:** If you intend to run the Ethereum collector, you'll need RPC URLs (HTTP and WebSocket) from a provider like Alchemy, Infura, QuickNode, etc. These are configured in `openmesh-collectors/keys/.env`.
*   **(For `pythia-backend`) LLM API Key/Configuration:** You'll need an API key for your chosen LLM (e.g., ASI-1, or configuration for a local LLM). Configured in `pythia-backend/.env`.

**Steps to Run Locally:**

1.  **Clone the Repository:**
    ```bash
    # git clone <repository-url>
    cd PYTHIA
    ```

2.  **Configure `openmesh-collectors`:**
    *   Navigate to `openmesh-collectors/keys/`.
    *   Create a `.env` file (if it doesn't exist) by copying from a template or manually.
    *   Add Kafka connection details (these are for the local Docker Kafka instance run by `docker-compose.yml` in the same directory):
        ```ini
        KAFKA_BOOTSTRAP_SERVERS=broker01:9092,broker02:9092,broker03:9092
        SCHEMA_REGISTRY_URL=http://schema-registry:8081
        ```
    *   If running the Ethereum collector, add your RPC URLs:
        ```ini
        ETHEREUM_NODE_HTTP_URL=<your_ethereum_rpc_http_url>
        ETHEREUM_NODE_WS_URL=<your_ethereum_rpc_ws_url>
        ```
    *   **Note:** This `.env` file is copied into the `ethereum-collector` Docker image during the build process (see `openmesh-collectors/Dockerfile`) and read by the Python scripts directly.

3.  **Configure `pythia-backend` (LLM API Key):**
    *   The `Makefile` will create an initial `pythia-backend/.env` file.
    *   After the first `make up` run (or by creating it manually beforehand), edit `pythia-backend/.env` and add the necessary environment variables for your chosen LLM. For example, for an OpenAI-API compatible endpoint (like ASI-1 or a local Ollama server):
        ```env
        # pythia-backend/.env
        # ... (DATABASE_URL and PYTHIA_PORT will be auto-generated)
        OPENAI_API_KEY="your_llm_api_key"
        OPENAI_API_BASE="your_llm_api_base_url_if_not_default_openai" # e.g., https://api.asi1.ai/v1
        LLM_MODEL_NAME="your_chosen_model_name" # e.g., asi1-mini
        ```

4.  **Start All Services:**
    From the root `PYTHIA` directory, run:
    ```bash
    make up
    ```
    This command will:
    *   Start PostgreSQL.
    *   Start Kafka, Zookeeper, and Schema Registry (defined in `openmesh-collectors/docker-compose.yml`).
    *   Build and start the `ethereum-collector` service (also defined in `openmesh-collectors/docker-compose.yml`).
    *   Build and start `pythia-backend`.
    *   Build and start `pythia-frontend`.

5.  **Accessing Services:**
    *   **Pythia Frontend:** `http://localhost:3111` (or the port configured for the frontend)
    *   **Pythia Backend API:** `http://localhost:3000` (or the port configured for the backend)
    *   **PostgreSQL:** Connect via `localhost:5432` (User: `pythiauser`, Pass: `pythiapassword`, DB: `pythiadb`)
    *   **Schema Registry (Kafka):** `http://localhost:8081`

**Makefile Targets:**

*   `make up`: Starts all defined services (including Kafka and the Ethereum collector).
*   `make down`: Stops all defined services.
*   `make logs`: Shows consolidated logs (usually not very readable for multiple services).
*   `make logs-db`: Follows logs for PostgreSQL.
*   `make logs-collectors`: Follows logs for Kafka services AND the `ethereum-collector`. To see only collector logs, run `docker compose logs -f ethereum-collector` from the `openmesh-collectors` directory.
*   `make logs-backend`: Follows logs for `pythia-backend`.
*   `make logs-frontend`: Follows logs for `pythia-frontend`.
*   `make clean-db`: Stops PostgreSQL and **deletes its data volume** (use with caution).

**Further Development:**

*   **Data Ingestion:** The `make up` command now starts the `ethereum-collector` service automatically. Other collectors (if developed) would need similar service definitions or manual execution methods.
*   **Kafka to PostgreSQL Pipeline:** The mechanism to move data collected by `openmesh-collectors` (currently Ethereum data in Kafka topics like `ethereum_blocks`) into queryable tables in PostgreSQL needs to be implemented. This might involve a separate Kafka consumer service or using a tool like Kafka Connect.
*   **PostgreSQL Schema for Collected Data:** The `prisma/schema.prisma` in `pythia-backend` needs to be extended with table definitions for the Ethereum data (blocks, transactions, logs, transfers) collected by `openmesh-collectors`.

This project is under active development. 