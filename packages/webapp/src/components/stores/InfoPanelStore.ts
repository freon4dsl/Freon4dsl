import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { PiError } from "@projectit/core";

// the concepts that can be searched for
export let conceptNames: Writable<string[]> = writable<string[]>([]);

// todo find a way to show that errors or search results are being loaded
export let errorsLoaded: Writable<boolean> = writable<boolean>(false); // temp!!
export let searchResultLoaded: Writable<boolean> = writable<boolean>(true); // temp!!

// the current list of search results that is shown in the editor
export let searchResults: Writable<PiError[]> = writable<PiError[]>([]);
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<PiError[]> = writable<PiError[]>([]);

// the currently active tab and constants to indicate the tabs
export const errorTab = 'errors';
export const searchTab = 'search';
export let activeTab: Writable<string> = writable<string>(errorTab);
