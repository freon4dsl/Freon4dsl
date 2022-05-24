// info about the available models at the server
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let modelNames: Writable<string[]> = writable<string[]>([]);
