import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let modelErrors: Writable<string[]> = writable<string[]>(["my first error"]);
