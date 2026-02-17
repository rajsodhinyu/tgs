import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {getImageDimensions} from '@sanity/asset-utils'
import blockContent from './blockContent'
import {CroppedImageInput} from '../components/CroppedImageInput'
import {SlugWithVisit} from '../components/SlugWithVisit'
import {UrlWithVisit} from '../components/UrlWithVisit'
import {DateWithToday} from '../components/DateWithToday'

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
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumb',
      title: 'Thumbnail',
      type: 'image',
      components: {
        input: CroppedImageInput,
      },
      options: {
        sources: [mediaAssetSource],
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.asset?._ref) return true
          const {width, height} = getImageDimensions(value.asset._ref)
          if (Math.abs(width / height - 1) > 0.05) return 'Thumbnail is not a square.'
          return true
        }),
    }),
    defineField({
      name: 'youtubeURL',
      title: 'Link to Youtube Video',
      type: 'url',
      components: {
        input: UrlWithVisit,
      },
      validation: (rule) =>
        rule.custom((youtubeURL, context) => {
          const banner = context.document?.banner
          if (!youtubeURL && !banner) {
            return 'Upload either a banner or a Youtube video for the top of the page.'
          }
          return true
        }),
    }),
    defineField({
      name: 'banner',
      title: 'Banner (shown if no video)',
      type: 'image',
      components: {
        input: CroppedImageInput,
      },
      options: {
        sources: [mediaAssetSource],
      },
      validation: (rule) =>
        rule.custom((banner, context) => {
          const youtubeURL = context.document?.youtubeURL
          if (!youtubeURL && !banner) {
            return 'Upload either a banner or a Youtube video for the top of the page.'
          }
          if (banner?.asset?._ref) {
            const {width, height} = getImageDimensions(banner.asset._ref)
            if (Math.abs(width / height - 16 / 9) > 0.05) return 'Banner is not 16:9.'
          }
          return true
        }),
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
      hidden: true,
    }),
    defineField({
      name: 'appleMusicURL',
      title: 'Apple Music Embed',
      description: 'Apple Music equivalent (shows switcher if both are provided)',
      type: 'url',
      hidden: true,
    }),
    defineField({
      name: 'slug',
      title: 'Direct Link',
      type: 'slug',
      components: {
        input: SlugWithVisit,
      },
      options: {source: 'name'},
      description: 'thatgoodsht.com/blog/post/',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'private',
      title: 'Hide post from blog (direct link will still work)',
      type: 'boolean',
      initialValue: true,
      hidden: true,
    }),
    defineField({
      name: 'content',
      title: 'Article',
      type: 'blockContent',
      description: 'Publish and visit your article before setting it to public.',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      components: {
        input: DateWithToday,
      },
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
