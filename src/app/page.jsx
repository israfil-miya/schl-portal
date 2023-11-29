import Image from 'next/image'
import Navbar from '@/components/navbar/Navbar'

import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function Page({ params, searchParams }) {

  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login?callbackUrl=/')
  }

  return (
    <main>
      <Navbar navFor="orders"/>
      HI
    </main>
  )
}