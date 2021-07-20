import {Writable, writable} from 'svelte/store';

// info about ProjectIt
export const versionNumber = "0.1.1";

// info about the language
export let unitTypes: Writable<string[]> = writable<string[]>([]);

// info about the model and model unit shown
export let currentModelName: Writable<string> = writable<string>('<unnamed>');
export let currentUnitName: Writable<string> = writable<string>('<unnamed>');

// info about the error that needs to be shown to the user
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




