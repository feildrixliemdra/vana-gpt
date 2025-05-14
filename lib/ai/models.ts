export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat, default using GPT-4o',
  },
  {
    id: 'chat-model-mini',
    name: 'Chat model mini',
    description: 'Mini model for all-purpose chat, good for simple tasks with faster response, default using GPT-4o-mini',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning for deep thinking, default using o4-mini',
  },
];
