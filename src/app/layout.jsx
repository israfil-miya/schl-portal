import { Karla, Lato } from "next/font/google";
import "./globals.css";

import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const karla = Karla({ subsets: ["latin"], weight: "400" });
const lato = Lato({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "SCHL - ORDERS",
  description: "Professional photo editing and retouching services",
};



export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${karla.className} ${lato.className}`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
