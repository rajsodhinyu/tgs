import type {StructureResolver} from 'sanity/structure'
import { BsCalendar2Heart, BsPerson, BsPencilSquare } from "react-icons/bs"
import { FaBurst, FaCalendarDays,FaSpotify,FaRegUser,FaRadio, FaCalendarDay } from "react-icons/fa6";


export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDay),
      S.documentTypeListItem('writer').title('Writers').icon(FaRegUser),
      S.divider(),
      S.documentTypeListItem('playlist').title('Playlist Links').icon(FaSpotify),
      S.documentTypeListItem('sotd').title('Song Of The Day').icon(FaRadio),
      
    ])
