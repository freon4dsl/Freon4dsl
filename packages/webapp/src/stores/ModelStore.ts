// info about the model and model unit shown
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { PiModelUnit } from "@projectit/core";

// todo different inits
export let currentModelName: Writable<string> = writable<string>('');
export let currentUnitName: Writable<string> = writable<string>('');

export let units: Writable<PiModelUnit[]> = writable<PiModelUnit[]>(null);
// todo make unitNames a function on 'units'
export let unitNames: Writable<string[]> = writable<string[]>(['Unit 42', 'Unit 86', 'Unit 99', 'Unit 88', 'Unit 77', 'Unit 66', 'Unit 55', 'Unit 44', 'Unit 33', 'Unit 22', 'Unit 11', 'Unit 100','Unit Anneke', 'Unit Jos']);
export let noUnitAvailable: Writable<boolean> = writable<boolean>(true);
export let editorProgressShown: Writable<boolean> = writable<boolean>(false);

