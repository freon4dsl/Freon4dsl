// info about dialogs: wether they are open or closed
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

// indicates whether the application is initializing
export let initializing: Writable<boolean> = writable<boolean>(true);

// variables for the FileMenu
export let openModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let newUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let renameUnitDialogVisible: Writable<boolean> = writable<boolean>(false);

// variables for the EditMenu
export let findTextDialogVisible: Writable<boolean> = writable<boolean>(false);
export let findStructureDialogVisible: Writable<boolean> = writable<boolean>(false);
export let findNamedDialogVisible: Writable<boolean> = writable<boolean>(false);

// variables for the HelpButton
export let helpDialogVisible: Writable<boolean> = writable<boolean>(false);
