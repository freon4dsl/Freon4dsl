import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const dragged: Writable<number> = writable<number>(-1);          // index of the list element that is currently being dragged
export const draggedFromList: Writable<string> = writable<string>('');  // id of the list that contains the dragged element
export const active: Writable<number> = writable<number>(-1);           // index of the list element that is currently being dragged-over
export const activeInList: Writable<string> = writable<string>('');     // id of the list that contains the 'active' element
