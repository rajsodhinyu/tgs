import {defineField, defineType} from 'sanity'
import { media, mediaAssetSource } from "sanity-plugin-media";

export const writerType = defineType({
    name: 'writer',
    title: 'Writers',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'image',
            title: 'Picture',
            type: 'image',
            options: {sources: [mediaAssetSource], hotspot:true},
        }),
        defineField({
            name: 'track',
            title: 'Link to favorite track',
            type: 'url'
        }),
        defineField({
            name: 'description',
            title: 'Bio',
            type: 'array', 
            of: [{type: 'block'}]
        })
    ]
})