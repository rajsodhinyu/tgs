import { defineField, defineType } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";

export const albumType = defineType({
    name: 'albums',
    title: 'Top 50 Album Reviews',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Album',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'artist',
            title: 'Artist',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
                    name: 'writer',
                    title: 'Writer',
                    type: 'string',
                    validation: rule => rule.required()
                }),
        defineField({
            name: 'datetime',
            title: 'Released',
            type: 'date',
            validation: rule => rule.required(),
            options: {
                dateFormat: 'MMMM Do'
              }
        }),
        defineField({
            name: 'URL',
            title: 'Spotify URL',
            type: 'url',
            validation: rule => rule.required(),
        }),
        defineField({
            name: 'thumb',
            title: 'Album Cover',
            description: 'Square, you can get from covers.musichoarders.xyz',
            type: 'image',
            options: {sources: [mediaAssetSource]},
            validation: rule => rule.required()
        }),
        defineField({
                    name: 'content',
                    title: 'Review',
                    type: 'array', 
                    of: [{type: 'block'}],
                    validation: rule => rule.required()
                }),
    ],
    orderings: [
        {
          title: 'Release Date, New',
          name: 'releaseDateDesc',
          by: [
            {field: 'datetime', direction: 'desc'}
          ]
        },
    ],
    preview: {
        select: {
          title: 'name',
          subtitle: 'artist',
          media: 'thumb'
        },
      }
})