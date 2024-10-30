import './globals.css'
import Nav from './nav'
import { Inter, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'


const bitcount = localFont({
  src: '../../font.ttf',
  display: 'swap',
  variable: '--font-bitcount',
})

const roc = localFont({
  src: '../../font_body.ttf',
  display: 'swap',
  variable: '--font-roc',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata = {
  title: 'ThatGoodSh*t',
  description: 'Copyright Raj Sodhi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={`mx-10 ${bitcount.variable} ${roc.variable}`}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
