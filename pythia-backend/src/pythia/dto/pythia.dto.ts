import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  ValidateNested,
  IsInt,
  IsDateString,
  ArrayMaxSize,
  IsArray,
  MaxLength,
  IsEnum,
  Min,
  Max,
  IsNumberString,
} from 'class-validator';
import { IsNotBlank } from 'src/utils/custom-validators';

export class CreatePythiaChatDto {
  @IsNotEmpty()
  @MaxLength(10000)
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The user message',
    maxLength: 10000,
  })
  userInput: string;
}

export class ChangeChatNameDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The pythia id',
  })
  id: string;

  @IsNotEmpty()
  @MaxLength(10000)
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The chat name',
    maxLength: 10000,
  })
  chatName: string;
}

export class InputMessageDTO {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    description: 'The pythia id',
    maxLength: 1000,
  })
  id: string;

  @IsNotEmpty()
  @MaxLength(10000)
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The user message',
    maxLength: 10000,
  })
  userInput: string;
}

export class InputMessageNonUserDTO {
  @IsNotEmpty()
  @MaxLength(10000)
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The user message',
    maxLength: 10000,
  })
  userInput: string;

  @IsOptional()
  @ArrayMaxSize(1000)
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'The chat history',
    maxItems: 1000,
  })
  chatHistory: string[];
}

export class GetPythiaChatDto {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    description: 'The pythia id',
    maxLength: 1000,
  })
  id: string;
}

export class FeedbackInput {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    description: 'The pythia id',
    maxLength: 1000,
  })
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'If it was a bad response',
    example: true,
  })
  isBadResponse: boolean;
}

export class CreateLLMDTO {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    description: 'The llm name',
    maxLength: 1000,
  })
  name: string;
}

// export class CreateLLMDTO {
//   @IsNotEmpty()
//   @MaxLength(1000)
//   @IsString()
//   @ApiProperty({
//     description: 'The llm name',
//     maxLength: 1000,
//   })
//   name: string;
// }

export class GetDTO {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  @ApiProperty({
    description: 'The id',
    maxLength: 1000,
  })
  id: string;
}
