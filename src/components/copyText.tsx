import copy from '@/utility/copyToClipboard';
import React from 'react';

function ClickToCopy({ text }: { text: string }) {
  return (
    <span
      className="hover:underline cursor-pointer"
      onClick={async () => {
        await copy(text);
      }}
    >
      {text?.substring(0, 20).trim()}
      {text?.length > 20 && '...'}
    </span>
  );
}

export default ClickToCopy;
