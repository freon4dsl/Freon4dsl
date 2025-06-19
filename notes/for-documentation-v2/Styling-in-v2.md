# Styling the Webapp

## Styling core-svelte

The styles that are used in core-svelte are plain css styles in a series of files:

-list file names

These files can be directly included in the main.css file in your project. (EXample)
If you want to change any of the styles you copy the style files to your local folder
and change the styles that you want changed. Do not include the file from node-modules,
instead include the local file.

## Theming
This will happen often for the colors, therefore we 
have extracted all used colors in a separate css file called 'TODO'. Again, simply copy 
the file to your local folder and change the colors.

### Dark mode
An exception to this is the coloring for dark mode, because there are different manners 
in which to toggle dark and light mode. The tailwind based webapp uses a CSS selector to
toggle between dark and light mode, which basically means that the css for dark mode is
prefixed with a '.dark' selector (Example)

Therefore, there are two css files in core-svelte that contain styles for dark mode, one
with this selector and one without. (Names) Choose which file to include in your main css
based on the manner in which the dark mode option is implemented.

# Styling the Flowbite Webapp

The styles used in the Flowbite webapp are, although they are provided as a Tailwind based css
in the file 'lib-styles.css'. It can be found in (location). This file must also be included in the main css.

It is not minified, so human-readable, and styles can be changed at will. For a smaller css to be 
used in your project minify the resulting main.css.

The theme colors can be overridden. For this purpose the file './styles/theme-colors-override.css' is provided.
As is, it holds the precise definitions that are used as default in core-svelte and weblib-flowbite, but
when changed the default values will be overridden. Make sure to add this file after all other imports in the
main css file.

The main css file is './styles/webapp-styles.css'.
