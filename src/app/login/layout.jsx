import { Karla, Lato } from 'next/font/google'
import '@/app/globals.css'
import Provider from "@/app/context/client-provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const karla = Karla({ subsets: ['latin'], weight: "400" })
const lato = Lato({ subsets: ['latin'], weight: "400" })

export const metadata = {
  title: 'SCHL - LOGIN',
  description: 'Professional photo editing and retouching services',
}

export default async function LoginLayout({ children }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body className={`${karla.className} ${lato.className}`}>
      <Provider session={session}>
          {children}
      </Provider>
      </body>
    </html>
  )
}
