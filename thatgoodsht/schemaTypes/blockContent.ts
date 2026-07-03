import React from 'react'
import {defineType, defineArrayMember} from 'sanity'
import {mediaAssetSource} from 'sanity-plugin-media'
import {TrackSearchInput} from '../components/TrackSearchInput'
import {PlaylistPickerInput} from '../components/PlaylistPickerInput'
import {FaMusic, FaImages} from 'react-icons/fa6'
import {RiPlayListFill} from 'react-icons/ri'
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
          title: 'Heading',
          name: 'heading',
          type: 'string',
        },
        {
          title: 'Subheading',
          name: 'subheading',
          type: 'string',
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
          heading: 'heading',
          albumArt: 'albumArt',
          alignment: 'alignment',
        },
        prepare({trackName, artistName, heading, albumArt, alignment}) {
          const arrow = alignment === 'right' ? '◨ ' : '◧ '
          return {
            title: arrow + (heading || (trackName ? `${trackName} – ${artistName}` : 'Track')),
            subtitle: artistName || '',
            media: albumArt ? React.createElement('img', {src: albumArt}) : undefined,
          }
        },
      },
    }),
    defineArrayMember({
      title: 'Playlist',
      name: 'playlistEmbed',
      icon: RiPlayListFill,
      type: 'object',
      components: {
        input: PlaylistPickerInput,
      },
      fields: [
        {
          title: 'Name',
          name: 'name',
          type: 'string',
        },
        {
          title: 'Description',
          name: 'description',
          type: 'string',
        },
        {
          title: 'Cover URL',
          name: 'coverUrl',
          type: 'string',
        },
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
      ],
      preview: {
        select: {
          name: 'name',
          description: 'description',
          coverUrl: 'coverUrl',
        },
        prepare({name, description, coverUrl}) {
          return {
            title: name || 'Playlist',
            subtitle: description || '',
            media: coverUrl ? React.createElement('img', {src: coverUrl}) : undefined,
          }
        },
      },
    }),
    defineArrayMember({
      title: 'Carousel',
      name: 'photoAlbum',
      icon: FaImages,
      type: 'object',
      fields: [
        {
          title: 'Caption (optional)',
          name: 'title',
          type: 'string',
          description: 'Shown under the album on the site',
        },
        {
          title: 'Photos',
          name: 'images',
          type: 'array',
          description:
            'Drop a whole batch of files here to upload them all at once. Drag to reorder.',
          options: {layout: 'grid'},
          of: [
            {
              type: 'image',
              options: {hotspot: true, sources: [mediaAssetSource]},
              fields: [
                {
                  title: 'Alt text',
                  name: 'alt',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
      preview: {
        select: {
          title: 'title',
          images: 'images',
          firstImage: 'images.0',
        },
        prepare({title, images, firstImage}) {
          const count = images ? Object.keys(images).length : 0
          return {
            title: title || 'Photo Album',
            subtitle: `${count} photo${count === 1 ? '' : 's'}`,
            media: firstImage,
          }
        },
      },
    }),
  ],
})
