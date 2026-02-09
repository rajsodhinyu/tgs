import type {StructureResolver} from 'sanity/structure'
import {FaBurst, FaMusic, FaRadio, FaCalendarDay, FaPenNib} from 'react-icons/fa6'
import {SotdCalendar} from '../components/SotdCalendar'
import {PlaylistOrder} from '../components/PlaylistOrder'

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
      S.listItem()
        .title('Playlists')
        .icon(FaMusic)
        .child(S.component(PlaylistOrder).id('playlist-order')),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDay),
      S.documentTypeListItem('writer').title('Writers').icon(FaPenNib),
    ])
