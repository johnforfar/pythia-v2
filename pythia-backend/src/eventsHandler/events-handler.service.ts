import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MessagePattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { ethers } from 'ethers';
import * as taskContractABI from '../contracts/taskContractABI.json';
import * as erc20ContractABI from '../contracts/erc20ContractABI.json';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../database/prisma.service';
import { Request, response } from 'express';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { UpdatesService } from 'src/tasks/updates.service';

//This is the service to handle the contracts related to the task managment:
// Task.sol

// Define a minimal interface for the expected log structure from ethereum-collector
interface EthereumLogKafkaMessage {
  address: string; // Contract address
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  blockTimestamp?: number; // ethereum-collector might add this directly
  transactionFrom?: string; // Address that submitted the transaction
}

const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const TRANSFER_EVENT_ABI_MINIMAL = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

@Injectable()
export class EventsHandlerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsHandlerService.name);
  private web3UrlProvider: string;
  private web3Provider: ethers.providers.JsonRpcProvider;
  private viewPrivateKey: string;
  private taskContractAddress: string;
  private ipfsBaseURL: string;
  private walletEther: ethers.Wallet;
  private connectedWallet: ethers.Wallet;
  private newcontract: ethers.Contract;
  private fetTokenAddress: string;
  private iface: ethers.utils.Interface;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly updatesService: UpdatesService,
    // @Inject('KAFKA_SERVICE') // Example of injecting Kafka client - configure in module
    // private readonly clientKafka: ClientKafka, 
  ) {
    this.web3UrlProvider = process.env.WEB3_URL_PROVIDER;
    if (!this.web3UrlProvider) {
      this.logger.error('WEB3_URL_PROVIDER is not set in environment variables!');
      throw new Error('WEB3_URL_PROVIDER is not set');
    }
    this.web3Provider = new ethers.providers.JsonRpcProvider(this.web3UrlProvider);
    
    this.viewPrivateKey = process.env.VIEW_PRIVATE_KEY;
    this.taskContractAddress = process.env.TASK_CONTRACT_ADDRESS;
    if (!this.taskContractAddress) {
      this.logger.error('TASK_CONTRACT_ADDRESS is not set in environment variables!');
      throw new Error('TASK_CONTRACT_ADDRESS is not set');
    }
    this.ipfsBaseURL = process.env.IPFS_BASE_URL;
    this.walletEther = new ethers.Wallet(this.viewPrivateKey);
    this.connectedWallet = this.walletEther.connect(this.web3Provider);
    this.newcontract = new ethers.Contract(
      this.taskContractAddress,
      taskContractABI,
      this.web3Provider,
    );
    this.fetTokenAddress = this.taskContractAddress.toLowerCase();
    this.iface = new ethers.utils.Interface(TRANSFER_EVENT_ABI_MINIMAL);
    this.logger.log(`EventsHandlerService initialized. Watching FET Token: ${this.fetTokenAddress}`);
    this.logger.log(`Listening for Transfer events (signature: ${TRANSFER_EVENT_SIGNATURE}) on Kafka topic 'ethereum_logs'.`);
  }

  async onModuleInit() {
    // If using a NestJS-managed Kafka client, connection is handled by the framework.
    // If managing Kafka client manually (e.g. with kafkajs directly), connect here.
    // await this.clientKafka.connect(); // Example if injected
    this.logger.log('Kafka client connected (or managed by NestJS). Ready to consume.');
  }

  async onModuleDestroy() {
    // If using a NestJS-managed Kafka client, disconnection is handled by the framework.
    // await this.clientKafka.close(); // Example if injected
    this.logger.log('Kafka client disconnected (or managed by NestJS).');
  }

  @MessagePattern('ethereum_logs') // Subscribe to the 'ethereum_logs' topic
  async handleEthereumLog(@Payload() messageValue: string | Buffer | object, @Ctx() context: KafkaContext) {
    let logPayload: EthereumLogKafkaMessage;

    try {
      if (typeof messageValue === 'string') {
        logPayload = JSON.parse(messageValue);
      } else if (Buffer.isBuffer(messageValue)) {
        logPayload = JSON.parse(messageValue.toString());
      } else if (typeof messageValue === 'object' && messageValue !== null) {
        logPayload = messageValue as EthereumLogKafkaMessage;
      } else {
        this.logger.warn(`Received message of unknown type: ${typeof messageValue}`);
        return;
      }
      
      // Ensure essential fields are present
      if (!logPayload.address || !logPayload.topics || !logPayload.data) {
        this.logger.warn('Skipping log with missing address, topics, or data.', logPayload);
        return;
      }

      if (
        logPayload.address.toLowerCase() === this.fetTokenAddress &&
        logPayload.topics[0]?.toLowerCase() === TRANSFER_EVENT_SIGNATURE
      ) {
        this.logger.log(`Processing FET Transfer: Tx ${logPayload.transactionHash}, LogIndex ${logPayload.logIndex}`);

        const decodedLog = this.iface.parseLog({ topics: logPayload.topics, data: logPayload.data });
        const { from, to, value } = decodedLog.args;

        let blockTimestamp = logPayload.blockTimestamp ? String(logPayload.blockTimestamp) : null;
        if (!blockTimestamp) {
          try {
            const block = await this.web3Provider.getBlock(logPayload.blockNumber);
            if (block && block.timestamp) {
              blockTimestamp = String(block.timestamp);
            }
          } catch (e) {
            this.logger.error(`Error fetching block timestamp for ${logPayload.transactionHash}: ${e.message}`);
            blockTimestamp = String(Math.floor(Date.now() / 1000)); // Fallback
          }
        }

        let transactionSender = logPayload.transactionFrom || 'N/A';
        if (transactionSender === 'N/A' && logPayload.transactionHash) {
          try {
            const tx = await this.web3Provider.getTransaction(logPayload.transactionHash);
            if (tx && tx.from) {
              transactionSender = tx.from;
            }
          } catch (e) {
            this.logger.error(`Error fetching transaction sender for ${logPayload.transactionHash}: ${e.message}`);
          }
        }

        const eventToStore = {
          name: 'Transfer',
          data: JSON.stringify({
            fromAddress: from,
            toAddress: to,
            tokenValue: value.toString(),
            originalLog: logPayload, // Include the raw log for full data if needed later
          }),
          transactionHash: logPayload.transactionHash,
          blockNumber: String(logPayload.blockNumber),
          eventIndex: String(logPayload.logIndex),
          contractAddress: logPayload.address, // This is the FET token address
          address: transactionSender, // Address of the tx sender
          timestamp: blockTimestamp,
        };

        try {
          await this.prisma.event.create({ data: eventToStore });
          this.logger.log(`Stored FET Transfer event: ${logPayload.transactionHash}#${logPayload.logIndex}`);
        } catch (dbError) {
          // Handle potential unique constraint violations or other DB errors
          if (dbError.code === 'P2002') { // Unique constraint failed
            const target = dbError.meta?.target as string[];
            if (target?.includes('transactionHash') && target?.includes('eventIndex') && target?.includes('blockNumber')) {
              this.logger.warn(`Event already exists (txHash,logIndex,blockNum): ${logPayload.transactionHash}#${logPayload.logIndex}`);
            } else if (target?.includes('transactionHash')) { // Assuming this is the new constraint
              this.logger.warn(`Event already exists (txHash): ${logPayload.transactionHash}#${logPayload.logIndex}`);
            } else {
              this.logger.error(`DB unique constraint error saving event: ${dbError.message}`, {target});
            }
          } else {
            this.logger.error(`DB error saving event: ${dbError.message}`, dbError.stack);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error processing Kafka message for topic 'ethereum_logs': ${error.message}`, {
        errorMessage: error.message,
        errorStack: error.stack,
        kafkaMessageOffset: context.getMessage().offset,
        kafkaMessageValue: messageValue?.toString().substring(0, 1000) + '...',
      });
    }
  }
}
