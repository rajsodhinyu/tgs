# ThatGoodSht - Independent Music Curation
![image](https://github.com/user-attachments/assets/9608cef0-d8ca-482d-92c9-91991ba2961d)

[ThatGoodSht](https://www.instagram.com/thatgoodsht) is a community-building initiative dedicated to platforming music with complete independence. We interview musicians, produce shows, and curate playlists for our online community and in Brooklyn, New York. [thatgoodsht.com](thatgoodsht.com) is the website reflecting years of that effort. Through this platform, community members listen to daily music, read about their favorite artists, and purchase merch. Special thanks and all artistic rights to ThatGoodSht - Annabelle, Dahmin, Raj, Ria, Quincy.

This project is an endeavor to empower curators and creators - most content on the site are easily changed through the backend portal. Overviews of the core features can be found below, and more can be found in the repos for the [frontend](/next-js) (Next, p5, Tailwind) and the [backend](/thatgoodsht) (Sanity, GROQ). 
## /blog
![image](https://github.com/user-attachments/assets/1563210f-42ce-4e65-a3e3-381429f93e80)
The blog provides fast access to all curation: a featured story above playlists with writing and video interviews in a sidebar. This sidebar automatically pulls posts from the archive and doesn't re-render when posts are selected or changed. The playlists name, link, and image are changed monthly by the team using the custom [backend](/thatgoodsht). Every instance of curation is free to be changed by the team and doesn't require any technical expertise. The [archive](https://www.thatgoodsht.com/blog-archive) contains all past blog posts, both written pieces and YouTube interviews - a necessity in 2025 when social platforms can disappear at any moment. 
## Song of the Day
![image](https://github.com/user-attachments/assets/4b1cc60a-6200-414d-9445-55b8472bd0ea)
The song of the day [visualizer](/next-js/src/app/ui/Backround.tsx) is natively written in [p5.js](https://github.com/processing/p5.js) and with a slight tweak, rendered on-page. As it's a component written with p5, its possible to bring over any kind of p5 code and, with a little bit of effort, mount it onto the TGS site. Pull requests are open.
## /events
![image](https://github.com/user-attachments/assets/e7c19953-9330-493b-b51d-f000f030c43e)
At the heart of TGS is the collective love for live music. TGS throws a variety of events across Brooklyn, Los Angeles, Chicago, etc. For the `/events` page, the Sanity client pulls an optimally sized version of each flyer and then links that image to tickets or an instagram post that highlights the event. The high-resolution flyer image and event details is all mutable through the backend, and syncs in under a minute.

## /shop
![image](https://github.com/user-attachments/assets/61637811-2fe1-4a00-9b9b-8917399bff89)
The shop uses the free Shopify headless App and the Shopify API for client, cart, and checkout. All product details are hardcoded for pre-loading via Next. Forms in the product page pass product information to a /shop/add page that then stores the desired product (size, color, quantity) in the cart ID stored in the user's cookies. Carts are assigned to users who visit the store with empty cookies and their checkout button is encoded to that cartID. In this way, cookies aren't necessary to checkout but are utilized in case a customer comes back later.

## Custom Backend
![image](https://github.com/user-attachments/assets/4fc02e45-2e0f-46b2-886e-cc2117bc9bc5)
This custom [backend](/thatgoodsht) built on [Sanity](https://www.sanity.io) allows team members to update _all_ content on the blog, events, and the Song of the day in a fast and secure way. 

## Learn More 
You can read more on about the [frontend](/next-js) and the [backend](/thatgoodsht) in their dedicated repositories. To run a local version, fork and run `pnpm dev` in the `next-js` folder (which will pull from the TGS content delivery network automatically).