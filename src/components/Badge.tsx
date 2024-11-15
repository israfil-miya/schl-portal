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
        'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-blue-400',
        className,
      )}
    >
      {value}
    </span>
  );
}

export default Badge;
