
export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export enum BotTab {
  DASHBOARD = 'dashboard',
  MODERATION = 'moderation',
  MUSIC = 'music',
  ROLES = 'roles',
  PERSONALITY = 'personality',
  WELCOME = 'welcome',
  INTEGRATION = 'integration'
}

export interface User {
  id: string;
  username: string;
  tag: string;
  avatar: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
  roles: string[];
}

export type LogType = 'ban' | 'mute' | 'soft-ban' | 'clear' | 'music' | 'role';

export interface LogEntry {
  id: string;
  type: LogType;
  action: string;
  user: string;
  target: string;
  timestamp: Date;
  reason?: string;
}
