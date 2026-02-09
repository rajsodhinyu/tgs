import type {StructureResolver} from 'sanity/structure'
import {FaBurst, FaSpotify, FaRadio, FaCalendarDay, FaPenNib} from 'react-icons/fa6'
import {SotdCalendar} from '../components/SotdCalendar'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.listItem()
        .title('Radio')
        .icon(FaRadio)
        .child(S.component(SotdCalendar).id('sotd-calendar')),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDay),
      S.documentTypeListItem('playlist').title('Playlists').icon(FaSpotify),
      S.documentTypeListItem('writer').title('Writers').icon(FaPenNib),
    ])
