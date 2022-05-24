import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { PiError } from "@projectit/core";

export let errorsLoaded: Writable<boolean> = writable<boolean>(true);
export let searchResultLoaded: Writable<boolean> = writable<boolean>(true);

// the current list of search results that is shown in the editor
export let searchResults: Writable<PiError[]> = writable<PiError[]>([]);
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<PiError[]> = writable<PiError[]>([]);

// the currently active tab and constants to indicate the tabs
export const errorTab = 'Errors';
export const searchTab = 'Search';
export let activeTab: Writable<string> = writable<string>(errorTab);
