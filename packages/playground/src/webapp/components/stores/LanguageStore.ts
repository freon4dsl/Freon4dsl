// info about the language
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

// name of the language
export let languageName: Writable<string> = writable<string>("FreLanguage ...");
// all possible unit types
export let unitTypes: Writable<string[]> = writable<string[]>([]);
// all file extentiomns associated with the model units
export let fileExtensions: Writable<string[]> = writable<string[]>([]);
// all possible projections
export let projectionNames:  Writable<string[]> = writable<string[]>(['default']);
// the projections that are curretnly chosen to be shown
export let projectionsShown:  Writable<string[]> = writable<string[]>(['default']);

