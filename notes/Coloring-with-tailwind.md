# Coloring the app and the editor using Tailwind

## The predefined styles in core-svelte, or coloring the editor

The predefined styles are still in core-svelte, but all colors have been changed into variables. These variables are defined in '...color-definitions':

When using plain css, you can define these colors directly. Defining the colors directly would look like this:
```css
/* freon-plain-color-definitions.css */
:root {
    --freon-base-900: #1F1F1F; /* Near-black, deep charcoal gray */
    --freon-base-800: #2D2D2D; /* Very dark neutral gray */
    --freon-base-700: #444444; /* Balanced deep gray */
}
.dark {
    --freon-base-900: #FFFFFF; /* Pure White */
    --freon-base-800: #F4F4F4; /* Light Smoke */
    --freon-base-700: #FFFAF0; /* Floral White */
}
```

When using Tailwind, you can define these colors using the theme from the tailwind config file:

```css
/* freon-tw-theme-color-definitions.css */
:root {
    --freon-base-900: theme(colors.freonLight.900);
    --freon-base-800: theme(colors.freonLight.800);
    --freon-base-700: theme(colors.freonLight.700);
}
.dark {
    --freon-base-900: theme(colors.freonDark.900);
    --freon-base-800: theme(colors.freonDark.800);
    --freon-base-700: theme(colors.freonDark.700);
}
```

Change the colors in the editor by changing the 'freonLight', 'freonDark, 'freonLightAccent', and 'freonDarkAccent' entries in the
Tailwind config file.

## Coloring the Flowbite app

The coloring of the app is done using the Tailwind theme, because the app components are 
created using Flowbite and Tailwind. That means that you have less expressiveness, but you 
can always create your own app if the need arises. (The app provide by Freon was never meant 
to be used in production.)

Change the app colors by changing the 'light', 'dark, 'lightAccent' , 'darkAccent' entries in the
Tailwind config file. The colors you use can certainly be the same as the colors for the
'freonLight', 'freonDark, 'freonLightAccent', and 'freonDarkAccent' entries.

## The Tailwind config

An example of the tailwind config file.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			colors: {
							light: {
								base: {
									50: "#FFE8D9",
									100: "#FFD0B3",
									200: "#FFB88D",
									300: "#FF9F66",
									400: "#FC7307",
									500: "#DB6506",
									600: "#B95805",
									700: "#974A04",
									800: "#753D03",
									900: "#532F02",
								},
								accent: {
									50: "#EEF7E4",  // Very light background color
									100: "#D6E9BA", // Light background color
									200: "#BFD98F", // Lighter surface color
									300: "#A8CA65", // Surface color
									400: "#98CA32", // Slightly darker surface color
									500: "#85B42C", // Main background color
									600: "#709A27", // Text color
									700: "#5B7F20", // Darker text color
									800: "#47651A", // Darker surface accent
									900: "#334C14", // Darkest background color
								},
								freon: {
									50: "#FFE8D9",
									100: "#FFD0B3",
									200: "#FFB88D",
									300: "#FF9F66",
									400: "#FC7307",
									500: "#DB6506",
									600: "#B95805",
									700: "#974A04",
									800: "#753D03",
									900: "#532F02",
								},
								freonAccent: {
									error: "#FF4C4C",
									editable: "#FFD0B3",
									optional: "#DB6506",
									border: "#47651A",
									dropdown: "#5B7F20",
									button: "#98CA32",
								}
							},
							dark: {
								base: {
									50: "#EEF7E4",  // Very light background color
									100: "#D6E9BA", // Light background color
									200: "#BFD98F", // Lighter surface color
									300: "#A8CA65", // Surface color
									400: "#98CA32", // Slightly darker surface color
									500: "#85B42C", // Main background color
									600: "#709A27", // Text color
									700: "#5B7F20", // Darker text color
									800: "#47651A", // Darker surface accent
									900: "#334C14", // Darkest background color
								},
								accent: {
									100: "#FFD0B3",
									200: "#FFB88D",
									300: "#FF9F66",
									400: "#FC7307",
									500: "#DB6506",
									600: "#B95805",
									700: "#974A04",
									800: "#753D03",
									900: "#532F02",
								},
								freon: {
									50: "#EEF7E4",  // Very light background color
									100: "#D6E9BA", // Light background color
									200: "#BFD98F", // Lighter surface color
									300: "#A8CA65", // Surface color
									400: "#98CA32", // Slightly darker surface color
									500: "#85B42C", // Main background color
									600: "#709A27", // Text color
									700: "#5B7F20", // Darker text color
									800: "#47651A", // Darker surface accent
									900: "#334C14", // Darkest background color
								},
								freonAccent: {
									error: "#FF4C4C",
									editable: "#FFD0B3",
									optional: "#DB6506",
									border: "#47651A",
									dropdown: "#5B7F20",
									button: "#98CA32",
								}
							},
            },
        },
	},
	plugins: [],
}
```
