// info about dialogs: wether they are open or closed
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

// indicates wether the apllication is initializing
export let initializing: Writable<boolean> = writable<boolean>(true);
export let openModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteModelDialogVisible: Writable<boolean> = writable<boolean>(false);

