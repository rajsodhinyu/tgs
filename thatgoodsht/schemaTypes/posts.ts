import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import blockContent from './blockContent'

export const postType = defineType({
  name: 'post',
  title: 'Blog',
  type: 'document',
  initialValue: {
    name: 'New Blog',
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'youtubeURL',
      title: 'Youtube Link (optional)',
      description: 'If provided, will display as embedded video instead of banner image',
      type: 'url',
    }),
    defineField({
      name: 'thumb',
      title: 'Thumbnail',
      description: 'Must be cropped to a square before uploading!',
      type: 'image',
      options: {sources: [mediaAssetSource]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'banner',
      title: 'Banner (optional)',
      description: 'Optional image, must be cropped to 16:9! Not used if YouTube link is provided.',
      type: 'image',
      options: {sources: [mediaAssetSource], hotspot: true},
    }),
    defineField({
      name: 'writer',
      title: 'Writer (optional)',
      type: 'reference',
      to: [{type: 'writer'}],
      options: {
        disableNew: true,
      },
    }),
    defineField({
      name: 'playlistURL',
      title: 'Primary Spotify Embed',
      description: 'Will go underneath the title!',
      type: 'url',
    }),
    defineField({
      name: 'content',
      title: 'Article',
      type: 'blockContent',
      description:
        'Links must start with https:// and are pink, Italics are purple. Enters and Shift-Enters are treated differently! Check formatting before posting.',
    }),
    defineField({
      name: 'slug',
      title: 'URL Generator',
      type: 'slug',
      options: {source: 'name'},
      description: 'thatgoodsht.com/blog/post/',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {
        dateFormat: 'MMMM Do',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'private',
      title: 'Keep post hidden',
      description:
        'Hide this post from site? Direct link will still work. Use direct link to preview your post before launching, then uncheck to post on site.',
      type: 'boolean',
      initialValue: true,
      options: {
        layout: 'checkbox',
      },
    }),
    defineField({
      name: 'file',
      title: 'Audio file (optional)',
      type: 'file',
      hidden: true,
    }),
  ],
  orderings: [
    {
      title: 'Publish Date',
      name: 'releaseDateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'content',
      media: 'thumb',
    },
  },
})
