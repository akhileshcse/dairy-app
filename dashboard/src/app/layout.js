import { Inter } from "next/font/google"
import "./globals.css"
import AuthWrapper from "./components/AuthWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Jamindar Dairy Dashboard",
  description: "Jamindar Dairy – Farm management and tracking system",
  icons: { icon: "/logo.png" },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}
