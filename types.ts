
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

export interface DiscordServer {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count?: number;
  hasBot?: boolean;
}

export interface DiscordProfile {
  id: string;
  username: string;
  avatar: string | null;
  email?: string;
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
