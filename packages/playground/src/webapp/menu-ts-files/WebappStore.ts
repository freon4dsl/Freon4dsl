import {Writable, writable} from 'svelte/store';

// info about ProjectIt
export const versionNumber = "0.1.1";

// a constant used to name new items, also used in ...Environment.newModel()
export const unnamed: string = "<unnamed>";

// info about the language
export let unitTypes: Writable<string[]> = writable<string[]>([]);

// info about the model and model unit shown
export let currentModelName: Writable<string> = writable<string>('<unnamed>');
export let currentUnitName: Writable<string> = writable<string>('<unnamed>');

// info about the error in the working of the webapp that needs to be shown to the user
// this is shown in a snackbar on top of the page, and should not be confused
// with the errors on the content of the editor
export let errorMessage: Writable<string> = writable<string>('');
export let showError: Writable<boolean> = writable<boolean>(false);
// severity can range from 0 to 4
// 0 means information
// 1 means hint
// 2 means warning
// 3 means error
export enum severityType {
    info = 0,
    hint = 1,
    warning = 2,
    error= 3
}
export let severity: Writable<number> = writable<number>(severityType.error);




