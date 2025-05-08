from configparser import ConfigParser
import json
from dotenv import dotenv_values

config_path = "config.ini"
env_path = "keys/.env"


def get_kafka_config():
    config = ConfigParser()
    config.read(config_path)
    dotenv_vals = dotenv_values(env_path)
    print(f"DEBUG: dotenv_values read from {env_path}: {dotenv_vals}", flush=True)
    return {
        **dotenv_vals,
        **config['KAFKA']
    }


def get_ethereum_provider():
    secrets = dotenv_values(env_path)
    print(f"DEBUG: dotenv_values read from {env_path} (for eth provider): {secrets}", flush=True)
    return {
        "eth_node_ws_url": secrets["ETHEREUM_NODE_WS_URL"],
        "eth_node_http_url": secrets["ETHEREUM_NODE_HTTP_URL"],
        "eth_node_secret": secrets["ETHEREUM_NODE_SECRET"]
    }


def get_secrets():
    secrets = dotenv_values(env_path)
    print(f"DEBUG: dotenv_values read from {env_path} (for get_secrets): {secrets}", flush=True)
    return secrets


def get_redis_config():
    config = ConfigParser()
    config.read(config_path)
    return {
        **config['REDIS'],
        **dotenv_values(env_path)
    }
