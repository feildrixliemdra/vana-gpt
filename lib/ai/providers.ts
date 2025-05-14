import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'openai';

function getProviderConfig(provider: string) {
  if (provider === 'deepseek') {
    return {
      languageModels: {
        'chat-model': deepseek('deepseek-chat'),
        'chat-model-mini': deepseek('deepseek-chat'),
        'chat-model-reasoning': wrapLanguageModel({
          model: deepseek('deepseek-reasoner'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': deepseek('deepseek-chat'),
        'artifact-model': deepseek('deepseek-chat'),
      },
    };
  }
  
  // Default to OpenAI
  return {
    languageModels: {
      'chat-model': openai('gpt-4o'),
      'chat-model-mini': openai('gpt-4o-mini'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai('o4-mini'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4o-mini'),
      'artifact-model': openai('gpt-4o-mini'),
    },
    imageModels: {
      'image-model': openai.image('gpt-image-1'),
    },
  };
}

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider(getProviderConfig(MODEL_PROVIDER));
