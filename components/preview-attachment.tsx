import type { Attachment } from 'ai';

import { LoaderIcon } from './icons';
import { X } from 'lucide-react';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onDelete,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onDelete?: () => void;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2 group">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {onDelete && (
          <button
            type="button"
            aria-label="Remove attachment"
            className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <X size={14} />
          </button>
        )}
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
