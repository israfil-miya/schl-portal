import Link from 'next/link';
import React from 'react';

interface PropsType {
  data: string;
  coverText?: string;
  newTab?: boolean;
}

const Linkify: React.FC<PropsType> = props => {
  const { data, coverText, newTab = true } = props;

  return (
    <>
      {data
        ?.split(' ')
        .filter((item: string) => item.length)
        .map(
          (websiteLink: string, index: number): React.ReactNode => (
            <Link
              key={index}
              className="block hover:cursor-pointer hover:underline hover:opacity-100 text-blue-700"
              target={newTab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              href={websiteLink}
            >
              {coverText ? coverText : websiteLink}
            </Link>
          ),
        )}
    </>
  );
};

export default Linkify;
