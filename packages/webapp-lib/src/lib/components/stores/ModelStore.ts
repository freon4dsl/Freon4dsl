// info about the model and model unit shown
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { FreModelUnit, ModelUnitIdentifier } from "@freon4dsl/core";

export let currentModelName: Writable<string> = writable<string>("");
export let currentUnitName: Writable<ModelUnitIdentifier> = writable<ModelUnitIdentifier>(null);

export let noUnitAvailable: Writable<boolean> = writable<boolean>(true);
export let units: Writable<FreModelUnit[]> = writable<FreModelUnit[]>(null);
// unitNames holds the names of all units as read form the server. Should be kept in sync with the current model!
export let unitNames: Writable<ModelUnitIdentifier[]> = writable<ModelUnitIdentifier[]>([]);
export let toBeDeleted: Writable<FreModelUnit> = writable<FreModelUnit>(null);
export let toBeRenamed: Writable<FreModelUnit> = writable<FreModelUnit>(null);

export let editorProgressShown: Writable<boolean> = writable<boolean>(false);

export let unsavedChanges: Writable<boolean> = writable<boolean>(false); // TODO set this value somewhere
