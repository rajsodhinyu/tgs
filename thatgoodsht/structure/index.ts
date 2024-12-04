import type {StructureResolver} from 'sanity/structure'
import { BsCalendar2Heart, BsPerson, BsPencilSquare } from "react-icons/bs"
import { FaBurst, FaCalendarDays,FaSpotify,FaRegUser } from "react-icons/fa6";


export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Backend')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDays),
      S.documentTypeListItem('writer').title('Writers').icon(FaRegUser),
      S.documentTypeListItem('playlist').title('Playlists').icon(FaSpotify),
    ])
