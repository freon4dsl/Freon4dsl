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
    console.log('open model dialog')
    // To keep list of models in sync with what happens on the server, we get the list
    // of models from server every time we open this dialog.
    await getModelNamesFromServer();
    dialogs.openModelDialogVisible = true;
}

export async function openStartDialog() {
    console.log('open start dialog')
    await getModelNamesFromServer();
    dialogs.startDialogVisible = true;
}

export function checkModelName(newName: string): string {
    const initialErrorText: string = '';
    const invalidErrorText: string = "Model name may contain only characters and numbers, and must start with a character.";
    if (newName.length > 0 && !newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
        return invalidErrorText;
    } else {
        return initialErrorText;
    }
}

