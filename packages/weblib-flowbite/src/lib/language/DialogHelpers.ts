import {WebappConfigurator} from "$lib/language/WebappConfigurator";
import {dialogs, serverInfo} from "$lib";

async function getModelNamesFromServer() {
    const names: string[] = await WebappConfigurator.getInstance().getAllModelNames();
    if (!!names && names.length > 0) {
        // Make the names available for the dialog
        serverInfo.allModelNames = names;
    }
}

export async function openModelDialog() {
    // To keep list of models in sync with what happens on the server, we get the list
    // of models from server every time we open this dialog.
    await getModelNamesFromServer();
    dialogs.openModelDialogVisible = true;
}

export async function openStartDialog() {
    // To keep list of models in sync with what happens on the server, we get the list
    // of models from server every time we open this dialog.
    await getModelNamesFromServer();
    dialogs.startDialogVisible = true;
}

/**
 * Returns an error message when 'newName' does not adhere to certain restrictions.
 * If strict is true, then it must be a valid TypeScript identifier, if strict
 * is false, then it must be a valid Windows file name.
 * Returns an empty string if everything is alright.
 * @param newName
 * @param strict
 */
export function checkName(newName: string, strict: boolean): string {
    const initialErrorText: string = '';
    if (strict) {
        // must be a valid TypeScript identifier
        const invalidErrorText: string = "Name may contain only characters, numbers and underscores, and must start with a character or underscore.";
        if (newName.length > 0 && !newName.match(/^[a-z,A-Z_][a-z,A-Z0-9_]*$/)) {
            return invalidErrorText;
        } else {
            return initialErrorText;
        }
    } else {
        // must be a valid Windows file name
        const invalidErrorText: string = "Name may not contain the following characters: '<', '>',  ':', '“',  '/', '\\' , '|', or '?'.";
        if (newName.length > 0 && !newName.match(/^[a-z,A-Z][a-z,A-Z0-9_-]*$/)) {
            return invalidErrorText;
        } else {
            return initialErrorText;
        }
    }
}

