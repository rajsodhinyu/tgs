import {eventType} from './event'
import {writerType} from './writer'
import {postType} from './posts'
import {playlistType} from './playlists'
import {sotdType} from './sotd'
import {albumType} from './albums'
import blockContent from './blockContent'

export const schemaTypes = [
  postType,
  eventType,
  writerType,
  playlistType,
  sotdType,
  albumType,
  blockContent,
]
