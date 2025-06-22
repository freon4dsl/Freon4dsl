import {WebappConfigurator} from "$lib/language/WebappConfigurator";
import {dialogs, serverInfo} from "$lib";
import { isIdentifier } from "@freon4dsl/core";

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
 * Returns an empty string if everything is alright.
 * @param newName
 */
export function checkName(newName: string): string {
    if (!isIdentifier(newName)) {
        return `${newName} is not a valid name`
    } else {
        return ""
    }
}

