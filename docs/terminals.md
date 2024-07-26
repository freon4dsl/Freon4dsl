1. root (red)
> cd Freon4dsl
> npm run build

2. language (yellow) - updating the model
> cd Freon4dsl/packages/samples/StudyConfiguration
> npm run build

3. server (cyan) - just run the server
> cd Freon4dsl/packages/server
> npm run start

4. core (magenta) - updating the freon boxes
> cd Freon4dsl/packages/core
> npm run build

5. svelte (magenta) - updating the freon components
> cd Freon4dsl/packages/core-svelte
> npm run build

6. web-lib (blue) - changing the web app layout
> cd Freon4dsl/packages/webapp-lib
> npm run build

7. web (green) - where the app runs
> cd Freon4dsl/packages/webapp-starter
> npm run dev

8. css (white) - changing the light/dark theme
> cd Freon4dsl/packages/webapp-starter
> npm run prepare-app

9. kill
> cd Freon4dsl
> ./stop_app.sh
> ./stop_server.sh
