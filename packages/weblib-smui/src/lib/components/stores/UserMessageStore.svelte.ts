import { FreErrorSeverity } from "@freon4dsl/core";

// info about Freon
export const versionNumber: string = "1.1.0-beta.3";

export let severity: {value: FreErrorSeverity} = $state({ value: FreErrorSeverity.Error });
export let userMessage: {value: string} = $state({
        value: "This is an important message. Once you've read it, you can dismiss it."
    },
);
export let userMessageOpen = $state({ value: false });

export function setUserMessage(message: string, sever?: FreErrorSeverity) {
    userMessage.value = message;
    if (sever !== null && sever !== undefined) {
        severity.value = sever;
    } else {
        severity.value = FreErrorSeverity.Error;
    }
    console.log("Freon User Message: " + message + ", " + severity.value);
    userMessageOpen.value = true;
}
