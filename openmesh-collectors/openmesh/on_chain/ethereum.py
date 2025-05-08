from openmesh.feed import RPC
import asyncio
from yapic import json
from openmesh.chain import ChainFeed
import dataclasses

from openmesh.feed import AsyncFeed

import logging
from decimal import Decimal, getcontext

TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

getcontext().prec = 38

# Handles the conversions between hex digits and their decimal equivalents automatically


@dataclasses.dataclass
class EthereumObject:
    atomTimestamp: int

    def __post_init__(self):
        for field in dataclasses.fields(self):
            value = getattr(self, field.name)
            if field.type is int and isinstance(value, str):
                setattr(self, field.name, int(value, 16))
            if field.type is Decimal and isinstance(value, str):
                setattr(self, field.name, Decimal(int(value, 16)))
            if field.type is Decimal and isinstance(value, (float, int)):
                setattr(self, field.name, Decimal(value))
            if field.type is str and isinstance(value, int):
                setattr(self, field.name, hex(value))

    def to_dict(self):
        return dataclasses.asdict(self)

    def to_json_string(self):
        return json.dumps(self.to_dict())


@dataclasses.dataclass
class EthereumBlock(EthereumObject):
    baseFeePerGas: int
    number: int
    hash: str
    parentHash: str
    nonce: str
    sha3Uncles: str
    logsBloom: str
    transactionsRoot: str
    stateRoot: str
    receiptsRoot: str
    miner: str
    difficulty: int
    totalDifficulty: Decimal
    extraData: str
    size: int
    gasLimit: Decimal
    gasUsed: Decimal
    blockTimestamp: int
    # Add new fields from Dencun upgrade (EIP-4844)
    blobGasUsed: int = None
    excessBlobGas: int = None
    parentBeaconBlockRoot: str = None


@dataclasses.dataclass
class EthereumTransaction(EthereumObject):
    blockTimestamp: int
    hash: str
    nonce: str
    blockHash: str
    blockNumber: int
    transactionIndex: int
    fromAddr: str
    toAddr: str
    value: Decimal
    gas: int
    gasPrice: int
    input: str
    type: str
    maxFeePerGas: int = None
    maxPriorityFeePerGas: int = None


@dataclasses.dataclass
class EthereumLog(EthereumObject):
    blockTimestamp: int
    blockNumber: int
    blockHash: str
    transactionIndex: int
    transactionHash: str
    logIndex: int
    address: str
    data: str
    topic0: str
    topic1: str = None
    topic2: str = None
    topic3: str = None


@dataclasses.dataclass
class EthereumTransfer(EthereumObject):
    blockTimestamp: int
    blockNumber: int
    blockHash: str
    transactionHash: str
    transactionIndex: int
    logIndex: int
    fromAddr: str
    toAddr: str
    tokenAddr: str
    value: Decimal


class Ethereum(ChainFeed):
    name = "ethereum"
    chain_objects = {
        'blocks': EthereumBlock,
        'transactions': EthereumTransaction,
        'logs': EthereumLog,
        'token_transfers': EthereumTransfer
    }

    event_objects = ['dex_trades']

    type_map = {
        '0x0': 'Legacy',
        '0x1': 'EIP-2930',
        '0x2': 'EIP-1559'
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.last_block_num = 0
        self.last_block_hash = None
        self.last_block_time = 0

    @classmethod
    def get_key(cls, msg: dict):
        if 'topic0' in msg:
            return f"{msg['topic0']};{msg['address']}".encode()
        return None

    async def subscribe(self, conn, feeds, symbols):
        # conn is the WSRPC instance (passed as feed_instance from AsyncConnectionManager)
        # self is the Ethereum instance.
        # Attempt to subscribe
        blocks_res = await conn.make_call('eth_subscribe', ['newHeads'])
        logging.debug(
            "%s: Attempting to subscribe to newHeads, make_call returned: %s", self.name, blocks_res)

        # --- PATCH ---
        # Problem: make_call seems to return the first event, not the RPC response result.
        # Try to extract the subscription ID from the event\'s params if possible.
        extracted_sub_id = None
        if isinstance(blocks_res, dict):
            if 'result' in blocks_res: # It might be the actual response after all?
                 extracted_sub_id = blocks_res['result']
                 logging.info("Got subscription ID from 'result' field: %s", extracted_sub_id)
            elif blocks_res.get('method') == 'eth_subscription' and 'params' in blocks_res:
                if 'subscription' in blocks_res['params']:
                   extracted_sub_id = blocks_res['params']['subscription']
                   logging.info("Extracted subscription ID from first event\'s params: %s", extracted_sub_id)

        self.block_sub_id = extracted_sub_id # Will be None if extraction failed

        if not self.block_sub_id:
             logging.error("FAILED to get a valid subscription ID for newHeads. blocks_res was: %s", blocks_res)
        else:
             logging.info(f"Using subscription ID for newHeads: {self.block_sub_id}")
        # --- END PATCH ---

    def hex_to_int(self, hex_str: str):
        return int(hex_str, 16)

    async def get_transactions_by_block(self, conn: RPC, block_number: int):
        res = await conn.make_call('eth_getBlockByNumber', [hex(block_number), True])
        while 'result' not in res:
            await asyncio.sleep(1)
            res = await conn.make_call('eth_getBlockByNumber', [hex(block_number), True])
        return res['result']['transactions']

    async def get_block_by_number(self, conn: RPC, block_number: str):
        res = await conn.make_call('eth_getBlockByNumber', [block_number, True])
        while not res.get('result', None):
            await asyncio.sleep(1)
            res = await conn.make_call('eth_getBlockByNumber', [block_number, True])
        return res['result']

    async def get_logs_by_block_number(self, conn: RPC, block_number: str):
        res = await conn.make_call('eth_getLogs', [{
            'fromBlock': block_number,
            'toBlock': block_number
        }])
        while 'result' not in res:
            await asyncio.sleep(1)
            res = await conn.make_call('eth_getLogs', [{
                'fromBlock': block_number,
                'toBlock': block_number
            }])
        return res['result']

    async def _transactions(self, conn: RPC, transactions: list, ts: int):
        for transaction in transactions:
            del transaction['v']
            del transaction['r']
            del transaction['s']
            transaction.pop('chainId', None)
            transaction.pop('accessList', None)
            transaction.pop('yParity', None)
            transaction['fromAddr'] = transaction.pop('from')
            transaction['toAddr'] = transaction.pop('to')
            transaction['type'] = self.type_map[transaction['type']]
            transaction_obj = EthereumTransaction(
                **transaction, blockTimestamp=self.last_block_time, atomTimestamp=ts)
            logging.debug(f"Received transaction {transaction_obj.hash}")
            await self.kafka_backends['transactions'].write(transaction_obj.to_json_string())

    async def _log(self, conn: RPC, log: dict, ts: int):
        logging.debug("Received log")
        del log['removed']
        topics = {f'topic{i}': topic for i, topic in enumerate(log['topics'])}
        del log['topics']
        log_obj = EthereumLog(
            **log, **topics, blockTimestamp=self.last_block_time, atomTimestamp=ts)
        await self.kafka_backends['logs'].write(log_obj.to_json_string())

    async def _block(self, conn: RPC, block: dict, ts: int):
        logging.debug(
            "-----------------\n\n\nReceived block\n\n\n-----------------")
        del block['mixHash']
        del block['transactions']
        del block['uncles']
        del block['withdrawals']
        del block['withdrawalsRoot']
        block['blockTimestamp'] = self.hex_to_int(block.pop('timestamp')) * 1000
        block_obj = EthereumBlock(**block, atomTimestamp=ts)
        self.last_block_hash = block_obj.hash
        self.last_block_num = block_obj.number
        self.last_block_time = block_obj.blockTimestamp
        await self.kafka_backends['blocks'].write(block_obj.to_json_string())

    def _word_to_addr(self, word: str):
        if len(word) > 40:
            return word[-40:]
        return word

    async def _token_transfer(self, conn: RPC, transfer: dict, ts: int):
        logging.debug("Received token transfer")
        topics = transfer['topics']
        # If we don't at least have a from address, we don't care
        if len(topics) <= 1:
            return
        from_addr = self._word_to_addr(topics[1])
        to_addr = self._word_to_addr(topics[2])
        value = transfer['data'][:66]
        # Could be another Transfer event other than the standard ERC20 method. value is expected to be a 256 bit unsigned integer
        # https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L113
        if len(value) < 66:
            return
        msg = dict(
            tokenAddr=transfer['address'],
            transactionHash=transfer['transactionHash'],
            transactionIndex=transfer['transactionIndex'],
            blockNumber=transfer['blockNumber'],
            logIndex=transfer['logIndex'],
            blockHash=transfer['blockHash'],
            blockTimestamp=self.last_block_time,
            fromAddr=from_addr,
            toAddr=to_addr,
            value=value,
            atomTimestamp=ts
        )
        transferObj = EthereumTransfer(**msg)
        await self.kafka_backends['token_transfers'].write(transferObj.to_json_string())

    async def process_message(self, message: str, conn: AsyncFeed, timestamp: int):
        try:
            msg = json.loads(message)
            # Ensure msg is a dictionary and has 'params' before proceeding
            if not isinstance(msg, dict) or 'params' not in msg:
                 logging.warning(f"Received message without params field: {message}")
                 return

            data = msg['params']

            # Ensure data is a dictionary before accessing keys
            if not isinstance(data, dict):
                logging.warning(f"Received message with non-dict params: {data}")
                return

            current_sub_id = data.get('subscription')
            result_data = data.get('result')

            # Check if it's the block subscription we are expecting
            is_block_event = False
            if self.block_sub_id and current_sub_id == self.block_sub_id:
                 is_block_event = True
            # Fallback check: if result looks like a block header
            elif isinstance(result_data, dict) and 'number' in result_data:
                 is_block_event = True
                 if current_sub_id != self.block_sub_id:
                      logging.warning(f"Message looks like block data, but subscription ID mismatch. Got: {current_sub_id}, Expected: {self.block_sub_id}")

            if is_block_event and isinstance(result_data, dict):
                block_number = result_data.get('number')
                if block_number is None:
                     logging.warning(f"Block event message missing 'number' in result: {result_data}")
                     return

                logging.info(f"Processing block event for number: {block_number}")
                block = await self.get_block_by_number(self.http_node_conn, block_number)
                if not block:
                     logging.error(f"Failed to get block details for number: {block_number}")
                     return

                await self._block(conn, block.copy(), timestamp) # Pass conn (WSRPC instance)
                # Ensure block has transactions before processing
                if 'transactions' in block and block['transactions'] is not None:
                    await self._transactions(conn, block['transactions'], timestamp) # Pass conn
                else:
                    logging.warning(f"Block {block_number} has no transactions field or it is null.")

                logs = await self.get_logs_by_block_number(self.http_node_conn, block_number)
                if logs is None:
                     logging.error(f"Failed to get logs for block number: {block_number}")
                     return

                for log in logs:
                     # Ensure log is a dict and has required fields
                     if isinstance(log, dict) and 'topics' in log and log['topics']:
                          await self._log(conn, log.copy(), timestamp) # Pass conn
                          if log['topics'][0].casefold() == TRANSFER_TOPIC:
                               await self._token_transfer(conn, log, timestamp) # Pass conn
                     else:
                          logging.warning(f"Skipping malformed log in block {block_number}: {log}")

            else:
                # Log if it's an unhandled subscription ID or doesn't look like a block
                logging.warning(f"Received unhandled message/subscription ID. CurrentSubID: {current_sub_id}, ExpectedBlockSubID: {self.block_sub_id}, RawMsg: {message[:500]}...") # Log truncated raw msg

        except json.JSONDecodeError:
            logging.error(f"Failed to decode JSON message: {message[:500]}...")
        except Exception as e:
            logging.exception(f"Error processing message: {message[:500]}...")
