import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { FreError } from "@freon4dsl/core";

export let errorsLoaded: Writable<boolean> = writable<boolean>(true);
export let searchResultLoaded: Writable<boolean> = writable<boolean>(true);

// the current list of search results that is shown in the editor
export let searchResults: Writable<FreError[]> = writable<FreError[]>([]);
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<FreError[]> = writable<FreError[]>([]);
// the trace of the last call to the interpreter
export let interpreterTrace: Writable<string> = writable<string>("no trace");

// the currently active tab and constants to indicate the tabs
export const errorTab = 'Errors';
export const searchTab = 'Search';
export const interpreterTab = 'Interpreter';
export let activeTab: Writable<string> = writable<string>(errorTab);
