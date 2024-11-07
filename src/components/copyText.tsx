import { copy } from '@/lib/utils';
import React from 'react';

function ClickToCopy({ text }: { text: string }) {
  return (
    <span
      className="underline cursor-pointer text-gray-600 hover:text-gray-900"
      onClick={async () => {
        await copy(text);
      }}
    >
      {text?.substring(0, 20).trim()} {text?.length > 20 && '...'}
    </span>
  );
}

export default ClickToCopy;
