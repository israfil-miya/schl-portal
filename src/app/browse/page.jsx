import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {headers} from "next/headers"
import Navbar from "@/components/navbar/Navbar";

export default async  function Page() {
  const session = await getServerSession(authOptions);
  return (
    <>
     <Navbar navFor={"browse"} session={session} />
     HELLO BROTHER
    </>
  )
}
