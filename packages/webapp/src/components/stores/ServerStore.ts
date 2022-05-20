// info about the available models at the server
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let modelNames: Writable<string[]> = writable<string[]>(['Model 42', 'Model 86', 'Model 99', 'Model 88', 'Model 77', 'Model 66', 'Model 55', 'Model 44', 'Model 33', 'Model 22', 'Model 11', 'Model 100','Model Anneke', 'Model Jos']);
