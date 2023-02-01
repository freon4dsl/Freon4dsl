import type { Box } from "@projectit/core";
import { writable, Writable } from "svelte/store";

/**
 * Temporary fix
 * TODO Remove when merging with svelte-improvements
 */
export let selectedBoxInEditor: Writable<Box> = writable<Box>(null);
