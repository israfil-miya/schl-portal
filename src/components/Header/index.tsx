import React from 'react';
import Topbar from './Topbar';
import Nav from './Nav';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

interface PropsType {
  msg?: string | undefined;
}

const Header: React.FC<PropsType> = async (props) => {
  let session = await auth();

  return (
    <>
      <Topbar />
      <SessionProvider session={session}>
        <Nav className="max-lg:hidden" msg={props.msg} />
      </SessionProvider>
    </>
  );
};

export default Header;
