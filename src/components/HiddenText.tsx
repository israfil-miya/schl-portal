'use client';
import { EyeOff } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

const HiddenText: React.FC<{
  children: ReactNode;
  className: string;
}> = props => {
  const [isVisible, setIsVisible] = useState(false);

  const { children } = props;

  const toggleVisibility = () => {
    setIsVisible(prevState => !prevState);
  };

  return (
    <>
      <span
        className="link hover:cursor-pointer hover:underline select-none"
        role="button"
        tabIndex={0}
        onClick={toggleVisibility}
      >
        {isVisible ? (
          children
        ) : (
          <span>
            <EyeOff size={18} />
          </span>
        )}
      </span>
    </>
  );
};

export default HiddenText;
