import { defineField, defineType } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";

export const postType = defineType({
    name: 'post',
    title: 'Blog',
    type: 'document',
    initialValue: {
        name: 'New Blog'
      },
    fields: [
        
        defineField({
            name: 'name',
            title: 'Headline',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'youtube',
            title: 'Check to upload just a YouTube interview',
            description: 'Leave unchecked to upload a blog post',
            type: 'boolean',
            initialValue: false,
            options: {
                layout: 'checkbox'
            },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'youtubeURL',
            title: 'Youtube Link',
            type: 'url',
            hidden: ({document}) => !document?.youtube, //show the field if it is a Youtube Post
            validation: rule => {
                if (!document.hidden) {
                    return rule.required()
                }
                else {return rule}
            }
        }),
        defineField({
            name: 'thumb',
            title: 'Thumbnail',
            description: 'Square image shown in the sidebar',
            type: 'image',
            options: {sources: [mediaAssetSource]},
            validation: rule => rule.required()

        }),
        defineField({
            name: 'writer',
            type: 'reference',
            to: [{type: 'writer'}],
            hidden: ({document}) => !(!document?.youtube), //hide the field if it is a Youtube Post
            options: {
                disableNew: true
            },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'banner',
            title: 'Banner',
            description: 'Optional wide image. Otherwise the thumbnail is shown at the top',
            type: 'image',
            hidden: ({document}) => !(!document?.youtube), //hide the field if it is a Youtube Post
            options: {hotspot: true},
        }),
        defineField({
            name: 'playlistURL',
            title: 'Spotify Embed',
            description: 'Optional',
            type: 'url',
            hidden: ({document}) => !(!document?.youtube), //show the field if it is a Youtube Post
        }),
        defineField({
            name: 'content',
            title: 'Blog text',
            type: 'array', 
            of: [{type: 'block'}],
            hidden: ({document}) => !(!document?.youtube), //hide the field if it is a Youtube Post
            description: 'Paste here',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'URL',
            type: 'slug',
            options: {source: 'name'},
            description: 'thatgoodshitmusic.com/blog/',
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
            hidden: true
        }),
    ]
})