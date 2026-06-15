import type {StructureResolver} from 'sanity/structure'
import {
  FaBurst,
  FaMusic,
  FaRadio,
  FaCalendarDay,
  FaPenNib,
  FaCalendarWeek,
  FaListUl,
  FaYoutube,
} from 'react-icons/fa6'
import {SotdCalendar} from '../components/SotdCalendar'
import {PlaylistOrder} from '../components/PlaylistOrder'
import {WeeklyRoundupBuilder} from '../components/WeeklyRoundupBuilder'
import {YoutubePicker} from '../components/YoutubePicker'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.listItem()
        .title('Blog')
        .icon(FaBurst)
        .child(
          S.list()
            .id('blog')
            .title('Blog')
            .items([
              S.listItem()
                .title('New YouTube Interview')
                .icon(FaYoutube)
                .child(
                  S.component(YoutubePicker).id('youtube-picker').title('New YouTube Interview'),
                ),
              S.listItem()
                .title('New Good Sh*t Weekly')
                .icon(FaCalendarWeek)
                .child(
                  S.component(WeeklyRoundupBuilder)
                    .id('weekly-builder-blog')
                    .title('New Good Sh*t Weekly'),
                ),
              S.divider(),
              S.documentTypeListItem('post').title('All Posts').icon(FaListUl),
            ]),
        ),
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
