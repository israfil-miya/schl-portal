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
}

const ExtendableTd: React.FC<PropsType> = (
  props,
): ReactElement<HTMLTableCellElement> | null => {
  const { data } = props;

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
          {data?.length <= 25 ? data : data?.substring(0, 25).trim() + '...'}
        </span>
      )}
      {data?.length > 25 && (
        <small
          className="opacity-80 hover:cursor-pointer hover:underline hover:opacity-100"
          onClick={toggleText}
        >
          <br />
          {showFullText ? 'Show Less' : 'Show More'}
        </small>
      )}
    </td>
  );
};

export default ExtendableTd;
