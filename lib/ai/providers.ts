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

type ProviderConfig = {
  languageModels: Record<string, any>;
  imageModels?: Record<string, any>;
};

function getProviderConfig(provider: string): ProviderConfig {
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
      'chat-model': openai.responses('gpt-4.1'),
      'chat-model-mini': openai.responses('gpt-4.1-mini'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai.responses('o4-mini'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4.1-mini'),
      'artifact-model': openai('gpt-4.1-mini'),
    },
    imageModels: {
      'image-model': openai.image('gpt-image-1', {maxImagesPerCall:1}),
    },
  };
}

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-mini': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider(getProviderConfig(MODEL_PROVIDER));
