import {defineField, defineType} from 'sanity'



export const eventType = defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({
        name: 'name',
        title: 'Name',
        type: 'string'
    }),
    defineField({
        name: 'flyer',
        title: 'Flyer',
        type: 'image',
        validation: rule => rule.required()
    }),
    defineField({
        name: 'link',
        title: 'Ticket Link',
        type: 'url',
        validation: rule => rule.required()
    }),
    defineField({
        name: 'date',
        title: 'Date & Start Time',
        type: 'datetime',
        options: {
            dateFormat: 'MMMM Do',
            timeFormat: 'h:mm A',
            timeStep: 15,
        },
        validation: rule => rule.required()
    }),
    defineField({
        name: 'address',
        title: 'Address',
        type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {
        // include category if dataset is production
        source: 'name'
      },
      description: 'thatgoodshitmusic.com/events/',
      validation: rule => rule.required()
  }),
    defineField({
        name: 'description',
        title: 'Details', 
        type: 'array', 
        of: [{type: 'block'}]
      })
  ],
preview: {
    select: {
      name: 'name',
      address: 'address',
      artist: 'headline.name',
      date: 'date',
      image: 'flyer',
    },
    prepare({name, address, artist, date, image}) {
      const nameFormatted = name || 'Untitled event'
      const dateFormatted = date
        ? new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })
        : 'No date'
  
      return {
        title: artist ? `${nameFormatted} (${artist})` : nameFormatted,
        subtitle: address ? `${dateFormatted} at ${address}` : dateFormatted,
        media: image
      }
    },
  },
})