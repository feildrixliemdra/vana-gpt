export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'GPT-4.1',
    description: 'Primary model for all-purpose chat.',
  },
  {
    id: 'chat-model-mini',
    name: 'GPT-4.1-mini',
    description: 'Mini model for all-purpose chat, good for simple tasks with faster response.',
  },
  {
    id: 'chat-model-reasoning',
    name: 'o4-mini',
    description: 'Uses advanced reasoning for deep thinking.',
  },
];
