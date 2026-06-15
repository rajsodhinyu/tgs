import type {StructureResolver} from 'sanity/structure'
import {
  FaBurst,
  FaMusic,
  FaRadio,
  FaCalendarDay,
  FaPenNib,
  FaCalendarWeek,
  FaPlus,
  FaListUl,
} from 'react-icons/fa6'
import {SotdCalendar} from '../components/SotdCalendar'
import {PlaylistOrder} from '../components/PlaylistOrder'
import {WeeklyRoundupBuilder} from '../components/WeeklyRoundupBuilder'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('thatgoodsht.com')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(FaBurst),
      S.listItem()
        .title('Good Sh*t Weekly')
        .icon(FaCalendarWeek)
        .child(
          S.list()
            .id('weekly')
            .title('Good Sh*t Weekly')
            .items([
              S.listItem()
                .title('New Roundup')
                .icon(FaPlus)
                .child(S.component(WeeklyRoundupBuilder).id('weekly-builder').title('New Roundup')),
              S.listItem()
                .title('Published Roundups')
                .icon(FaListUl)
                .child(
                  S.documentList()
                    .id('weekly-list')
                    .title('Good Sh*t Weekly')
                    .schemaType('post')
                    .filter('_type == "post" && weekly == true')
                    .defaultOrdering([{field: 'date', direction: 'desc'}]),
                ),
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
