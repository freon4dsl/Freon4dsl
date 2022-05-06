// info about the model and model unit shown
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let currentModelName: Writable<string> = writable<string>('Model 42');
export let currentUnitName: Writable<string> = writable<string>('Unit 12');
