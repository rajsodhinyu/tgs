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

const bitcount_fill = localFont({
  src: '../../font_title.ttf',
  display: 'swap',
  variable: '--font-bitcount-filled',
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
      <head>
        <title>ThatGoodSh*t!</title>
      </head>
      <body className={`${bitcount.variable} ${roc.variable} ${bitcount_fill.variable}`}>
        
        <main>{children}</main>
      </body>
    </html>
  )
}
