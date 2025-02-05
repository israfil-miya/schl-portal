import { copy } from '@/lib/utils';
import React from 'react';

function ClickToCopy({
  text,
  preview = true,
}: {
  text: string;
  preview?: boolean;
}) {
  return (
    <span
      className="hover:underline cursor-pointer"
      onClick={async () => {
        await copy(text);
      }}
    >
      {preview ? text?.substring(0, 20).trim() : 'CLICK TO COPY'}
      {preview && text?.length > 20 && '...'}
    </span>
  );
}

export default ClickToCopy;
