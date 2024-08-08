import { defineField, defineType } from "sanity";

export const postType = defineType({
    name: 'post',
    title: 'Blogs',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Title',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'Writer',
            type: 'reference',
            to: [{type: 'writer'}],
            options: {
                disableNew: true
            },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'date',
            title: 'Date',
            type: 'date',
            options: {
                dateFormat: 'MMMM Do',},
            validation: rule => rule.required()
        }),
        defineField({
            name: 'file',
            title: 'Audio file (optional)',
            type: 'file',
        }),
        defineField({
            name: 'content',
            title: 'Blog text',
            type: 'array', 
            of: [{type: 'block'}],
            description: 'Paste here',
            validation: rule => rule.required()
        })
    ]
})