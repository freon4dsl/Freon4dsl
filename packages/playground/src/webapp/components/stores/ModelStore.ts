// info about the model and model unit shown
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { PiModelUnit } from "@projectit/core";

export let currentModelName: Writable<string> = writable<string>('');
export let currentUnitName: Writable<string> = writable<string>('');

export let noUnitAvailable: Writable<boolean> = writable<boolean>(true);
export let units: Writable<PiModelUnit[]> = writable<PiModelUnit[]>(null);
// unitNames holds the names of all units as read form the server. Should be kept in sync with the current model!
export let unitNames: Writable<string[]> = writable<string[]>([]);
export let toBeDeleted: Writable<PiModelUnit> = writable<PiModelUnit>(null);
export let toBeRenamed: Writable<PiModelUnit> = writable<PiModelUnit>(null);

export let editorProgressShown: Writable<boolean> = writable<boolean>(false);

