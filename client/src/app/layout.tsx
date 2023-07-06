import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Polaris',
  description: 'Polaris is an awesome platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{backgroundColor:"#000814"}} className={inter.className}>{children}</body>
    </html>
  )
}
