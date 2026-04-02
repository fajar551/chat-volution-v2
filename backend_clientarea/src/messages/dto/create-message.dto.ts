import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { MessageType, Direction, MessageStatus, ChatStatus } from '../entities/backend-message.entity';

export class CreateMessageDto {
  @IsString()
  message_id: string;

  @IsString()
  from_number: string;

  @IsString()
  @IsOptional()
  to_number?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsOptional()
  is_read?: boolean;

  @IsEnum(ChatStatus)
  @IsOptional()
  chat_status?: ChatStatus;

  @IsBoolean()
  @IsOptional()
  is_pending?: boolean;

  @IsString()
  @IsOptional()
  assigned_to?: string;

  @IsObject()
  @IsOptional()
  media_data?: any;

  @IsEnum(MessageType)
  @IsOptional()
  message_type?: MessageType;

  @IsEnum(Direction)
  direction: Direction;

  @IsNumber()
  timestamp: number;

  @IsString()
  @IsOptional()
  agent_id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  chat_session_id?: string;

  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @IsString()
  @IsOptional()
  instance?: string;

  @IsString()
  @IsOptional()
  perusahaan?: string;
}

