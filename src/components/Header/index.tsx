import { auth } from '@/auth';
// import { SessionProvider } from 'next-auth/react';
import React from 'react';
import Nav from './Nav';
import Topbar from './Topbar';

interface PropsType {
  msg?: string | undefined;
}

const Header: React.FC<PropsType> = async props => {
  return (
    <>
      <Topbar />
      {/* <SessionProvider session={session}> */}
      <Nav className="max-lg:hidden" msg={props.msg} />
      {/* </SessionProvider> */}
    </>
  );
};

export default Header;
