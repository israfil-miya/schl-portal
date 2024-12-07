'use client';
import { cn } from '@/lib/utils';
import React, { ReactNode, useState } from 'react';

const HiddenText: React.FC<{
  children: ReactNode;
  className?: string;
}> = props => {
  const [isVisible, setIsVisible] = useState(false);

  const { children } = props;

  const toggleVisibility = () => {
    setIsVisible(prevState => !prevState);
  };

  return (
    <>
      <span
        className={cn('hover:cursor-pointer select-none', props.className)}
        role="button"
        tabIndex={0}
        onClick={toggleVisibility}
      >
        {isVisible ? (
          children
        ) : (
          <span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg lucide lucide-eye-closed"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-.722-3.25" />
              <path d="M2 8a10.645 10.645 0 0 0 20 0" />
              <path d="m20 15-1.726-2.05" />
              <path d="m4 15 1.726-2.05" />
              <path d="m9 18 .722-3.25" />
            </svg>
          </span>
        )}
      </span>
    </>
  );
};

export default HiddenText;
