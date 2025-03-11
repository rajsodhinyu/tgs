# ThatGoodSht.com 
Welcome to the frontend repository for [thatgoodshit.com](https://www.thatgoodshit.com)! This is a dynamic and modern platform housing independent music curation straight out of Brooklyn New York. The design of this site is inspired by the bright pixel games of the early internet, a period also marked by the open and fluid mixtape era. 
The implementation relies heavily upon the 'layout' and caching system of Next in order to mimimize pointless server fetches and to maximize performance on mobile. In Next, different `layout` files stack on upon the UI as the user navigates through the file tree - a full width picture is a different size depending on how deep into the file tree the user is.

## Persistent Song of the Day
![image](https://github.com/user-attachments/assets/419ee95a-f25f-4be1-959c-314714e59922)
The song of the day widget continues to play both after leaving the root page and if the user switches apps on mobile. The core logic playing the song is housed in the root layout [file](src/app/layout.tsx) - that is, the song is fetched once from the server upon initial site load and then not again. The song then plays uninterrupted as the layout is not re-rendered. However, this means that many of the standard HTML elements should be their Next (capitalized) versions as to prevent a full site reload. 
## /blog/post/
![image](https://github.com/user-attachments/assets/8455bc02-b5bb-49ef-998a-6af93eb73d19)
Each blog post renders on the left, as the sidebar is a part of the `/blog` layout and hence only rendered once. The spotify embed is controllable through the backend, and is fully playable if the user is signed into Spotify on a different tab. 
