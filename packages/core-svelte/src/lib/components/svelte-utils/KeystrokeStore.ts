import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

// indication whether the current keystroke should be handled by the browser or by the FreonComponent
export const shouldBeHandledByBrowser: Writable<boolean> = writable<boolean>(false);
