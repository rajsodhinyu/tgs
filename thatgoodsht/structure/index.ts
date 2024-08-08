import type {StructureResolver} from 'sanity/structure'
import { BsCalendar2Heart, BsPerson, BsPencilSquare } from "react-icons/bs"


export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Data')
    .items([
      S.documentTypeListItem('post').title('Blog').icon(BsPencilSquare),
      S.documentTypeListItem('event').title('Events').icon(BsCalendar2Heart),
      S.divider(),
      S.documentTypeListItem('writer').title('Writers').icon(BsPerson),
    ])
