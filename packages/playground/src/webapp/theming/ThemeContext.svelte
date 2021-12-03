<!-- copied from the sandbox belonging to https://josefaidt.dev/blog/2020/03/theming-in-svelte/-->
<script>
    import { setContext, onMount } from "svelte";
    import { themePresets } from "../Theme-presets.ts";
    import {Theme} from "./ThemeStore";
    // expose props for customization and set default values
    export let themes = [...themePresets];
    // set state of current theme's name
    let _current = themes[0].name;

    // utility to get current theme from name
    const getCurrentTheme = name => themes.find(h => h.name === name);
    // set up Theme store, holding current theme object
    // const Theme = writable(getCurrentTheme(_current));

    setContext("theme", {
        // providing Theme store through context makes store readonly
        theme: Theme,
        toggle: () => {
           // update internal state
            let _currentIndex = themes.findIndex(h => h.name === _current);
            _current =
                themes[_currentIndex === themes.length - 1 ? 0 : (_currentIndex += 1)]
                    .name;
            // update Theme store
            Theme.update(t => ({ ...t, ...getCurrentTheme(_current) }));
            setRootColors(getCurrentTheme(_current));
        }
    });

    onMount(async () => {
        // try whether user has set preference for theme
        try {
            let mql = window.matchMedia("(prefers-color-scheme: dark)");
            if (mql.matches) _current = "dark";
        } catch (err) {
        } // eslint-disable-line
        // set CSS vars on mount
        setRootColors(getCurrentTheme(_current));
    });

    // sets CSS vars for easy use in components
    // ex: var(--theme-colors-background)
    const setRootColors = theme => {
        for (let [prop, color] of Object.entries(theme.colors)) {
            let varString = `--theme-colors-${prop}`;
            document.documentElement.style.setProperty(varString, color);
        }
        for (let [prop, color] of Object.entries(theme.fonts)) {
            let varString = `--theme-fonts-${prop}`;
            document.documentElement.style.setProperty(varString, color);
        }
        document.documentElement.style.setProperty("--theme-name", theme.name);
    };
</script>

<slot>
    <!-- content will go here -->
</slot>
