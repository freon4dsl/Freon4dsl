import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let drawerOpen: Writable<boolean> = writable<boolean>(false);
