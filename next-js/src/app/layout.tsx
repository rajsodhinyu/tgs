import './globals.css'
import Nav from './nav'
import { Inter, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { sanityFetch } from './client'
import { SanityDocument } from 'next-sanity'






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
  title: 'That Good Sh*t',
  description: 'Good Sh*t lives here.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  let song = 'null'

const SONG_QUERY3 = `*[_type == "sotd" && dateTime(datetime) < dateTime(now())] 
  | order(datetime desc, _updatedAt desc)[0] {
    file {
      asset-> {
        url
      }
    }
  }
`

  const songs:any =  await sanityFetch<SanityDocument[]>({query: SONG_QUERY3}); 
  song = `${songs.file.asset.url}`
  return (
    <html lang="en" >
      <head>
        <title>That Good Sh*t!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </head>
      <body className={`${bitcount.variable} ${roc.variable} ${bitcount_fill.variable}`}>
      <audio loop id='myAudio' src={song} ></audio>
        <main>{children}</main>
      </body>
    </html>
  )
}
