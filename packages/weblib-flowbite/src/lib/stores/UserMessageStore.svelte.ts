import { FreErrorSeverity } from "@freon4dsl/core";

// info about Freon
export const versionNumber: {value: string} = $state({value: "2.0.0-beta.4"});

export interface MessageInfo {
    severity: string;
    userMessage: string;
}

export const messageInfo: MessageInfo = $state({
    severity: FreErrorSeverity.Error,
    userMessage: "This is an important message. Once you've read it, you can dismiss it."
})

export const userMessageOpen: { value: boolean } =  $state({ value: false })

export function setUserMessage(message: string, sever?: FreErrorSeverity) {
    console.log(`Set User Message: ${message}`)
    messageInfo.userMessage = message;
    if (sever !== null && sever !== undefined) {
        messageInfo.severity = sever;
    } else {
        messageInfo.severity = FreErrorSeverity.Error;
    }
    // console.log("Freon User Message: " + message + ", " + sever);
    userMessageOpen.value = true;
}
