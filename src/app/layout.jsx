import { Karla, Lato } from 'next/font/google'
import './globals.css'
import Navbar from '../components/navbar/Navbar'
import Provider from "./context/client-provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"

const karla = Karla({ subsets: ['latin'], weight: "400" })
const lato = Lato({ subsets: ['latin'], weight: "400" })

export const metadata = {
  title: 'SCHL Online',
  description: 'Professional photo editing and retouching services',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  return (

    <html lang="en">
      <body className={`${karla.className} ${lato.className}`}>
        <Provider session={session}>
          <Navbar navFor="tasks" />
          {children}
        </Provider>
      </body>
    </html>
  )
}
