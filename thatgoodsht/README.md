# The TGS Content Management System
![image](https://github.com/user-attachments/assets/7bfdf934-8d3a-4633-b0d9-b6f3e2c33dfe)
Welcome to the TGS Backend! This backend is custom-built on [Sanity Studio](sanity.io) in order to allow TGS team members to update site content independently using a fun, fluid and secure interface. I've implemented custom datatypes to validate and simplify posting all content - blog posts, Songs of the Day, curator playlists, and events. Through one secure website, team members can fluidly access and update the site without any technical knowledge! Studio offers SOTA CMS features such as partial save, cloud storage, and will comfortably navigate new database issues without crashing. This system dynamically deploys only valid data to the TGS front-end.
## Ease of Use
Team members log in with their own accounts, upload flyers from their own computers, and publish on their own time-frames. Sanity studio is mobile friendly and only contains the necessary features for TGS. All eddits are timelined and clear, with all the flyer/song/image files being stored in our Sanity Media viewer for easy linking. All data is easily sortable by the team as they would expect when dealing with a CMS like Wordpress.

![image](https://github.com/user-attachments/assets/a0cb7049-228e-4e8e-b3d8-5218b866b08c)

## Custom Datatypes and Validation
The different schemas under [schemaTypes](schemaTypes) validate and organize all TGS data inputted and displayed to the [blog](thatgoodsht.com/blog). These relational schemas include albums, events, playlists, posts, article text, songs of the day, and writers. Each item has its own typescript file and use predefined 'fields' - so each blog post made under the post schema needs to be linked to a writer instance and an article text instance. Validation is the key improvement found here - team members aren't able to publish any content to the site unless all pictures are in the correct format, every post has a writer, and all the slugs are unique.
However, some 'posts' are actually Youtube Interviews, and don't need a writer relation to be uploaded. Instead of creating a new schema, I added conditional validation based on a boolean entered at the top of the editing experience. When the 'blog post' changes to a YouTube interview, I eject the required property for writer, article text, etc. In this way, I extend validation whilst also being able to search/display blog posts alongside YouTube interviews in chronological order.

![image](https://github.com/user-attachments/assets/28684390-1d9b-4f87-be68-07fcd4ec8a2c)
## Custom Projects
For our 2024 [albums of the year feature](https://www.thatgoodsht.com/feature/2024), I simply made a new schema with all the relevant information I wanted to display and pulled all data with that schema on the front end - team members independently selected, wrote about, and uploaded their reviews to the site.

![image](https://github.com/user-attachments/assets/1aca845f-f11f-4b71-9dca-8fd4f9dfe6ee)