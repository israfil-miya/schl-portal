import { cn } from '@/lib/utils';
import React, { ReactElement } from 'react';

function Badge({
  value,
  className,
}: {
  value: string;
  className?: string;
}): ReactElement<HTMLSpanElement> {
  return (
    <span
      className={cn(
        'bg-gray-200 text-gray-900 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-gray-400',
        className,
      )}
    >
      {value}
    </span>
  );
}

export default Badge;
