import { PiEditor } from "@projectit/core";
import { writable } from "svelte/store";
import { themePresets } from "../Theme-presets";
import { editorEnvironment } from "../WebappConfiguration";


export const Theme = myStore(themePresets[0]);

function myStore(theme: Object) {
    const { subscribe, set, update } = writable<Object>(theme);

    let value = theme;
    const newSet = (themeObject: Object) => {
        console.log("setting theme to " + JSON.stringify(themeObject));
        const editor: PiEditor = editorEnvironment.editor;
        editor.theme = themeObject["name"];
        set(themeObject);
    };
    return {
        subscribe,
        set: newSet,
        update: (updateFunction) => { newSet(updateFunction(value))},
        reset: () => set(0)
    };
}
