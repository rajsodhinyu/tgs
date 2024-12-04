import { defineField, defineType } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";

export const sotdType = defineType({
    name: 'sotd',
    title: 'Song of the day',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Song Title',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'file',
            title: 'Audio file upload',
            type: 'file',
            options: {sources: [mediaAssetSource]},
            validation: rule => rule.required()
        }),
        defineField({
            name: 'datetime',
            title: 'Date/time to release',
            type: 'datetime',
            validation: rule => rule.required()
        }),
        
        
        
    ],
    orderings: [
        {
          title: 'Publish Date',
          name: 'releaseDateDesc',
          by: [
            {field: 'datetime', direction: 'desc'}
          ]
        },
    ]
})