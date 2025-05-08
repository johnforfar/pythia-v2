# syntax=docker/dockerfile:1

FROM python:3.9.4-slim
WORKDIR /src

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    musl-dev \
    librdkafka-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first to leverage Docker cache
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy test requirements and install them (optional, consider if needed in final image)
COPY tests/requirements.txt tests/requirements.txt
RUN pip3 install -r tests/requirements.txt

# Copy the rest of the application code
COPY openmesh/ ./openmesh
COPY static/ ./static
COPY runner.py ./
COPY config.ini ./
COPY tests/ ./tests
COPY mock_data/ ./mock_data
COPY keys/ ./keys

# Note: The final CMD or ENTRYPOINT is likely defined in the docker-compose.yml