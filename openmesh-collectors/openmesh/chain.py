from typing import Union
from openmesh.helpers.read_config import get_secrets
import asyncio
from openmesh.data_source import DataFeed
import base64

from openmesh.feed import AsyncConnectionManager, HTTPRPC, WSRPC
from openmesh.sink_connector.kafka_multiprocessed import AvroKafkaConnector

import logging
from openmesh.helpers.read_config import get_kafka_config
from configparser import ConfigParser


class Chain:

    def load_node_conf(self):
        secrets = get_secrets()
        return {
            **secrets,
        }


class DataFeed:
    """
    Data Feed base class

    Provides common functionality for all data feeds
    """

    def __init__(self, max_syms):
        pass


class ChainFeed(Chain, DataFeed):
    """
    Chain specific feed
    """
    chain_objects: dict = None
    event_objects: list = None
    name: str = None

    http_node_conn: Union[HTTPRPC, WSRPC] = NotImplemented
    # { <feed>: <feed object>}
    chain_objects: dict = NotImplemented

    # List of all the feeds related to individual contract events
    event_objects: list = NotImplemented

    # { <feed>: <Kafka Producer> }
    kafka_backends: dict = NotImplemented

    def __init__(self, sink=None, retries=3, interval=60, timeout=120, delay=0, **kwargs):
        super().__init__(max_syms=None)
        self.id = self.name
        self.kafka_backends = {}
        self.retries = retries
        self.interval = interval
        self.timeout = timeout
        self.delay = delay

        self.node_conf = self.load_node_conf()
        self._init_http_node_conn(**self.node_conf)

        self.ws_rpc_endpoints = {
            self.node_conf['ETHEREUM_NODE_WS_URL']: [
                self.name
            ]
        }

    def _init_http_node_conn(self, node_http_url=None, node_secret=None, **kwargs):
        http_url = self.node_conf.get('ETHEREUM_NODE_HTTP_URL')
        secret = self.node_conf.get('ETHEREUM_NODE_SECRET')
        self.http_node_conn = HTTPRPC(
            self.name, addr=http_url, auth_secret=secret)

    def _get_auth_header(self, username, password):
        assert ':' not in username
        auth = base64.b64encode(f'{username}:{password}'.encode()).decode()
        return ('Authorization', f'Basic {auth}')

    async def auth_ws(self, addr, options):
        secret = self.node_conf.get('ETHEREUM_NODE_SECRET')
        return addr, {'extra_headers': [self._get_auth_header(username='', password=secret)]}

    def _init_kafka(self, loop: asyncio.AbstractEventLoop):
        logging.info('%s: Starting Kafka connectors', self.name)
        for feed, feed_obj in self.chain_objects.items():
            logging.info('%s: Starting Kafka connector for %s',
                         self.name, feed)
            self.kafka_backends[feed] = AvroKafkaConnector(
                self, topic=f"{self.name}_{feed}", record=feed_obj)
        list(self.kafka_backends.values())[0].create_chain_topics(
            self.chain_objects, self.event_objects, self.name)
        for backend in self.kafka_backends.values():
            backend.start(loop)

    def start(self, loop: asyncio.AbstractEventLoop):
        """
        Start WS connections for raw chain data

        :param loop: Event loop to run the connection on
        :type loop: asyncio.AbstractEventLoop
        """
        self._init_kafka(loop)
        auth = None
        if 'ETHEREUM_NODE_SECRET' in self.node_conf:
            auth = self.auth_ws
        if not hasattr(self, 'connection_handlers'):
            self.connection_handlers = []

        for (endpoint, channels) in self.ws_rpc_endpoints.items():
            connection = WSRPC(
                self.name, addr=endpoint, authentication=auth)
            self.connection_handlers.append(AsyncConnectionManager(
                connection, self.subscribe, self.process_message, None, channels, self.retries, self.interval, self.timeout, self.delay))

        for handler in self.connection_handlers:
            handler.start_connection(loop)

        logging.info('%s: Starting connection to %s chain',
                     self.name, self.name)
