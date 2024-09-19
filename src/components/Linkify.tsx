import React from 'react';
import Link from 'next/link';

interface PropsType {
  data: string;
  coverText?: string;
}

const Linkify: React.FC<PropsType> = (props) => {
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
              className="block hover:cursor-pointer hover:underline hover:opacity-100 text-blue-700"
              target="_blank"
              href={websiteLink}
            >
              {coverText ? coverText : websiteLink}
            </Link>
          ),
        )}
      <style jsx>{`
        .link {
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default Linkify;
