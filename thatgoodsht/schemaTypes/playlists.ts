import { defineField, defineType } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";

export const playlistType = defineType({
    name: 'playlist',
    title: 'Playlist',
    type: 'document',
    initialValue: {
        name: 'Untitled Playlist'
      },
    fields: [
        defineField({
            name: 'title',
            title: 'Admin - playlistID',

            type: 'string',
            validation: rule => rule.required(),
            hidden: true
        }),

        defineField({
            name: 'order',
            title: 'Admin - playlistOrder',

            type: 'number',
            validation: rule => rule.required(),
            hidden: true
        }),
        defineField({
            name: 'thumb',
            title: 'Cover',
            description: 'Square crop is shown',
            type: 'image',
            options: {sources: [mediaAssetSource], hotspot:true},
            validation: rule => rule.required()
        }),
        defineField({
            name: 'name',
            title: 'Title',
            description: 'Shown on site',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'description',
            title: 'Playlist Description',
            description: 'Shown under title',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'playlistURL',
            title: 'Spotify URL',
            description: 'Must start with https://',
            type: 'url',
            validation: rule => rule.required()
        }),
        
    ]
})