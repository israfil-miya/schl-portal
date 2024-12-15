import React, { ReactElement, ReactNode, useState } from 'react';

const replaceNewlineWithBr = (text: string) => {
  const lines: string[] = text.split('\n');
  const truncatedText = lines.slice(0, 1).join(''); // Display only the first line
  const remainingLines = lines.slice(1);

  return (
    truncatedText +
    (remainingLines.length > 0 ? '<br/>' : '') +
    remainingLines.join('<br/>')
  );
};

interface PropsType {
  data: string;
  len?: number;
}

const ExtendableTd: React.FC<PropsType> = ({
  data,
  len = 25,
}): ReactElement<HTMLTableCellElement> | null => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  if (data === undefined) return null;

  return (
    <td
      className="text-wrap"
      style={{ padding: '2.5px 10px', minWidth: '250px' }}
    >
      {showFullText ? (
        <span
          dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(data) }}
        />
      ) : (
        <span className="text-nowrap">
          {data?.length <= len ? data : data?.substring(0, len).trim() + '...'}
        </span>
      )}
      {data?.length > len && (
        <small
          className="opacity-80 hover:cursor-pointer hover:underline hover:opacity-100 pl-1"
          onClick={toggleText}
        >
          {/* <br /> */}
          {showFullText ? 'Show Less' : 'Show More'}
        </small>
      )}
    </td>
  );
};

export default ExtendableTd;
