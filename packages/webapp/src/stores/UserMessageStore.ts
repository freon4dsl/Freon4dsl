import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

// severity can range from 0 to 4
// 0 means information
// 1 means hint
// 2 means warning
// 3 means error
export enum severityType {
	info = 0,
	hint = 1,
	warning = 2,
	error= 3
}
export let severity: Writable<number> = writable<number>(severityType.error);
export let userMessage: Writable<string> = writable<string>("This is an important message. Once " +
	"you've read it, you can dismiss it.");
export let userMessageOpen: Writable<boolean> = writable<boolean>(false);

export function setUserMessage(message: string, sever?: severityType) {
	userMessage.set(message);
	if (sever) {
		severity.set(sever);
	} else {
		severity.set(severityType.error);
	}
	console.log("ProjectIt User Message: " + message);
	userMessageOpen.set(true);
}
