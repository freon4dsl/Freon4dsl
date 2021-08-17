import {Writable, writable} from 'svelte/store';
import { PiError } from "@projectit/core";

// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<PiError[]> = writable<PiError[]>([]);




