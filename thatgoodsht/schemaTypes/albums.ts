import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'

export const albumType = defineType({
  name: 'albums',
  title: 'TGS Top 50 - 2025',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Album',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'writer',
      title: 'Writer',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      initialValue: 2025,
      validation: (rule) => rule.required(),
      hidden: true,
    }),
    defineField({
      name: 'datetime',
      title: 'Released',
      type: 'date',
      validation: (rule) => rule.required(),
      options: {
        dateFormat: 'MMMM Do',
      },
    }),
    defineField({
      name: 'URL',
      title: 'Spotify URL',
      type: 'url',
    }),
    defineField({
      name: 'thumb',
      title: 'Album Cover',
      description: 'Square, you can get from covers.musichoarders.xyz',
      type: 'image',
      options: {sources: [mediaAssetSource]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Generator',
      type: 'slug',
      options: {source: 'name'},
      description: 'thatgoodsht.com/feature/2025/',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Review',
      type: 'array',
      of: [{type: 'block'}],
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'January to December',
      name: 'releaseDateDesc',
      by: [{field: 'datetime', direction: 'asc'}],
    },
    {
      title: 'Artist A-Z',
      name: 'artistAlpha',
      by: [{field: 'artist', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'artist',
      media: 'thumb',
    },
  },
})
