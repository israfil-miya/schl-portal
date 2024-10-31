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
        'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400',
        className,
      )}
    >
      {value}
    </span>
  );
}

export default Badge;
