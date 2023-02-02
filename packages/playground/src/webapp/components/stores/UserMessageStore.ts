import { writable } from "svelte/store";
import type { Writable } from 'svelte/store';
import { SeverityType } from "@freon4dsl/core";

// info about Freon
export const versionNumber = "0.5.0";

export let severity: Writable<number> = writable<number>(SeverityType.error);
export let userMessage: Writable<string> = writable<string>("This is an important message. Once " +
	"you've read it, you can dismiss it.");
export let userMessageOpen: Writable<boolean> = writable<boolean>(false);

export function setUserMessage(message: string, sever?: SeverityType) {
	userMessage.set(message);
	if (sever !== null && sever !== undefined) {
		severity.set(sever);
	} else {
		severity.set(SeverityType.error);
	}
	// console.log("Freon User Message: " + message + ", " + get(severity));
	userMessageOpen.set(true);
}
