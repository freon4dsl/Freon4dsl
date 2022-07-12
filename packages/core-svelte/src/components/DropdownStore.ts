import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let selectedOptionId: Writable<string> = writable<string>('');
