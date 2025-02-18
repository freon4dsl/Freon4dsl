import { FreErrorSeverity } from "@freon4dsl/core";

// info about Freon
export const versionNumber = "1.0.0-beta2";

export let severity = $state({ value: FreErrorSeverity.Error });
export let userMessage = $state({
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
    // console.log("Freon User Message: " + message + ", " + get(severity));
    userMessageOpen.value = true;
}
