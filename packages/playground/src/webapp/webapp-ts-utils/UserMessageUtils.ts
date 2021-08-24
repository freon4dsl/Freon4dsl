import { errorMessage, severity, severityType, showError } from "./WebappStore";

export function setUserMessage(message: string, sever?: severityType) {
    errorMessage.set(message);
    if (sever) {
        severity.set(sever);
    } else {
        severity.set(severityType.error);
    }
    showError.set(true);
}
