import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../entities/backend-message.entity';

export class SendMessageDto {
  @IsString()
  to_number: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  agent_id?: string;

  @IsString()
  @IsOptional()
  chat_session_id?: string;

  @IsEnum(MessageType)
  @IsOptional()
  message_type?: MessageType;

  @IsString()
  @IsOptional()
  instance?: string;

  @IsString()
  @IsOptional()
  name?: string;
  
  @IsString()
  @IsOptional()
  assigned_to?: string;
}

