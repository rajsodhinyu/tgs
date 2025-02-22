import { defineField, defineType } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";

export const sotdType = defineType({
    name: 'sotd',
    title: 'Songs Of The Day',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Title',
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
            name: 'datetime',
            title: 'Date and time to release',
            description: 'Pick a date with calendar button, time is in military.',
            type: 'datetime',
            initialValue: '2024-12-01T13:00:00Z',
            validation: rule => rule.required().min('2024-12-01T13:00:00Z'),
            options: {
                dateFormat: 'dddd, MMMM Do',
                timeFormat: '- h:mm A',
                timeStep: 30,
              }
        }),
        defineField({
            name: 'file',
            title: 'Attach file',
            description: '.mp3 only',
            type: 'file',
            options: {
                sources: [mediaAssetSource],
                storeOriginalFilename: false,
                accept: 'audio/mpeg',
            },
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
        {
            title: 'Release Date, Old',
            name: 'releaseDateDesc',
            by: [
              {field: 'datetime', direction: 'asc'}
            ]
          },
    ],
    preview: {
        select: {
          title: 'name',
          subtitle: 'datetime',
          artist: 'artist'
        },
        prepare(selection) {
            const {title, subtitle, artist} = selection
            let dateObj = new Date(subtitle)
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
            return {
              title: `${title} - ${artist}`,
              subtitle: `${months[dateObj.getMonth()]} ${dateObj.getDate()}`
            }
          }
      }
})