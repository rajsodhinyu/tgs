import {defineField, defineType} from 'sanity'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {CroppedImageInput} from '../components/CroppedImageInput'

export const playlistType = defineType({
  name: 'playlist',
  title: 'Playlists',
  type: 'document',
  initialValue: {
    name: 'Unused Playlist',
  },
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: true,
    }),
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
      hidden: true,
    }),
    defineField({
      name: 'thumb',
      title: 'Cover',
      description: 'Square crop is shown',
      type: 'image',
      components: {
        input: CroppedImageInput,
      },
      options: {
        hotspot: {
          previews: [{title: '1:1 (Square)', aspectRatio: 1}],
        },
        sources: [mediaAssetSource],
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.crop) {
            return 'Cover must be cropped'
          }
          return true
        }),
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
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'thumb',
    },
  },
})
