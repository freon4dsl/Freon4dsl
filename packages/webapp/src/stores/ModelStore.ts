// info about the model and model unit shown
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let currentModelName: Writable<string> = writable<string>('Model 42');
export let currentUnitName: Writable<string> = writable<string>('Unit 12');

export let unitNames: Writable<string[]> = writable<string[]>(['Unit 42', 'Unit 86', 'Unit 99', 'Unit 88', 'Unit 77', 'Unit 66', 'Unit 55', 'Unit 44', 'Unit 33', 'Unit 22', 'Unit 11', 'Unit 100','Unit Anneke', 'Unit Jos']);

