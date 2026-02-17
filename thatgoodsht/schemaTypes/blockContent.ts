import React from 'react'
import {defineType, defineArrayMember} from 'sanity'
import {TrackSearchInput} from '../components/TrackSearchInput'
import {FaMusic} from 'react-icons/fa6'
export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [],
      lists: [],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting by editors.
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      title: 'Music',
      name: 'trackEmbed',
      icon: FaMusic,
      type: 'object',
      components: {
        input: TrackSearchInput,
      },
      fields: [
        {
          title: 'Spotify URL',
          name: 'spotifyUrl',
          type: 'url',
        },
        {
          title: 'Apple Music URL',
          name: 'appleMusicUrl',
          type: 'url',
        },
        {
          title: 'Track Name',
          name: 'trackName',
          type: 'string',
        },
        {
          title: 'Artist Name',
          name: 'artistName',
          type: 'string',
        },
        {
          title: 'Album Art',
          name: 'albumArt',
          type: 'string',
        },
        {
          title: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          title: 'Blurb',
          name: 'blurb',
          type: 'text',
        },
        {
          title: 'Alignment',
          name: 'alignment',
          type: 'string',
          options: {
            list: [
              {title: 'Left', value: 'left'},
              {title: 'Right', value: 'right'},
            ],
            layout: 'radio',
          },
          initialValue: 'left',
        },
      ],
      preview: {
        select: {
          trackName: 'trackName',
          artistName: 'artistName',
          title: 'title',
          blurb: 'blurb',
          albumArt: 'albumArt',
          alignment: 'alignment',
        },
        prepare({trackName, artistName, title, blurb, albumArt, alignment}) {
          const arrow = alignment === 'right' ? '◨ ' : '◧ '
          return {
            title: arrow + (title || (trackName ? `${trackName} – ${artistName}` : 'Track')),
            subtitle: blurb || '',
            media: albumArt ? React.createElement('img', {src: albumArt}) : undefined,
          }
        },
      },
    }),
  ],
})
