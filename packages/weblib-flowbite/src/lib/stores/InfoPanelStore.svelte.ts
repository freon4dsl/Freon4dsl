import type { FreError } from "@freon4dsl/core";
import type { TreeNodeData } from "$lib/tree/TreeNodeData"

export const infoPanelShown = $state({
    value: false,
});

export const searchResultLoading = $state({value: true});
export const interpreterResultLoading = $state({value: true});

export interface ErrorInfoInterface {
    list: FreError[];
}
// the current list of search results that is shown in the editor
export const searchResults: ErrorInfoInterface = $state({list: []});


export const errorsLoading = $state({value: true});
// the current list of errors in the model unit that is shown in the editor
export const modelErrors: ErrorInfoInterface = $state({list: []});
// the trace of the last call to the interpreter
export const interpreterTrace: {value: TreeNodeData | undefined} = $state({value: undefined});

// the currently active tab and constants to indicate the tabs
export const errorTab = "Errors";
export const searchTab = "Search";
export const interpreterTab = "Interpreter";
export const activeTab = $state({value: errorTab});
