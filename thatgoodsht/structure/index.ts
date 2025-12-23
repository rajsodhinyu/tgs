import type {StructureResolver} from 'sanity/structure'
import {
  FaBurst,
  FaSpotify,
  FaListCheck,
  FaRadio,
  FaCalendarDay,
  FaClipboardList,
  FaUser,
} from 'react-icons/fa6'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.documentTypeListItem('event').title('Events').icon(FaCalendarDay),
      S.documentTypeListItem('playlist').title('Playlists').icon(FaSpotify),
      S.documentTypeListItem('sotd').title('Song of the Day').icon(FaRadio),
      S.listItem()
        .title('TGS Top 50 - 2025')
        .icon(FaClipboardList)
        .child(
          S.documentList()
            .title('Top 50 Albums 2025')
            .filter('_type == "albums" && year == $year')
            .params({year: 2025}),
        ),
    ])
