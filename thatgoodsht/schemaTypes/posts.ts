import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'

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
      name: 'youtube',
      title: 'Check to upload just a YouTube interview',
      description: 'Leave unchecked to upload a blog post',
      type: 'boolean',
      initialValue: false,
      options: {
        layout: 'checkbox',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'youtubeURL',
      title: 'Youtube Link',
      description: 'Needs to start with https://www.',
      type: 'url',
      hidden: ({document}) => !document?.youtube, //show the field if it is a Youtube Post
      validation: (rule) =>
        rule.custom((youtubeURL, context) => {
          if (context.document?.youtube && context.document?.youtubeURL == undefined) {
            return 'Please add a Link'
          }
          return true
        }),
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
      title: 'Banner',
      description: 'Optional image, must be cropped to 16:9!',
      type: 'image',
      hidden: ({document}) => !!document?.youtube, //hide the field if it is a Youtube Post
      options: {sources: [mediaAssetSource], hotspot: true},
    }),
    defineField({
      name: 'writer',
      type: 'reference',
      to: [{type: 'writer'}],
      hidden: ({document}) => !!document?.youtube, //hide the field if it is a Youtube Post
      options: {
        disableNew: true,
      },
      validation: (rule) =>
        rule.custom((writer, context) => {
          // make required if blog post
          if (!context.document?.youtube && context.document?.writer == undefined) {
            return 'Required'
          }
          return true
        }),
    }),
    defineField({
      name: 'playlistURL',
      title: 'Spotify Embed',
      description: 'Optional',
      type: 'url',
    }),
    defineField({
      name: 'content',
      title: 'Article',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'All links must start with https:// and are pink, Italics are purple. Check formatting before posting. Enters and Shift-Enters are treated differently!',
      validation: (rule) =>
        rule.custom((writer, context) => {
          // make required if blog post
          if (!context.document?.youtube && context.document?.content == undefined) {
            return 'Required'
          }
          return true
        }),
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
