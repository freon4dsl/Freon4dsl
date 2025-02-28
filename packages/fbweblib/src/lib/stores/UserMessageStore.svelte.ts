import { FreErrorSeverity } from "@freon4dsl/core";

// info about Freon
export const versionNumber: string = "1.0.0";

export interface MessageInfo {
    severity: string;
    userMessage: string;
    userMessageOpen: boolean;
}

export const messageInfo: MessageInfo = $state({
    severity: FreErrorSeverity.Error,
    userMessage: "This is an important message. Once you've read it, you can dismiss it.",
    userMessageOpen: false,
})


export function setUserMessage(message: string, sever?: FreErrorSeverity) {
    messageInfo.userMessage = message;
    if (sever !== null && sever !== undefined) {
        messageInfo.severity = sever;
    } else {
        messageInfo.severity = FreErrorSeverity.Error;
    }
    // console.log("Freon User Message: " + message + ", " + get(severity));
    messageInfo.userMessageOpen = true;
}
