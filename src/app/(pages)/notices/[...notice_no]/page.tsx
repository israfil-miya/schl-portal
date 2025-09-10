import React from 'react';
import ViewNotice from './components/View';

const NoticeView = ({ params }: { params: { notice_no: string } }) => {
  const { notice_no } = params;

  return (
    <>
      <div className="px-4 mt-8 mb-4">
        <ViewNotice notice_no={notice_no} />
      </div>
    </>
  );
};

export default NoticeView;
