import cn from '@/utility/cn';
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
        'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded',
        className,
      )}
    >
      {value}
    </span>
  );
}

export default Badge;
