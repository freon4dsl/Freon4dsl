import {Writable, writable} from 'svelte/store';
import { PiElement, PiError } from "@projectit/core";


export let conceptNames: Writable<string[]> = writable<string[]>([]);


// the current list of search results that is shown in the editor
export let searchResults: Writable<PiElement[]> = writable<PiElement[]>([]);
// indication whether the search results 'tab' is open
export let searchResultsOpen: Writable<boolean> = writable<boolean>(false);
// indication whether the errors 'tab' is open
export let errorsOpen: Writable<boolean> = writable<boolean>(false);
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<PiError[]> = writable<PiError[]>([]);

// function to sort the data in a DataTable, used to sort errors in the ErrorList
export function sortErrors(data: PiError[], col: number, asc: boolean): PiError[] {
    if (col < 0 || col > 2) return data;

    const sorted = data.sort((a, b) => {
        let valA: string;
        let valB: string;
        if (col === 0) {
            valA = a.message;
            valB = b.message;
        }
        if (col === 1) {
            valA = a.locationdescription;
            valB = b.locationdescription;
        }
        if (col === 2) {
            valA = a.severity;
            valB = b.severity;
        }

        const first = asc ? valA : valB;
        const second = asc ? valB : valA;

        // console.log("valA: " + valA + ", valB: " + valB + ", asc: " + asc);
        return (first).localeCompare(second);
    });

    return sorted;
}

// function to sort the data in a DataTable, used to sort errors in the Search Results
export function sortResults(data: PiElement[], col: number, asc: boolean): PiElement[] {
    // TODO
    return data;
}
