import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { FreErrorSeverity } from "@freon4dsl/core";

// info about Freon
export const versionNumber = "0.5.0";

export let severity: Writable<string> = writable<string>(FreErrorSeverity.Error);
export let userMessage: Writable<string> = writable<string>("This is an important message. Once you've read it, you can dismiss it.");
export let userMessageOpen: Writable<boolean> = writable<boolean>(false);

export function setUserMessage(message: string, sever?: FreErrorSeverity) {
	userMessage.set(message);
	if (sever !== null && sever !== undefined) {
		severity.set(sever);
	} else {
		severity.set(FreErrorSeverity.Error);
	}
	// console.log("Freon User Message: " + message + ", " + get(severity));
	userMessageOpen.set(true);
}
