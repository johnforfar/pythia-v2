/* eslint-disable prefer-const */
import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as path from 'path';
import * as Papa from 'papaparse';
import * as fs from 'fs';

// import { import_ } from '@brillout/import';
import { ethers } from 'ethers';
import * as taskContractABI from '../contracts/taskContractABI.json';
import * as erc20ContractABI from '../contracts/erc20ContractABI.json';

import Decimal from 'decimal.js';
Decimal.set({ precision: 60 });

import Hex from 'crypto-js/enc-hex';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import { createHmac } from 'crypto';

import { PrismaService } from '../database/prisma.service';
import { Request, response } from 'express';
import axios from 'axios';
import { UtilsService } from '../utils/utils.service';
import { OpenmeshExpertsAuthService } from 'src/openmesh-experts/openmesh-experts-auth.service';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

import { features } from 'process';
import {
  ChangeChatNameDTO,
  CreatePythiaChatDto,
  FeedbackInput,
  GetPythiaChatDto,
  InputMessageDTO,
  InputMessageNonUserDTO,
} from './dto/pythia.dto';
import { ChatbotBedrockService } from './llm/chatbot-bedrock.service';

@Injectable()
export class PythiaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly openmeshExpertsAuthService: OpenmeshExpertsAuthService,
    private readonly chatbotBedrockService: ChatbotBedrockService,
  ) {}

  async createChat(dataBody: CreatePythiaChatDto, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChats = await this.prisma.pythiaChat.findMany({
      where: {
        openmeshExpertUserId: user.id,
      },
    });

    if (pythiaChats.length > 50) {
      throw new BadRequestException('Chats limit reached', {
        cause: new Error(),
        description: 'Chats limit reached',
      });
    }

    const chatResponse = await this.chatbotBedrockService.inputQuestion(
      [],
      dataBody.userInput,
    );

    return await this.prisma.pythiaChat.create({
      data: {
        openmeshExpertUserId: user.id,
        ...(dataBody.userInput && {
          PythiaInputs: {
            create: {
              userMessage: dataBody.userInput,
              response: chatResponse,
              pythiaChatId: undefined,
            },
          },
        }),
      },
    });
  }

  async inputNonUserChatMessage(dataBody: InputMessageNonUserDTO) {
    const chatHistory = dataBody.chatHistory;

    const chatResponse = await this.chatbotBedrockService.inputQuestion(
      chatHistory,
      dataBody.userInput,
    );

    return {
      pythiaChatId: 'id',
      userMessage: dataBody.userInput,
      response: chatResponse,
    };
  }

  async inputUserChatMessage(dataBody: InputMessageDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChat = await this.prisma.pythiaChat.findFirst({
      where: {
        id: dataBody.id,
        openmeshExpertUserId: user.id,
      },
      include: {
        PythiaInputs: true,
      },
    });

    if (!pythiaChat) {
      throw new BadRequestException('Chat not found', {
        cause: new Error(),
        description: 'Chat not found',
      });
    }

    if (pythiaChat.PythiaInputs?.length > 10000) {
      throw new BadRequestException('Chat limit reached', {
        cause: new Error(),
        description: 'Chat limit reached',
      });
    }

    const chatHistory = [];

    for (let i = 0; i < pythiaChat.PythiaInputs?.length; i++) {
      chatHistory.push(
        new HumanMessage(pythiaChat.PythiaInputs[i].userMessage),
      );
      chatHistory.push(new AIMessage(pythiaChat.PythiaInputs[i].response));
    }

    const chatResponse = await this.chatbotBedrockService.inputQuestion(
      chatHistory,
      dataBody.userInput,
    );

    return await this.prisma.pythiaInput.create({
      data: {
        pythiaChatId: dataBody.id,
        userMessage: dataBody.userInput,
        response: chatResponse,
      },
    });
  }

  async changeChatName(dataBody: ChangeChatNameDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChat = await this.prisma.pythiaChat.findFirst({
      where: {
        id: dataBody.id,
        openmeshExpertUserId: user.id,
      },
      include: {
        PythiaInputs: true,
      },
    });

    if (!pythiaChat) {
      throw new BadRequestException('Chat not found', {
        cause: new Error(),
        description: 'Chat not found',
      });
    }

    return await this.prisma.pythiaChat.update({
      where: {
        id: dataBody.id,
      },
      data: {
        name: dataBody.chatName,
      },
    });
  }

  async getUserChats(req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChats = await this.prisma.pythiaChat.findMany({
      where: {
        openmeshExpertUserId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pythiaChats;
  }

  async getUserChat(dataBody: GetPythiaChatDto, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChat = await this.prisma.pythiaChat.findFirst({
      where: {
        id: dataBody.id,
        openmeshExpertUserId: user.id,
      },
      include: {
        PythiaInputs: true,
      },
    });

    if (!pythiaChat) {
      throw new BadRequestException('Chat not found', {
        cause: new Error(),
        description: 'Chat not found',
      });
    }

    return pythiaChat;
  }

  async deleteUserChat(dataBody: GetPythiaChatDto, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    const pythiaChat = await this.prisma.pythiaChat.findFirst({
      where: {
        id: dataBody.id,
        openmeshExpertUserId: user.id,
      },
    });

    if (!pythiaChat) {
      throw new BadRequestException('Chat not found', {
        cause: new Error(),
        description: 'Chat not found',
      });
    }

    await this.prisma.pythiaChat.deleteMany({
      where: {
        id: dataBody.id,
        openmeshExpertUserId: user.id,
      },
    });
  }

  async insertBadFeedbackInput(dataBody: FeedbackInput, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.openmeshExpertsAuthService.verifySessionToken(
      accessToken,
    );

    return await this.prisma.pythiaInput.updateMany({
      where: {
        id: dataBody.id,
        pythiaChat: {
          openmeshExpertUserId: user.id,
        },
      },
      data: {
        badResponseFeedback: true,
      },
    });
  }
}
