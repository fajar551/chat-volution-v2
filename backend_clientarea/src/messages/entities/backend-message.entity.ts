import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

export enum ChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum Direction {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('backend_messages')
export class BackendMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  message_id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  from_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  to_number: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'int', nullable: true, comment: 'Rating value (1-5) from client' })
  rating: number;

  @Column({ type: 'tinyint', default: 0 })
  is_read: boolean;

  @Column({
    type: 'enum',
    enum: ChatStatus,
    default: ChatStatus.OPEN,
    comment: 'Chat status: open or closed',
  })
  chat_status: ChatStatus;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: 'Whether the chat is pending (true) or not (false)',
  })
  is_pending: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Agent ID who is assigned to handle this chat',
  })
  assigned_to: string;

  @Column({ type: 'json', nullable: true, comment: 'Media attachment data' })
  media_data: any;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @Column({
    type: 'enum',
    enum: Direction,
  })
  direction: Direction;

  @Index()
  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'datetime' })
  received_at: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Agent who sent the message',
  })
  agent_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Chat session identifier',
  })
  chat_session_id: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Index()
  @Column({ type: 'varchar', length: 10, default: 'wa1' })
  instance: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  perusahaan: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;
}

