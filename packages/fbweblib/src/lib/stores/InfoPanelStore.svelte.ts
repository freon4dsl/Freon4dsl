import type { FreError } from "@freon4dsl/core";

export let searchResultLoaded = $state({value: true});

export interface ErrorInfoInterface {
    list: FreError[];
}
// the current list of search results that is shown in the editor
export let searchResults: ErrorInfoInterface = $state({list: []});


export let errorsLoaded = $state({value: true});
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: ErrorInfoInterface = $state({list: []});
// the trace of the last call to the interpreter
export let interpreterTrace = $state({value: "no trace"});

// the currently active tab and constants to indicate the tabs
export const errorTab = "Errors";
export const searchTab = "Search";
export const interpreterTab = "Interpreter";
export let activeTab = $state({value: errorTab});
