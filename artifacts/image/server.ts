import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    try {
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel('image-model'),
        providerOptions: {
          "openai": {
            "quality": "medium"
          }
        },
        prompt: title,
        n: 1,
      });

      draftContent = image.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });

      return draftContent;
    } catch (err) {
      console.error('Error generating image:', err);
      dataStream.writeData({
        type: 'image-delta',
        content: '',
        error: String(err),
      });
      return '';
    }
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('image-model'),
      prompt: description,
      providerOptions: {
        "openai": {
          "quality": "medium"
        }
      },
      n: 1,
    });
    
    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
});
