import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'

export const playlistType = defineType({
  name: 'playlist',
  title: 'Playlist',
  type: 'document',
  initialValue: {
    name: 'Unused Playlist',
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'frontendID',
      type: 'string',
      validation: (rule) => rule.required(),
      hidden: true,
    }),
    defineField({
      name: 'order',
      title: 'Admin - playlistOrder',
      type: 'number',
      validation: (rule) => rule.required(),
      hidden: true,
    }),
    defineField({
      name: 'thumb',
      title: 'Cover',
      description: 'Square crop is shown',
      type: 'image',
      options: {sources: [mediaAssetSource], hotspot: true},
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Playlist Description',
      description: 'Shown under title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'playlistURL',
      title: 'Spotify Playlist Link',
      description: 'Must start with https://',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'appleMusicURL',
      title: 'Apple Music Playlist Link',
      description: 'Must start with https://',
      type: 'url',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'releaseDateDesc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'thumb',
    },
  },
})
