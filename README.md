# Pythia V2 - Open Source Query Engine for Web3

Pythia V2 aims to be an easy-to-use data analytics tool focused on providing natural language querying capabilities for on-chain and off-chain data. This version is a more modular and modernized iteration of the original Pythia concept.

## Project Components

The project is structured as a monorepo containing the following key services:

1.  **`openmesh-collectors`**:
    *   A Python-based data collection system.
    *   Responsible for gathering Web3 financial data (and potentially other data) from various on-chain sources (e.g., Ethereum) and off-chain exchanges.
    *   Uses Apache Kafka for its data streaming pipeline.
    *   The goal is to feed processed data into a PostgreSQL database.

2.  **`pythia-backend`**:
    *   A Node.js application built with the NestJS framework and TypeScript.
    *   Provides the API endpoints for the frontend.
    *   Handles natural language queries (NLQ) from users.
    *   Translates NLQ into SQL queries using a Large Language Model (LLM).
    *   Executes SQL queries against the PostgreSQL database.
    *   Uses Prisma as its ORM.

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
*   **(For `openmesh-collectors`) Ethereum RPC Node URL:** If you intend to collect Ethereum on-chain data, you'll need an RPC URL (HTTP and WebSocket) from a provider like Alchemy, Infura, QuickNode, etc.
*   **(For `pythia-backend`) LLM API Key/Configuration:** You'll need an API key for your chosen LLM (e.g., ASI-1, or configuration for a local LLM).

**Steps to Run Locally:**

1.  **Clone the Repository:**
    ```bash
    # git clone <repository-url>
    cd PYTHIA
    ```

2.  **Configure `openmesh-collectors`:**
    *   Navigate to `openmesh-collectors/keys/`.
    *   Create a `.env` file (if it doesn't exist).
    *   Add your Kafka connection details (these are for the local Docker Kafka):
        ```ini
        KAFKA_BOOTSTRAP_SERVERS=localhost:29092,localhost:39092,localhost:49092
        SCHEMA_REGISTRY_URL=http://localhost:8081
        ```
    *   If collecting Ethereum data, add your RPC URLs:
        ```ini
        ETHEREUM_NODE_HTTP_URL=<your_ethereum_rpc_http_url>
        ETHEREUM_NODE_WS_URL=<your_ethereum_rpc_ws_url>
        ```

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
    *   Start Kafka, Zookeeper, and Schema Registry (for `openmesh-collectors`).
    *   Build and start `pythia-backend`.
    *   Build and start `pythia-frontend`.

5.  **Accessing Services:**
    *   **Pythia Frontend:** `http://localhost:3111` (or the port configured for the frontend)
    *   **Pythia Backend API:** `http://localhost:3000` (or the port configured for the backend)
    *   **PostgreSQL:** Connect via `localhost:5432` (User: `pythiauser`, Pass: `pythiapassword`, DB: `pythiadb`)
    *   **Schema Registry (Kafka):** `http://localhost:8081`

**Makefile Targets:**

*   `make up`: Starts all defined services.
*   `make down`: Stops all defined services.
*   `make logs`: Shows consolidated logs (usually not very readable for multiple services).
*   `make logs-db`: Follows logs for PostgreSQL.
*   `make logs-collectors`: Follows logs for Kafka services (Zookeeper, brokers, Schema Registry).
*   `make logs-backend`: Follows logs for `pythia-backend`.
*   `make logs-frontend`: Follows logs for `pythia-frontend`.
*   `make clean-db`: Stops PostgreSQL and **deletes its data volume** (use with caution).

**Further Development:**

*   **Data Ingestion:** The `make up` command starts the Kafka infrastructure but not the `openmesh-collectors` Python scripts that actually fetch data. These need to be run separately (or new Makefile targets can be added).
*   **Kafka to PostgreSQL Pipeline:** The mechanism to move data collected by `openmesh-collectors` from Kafka topics into queryable tables in PostgreSQL needs to be implemented.
*   **PostgreSQL Schema for Collected Data:** The `prisma/schema.prisma` in `pythia-backend` needs to be extended with table definitions for the data collected by `openmesh-collectors`.

This project is under active development. 