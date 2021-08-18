<script>
    import { setContext, onMount } from "svelte";
    import { writable } from "svelte/store";
    import { presets } from "../presets.js";
    // expose props for customization and set default values
    export let themes = [...presets];
    // set state of current theme's name
    let _current = themes[0].name;

    // utility to get current theme from name
    const getCurrentTheme = name => themes.find(h => h.name === name);
    // set up Theme store, holding current theme object
    const Theme = writable(getCurrentTheme(_current));

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

    onMount(() => {
        // set CSS vars on mount
        setRootColors(getCurrentTheme(_current));
    });

    // sets CSS vars for easy use in components
    // ex: var(--theme-background)
    const setRootColors = theme => {
        for (let [prop, color] of Object.entries(theme.kleuren)) {
            let varString = `--theme-${prop}`;
            document.documentElement.style.setProperty(varString, color);
        }
        document.documentElement.style.setProperty("--theme-name", theme.name);
    };
</script>

<slot>
    <!-- content will go here -->
</slot>
