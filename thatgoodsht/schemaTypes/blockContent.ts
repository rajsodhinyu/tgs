import {defineType, defineArrayMember} from 'sanity'
import {PlayIcon, ImageIcon} from '@sanity/icons'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
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
      type: 'image',
      options: {hotspot: true},
      icon: ImageIcon,
    }),
    defineArrayMember({
      title: 'Spotify',
      name: 'spotifyEmbed',
      icon: PlayIcon,
      type: 'object',
      fields: [
        {
          title: 'Spotify URL',
          name: 'url',
          type: 'url',
          description: 'Paste the Spotify playlist, album, or track URL',
          validation: (Rule) =>
            Rule.required()
              .uri({
                scheme: ['https'],
                allowRelative: false,
              })
              .custom((url) => {
                if (!url?.includes('spotify.com')) {
                  return 'URL must be a valid Spotify link'
                }
                return true
              }),
        },
      ],
      preview: {
        select: {
          title: 'url',
          subtitle: 'caption',
        },
        prepare({title, subtitle}) {
          return {
            title: 'Spotify Embed',
            subtitle: subtitle || title,
          }
        },
      },
    }),
  ],
})
