# Testing Core Svelte

The testing of package `core-svelte` is no longer done using vitest and jsdom. 
The reason is that most component need much effort behind the scenes, like the 
node model and the box model that need to be created. Testing using vitest and jsdom
was too time-consuming.

As a replacement, there are a few pages under src/routes, where the component are used.
They are used as independent and stand-alone as possible, while maintaining their behavior.
To open the pages in the browser use `npm run dev`.
To open the pages in the browser use `npm run dev`.
