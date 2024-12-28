import type {StructureResolver} from 'sanity/structure'
import { FaBurst,FaSpotify,FaListCheck,FaRadio, FaCalendarDay,FaUser } from "react-icons/fa6";


export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDay),
      S.documentTypeListItem('writer').title('Writers').icon(FaUser),
      S.divider(),
      S.documentTypeListItem('albums').title('2024 Top 50').icon(FaListCheck),
      S.documentTypeListItem('playlist').title('Playlists').icon(FaSpotify),
      S.documentTypeListItem('sotd').title('Songs Of The Day').icon(FaRadio),
      
    ])
