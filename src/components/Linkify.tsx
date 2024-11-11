import Link from 'next/link';
import React from 'react';

interface PropsType {
  data: string;
  coverText?: string;
}

const Linkify: React.FC<PropsType> = props => {
  const { data, coverText } = props;

  return (
    <>
      {data
        ?.split(' ')
        .filter((item: string) => item.length)
        .map(
          (websiteLink: string, index: number): React.ReactNode => (
            <Link
              key={index}
              className="block hover:cursor-pointer opacity-80 hover:underline hover:opacity-100 text-accent"
              target="_blank"
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
