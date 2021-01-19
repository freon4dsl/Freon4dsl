import DialogData from "./DialogData";
import { EditorCommunication } from "./EditorCommunication";
import { App } from "./App";
import { PiLogger } from "@projectit/core";

const LOGGER = new PiLogger("CommonOperations");

export default class CommonOperations {
    private static instance: CommonOperations = null;

    static getInstance(): CommonOperations {
        if( CommonOperations.instance === null){
            CommonOperations.instance = new CommonOperations();
        }
        return CommonOperations.instance;
    }

    public async saveChangesBeforeCallback(dialogData: DialogData, callback: (dialogData: DialogData) => void) {
        App.setDialogContent(null);
        const unitName = EditorCommunication.getInstance().currentUnit?.name;
        if (!!unitName && unitName.length > 0) {
            EditorCommunication.getInstance().saveCurrentUnit();
            callback(dialogData);
        } else {
            App.setDialogTitle(`Current model unit has unsaved changes.`);
            App.setDialogSubText("The model unit cannot be saved because it is unnamed. Do you want to revert and name it?");
            App.useDefaultButton();
            await App.showDialogWithCallback(() => {
                    // do nothing, wait for the user to choose another user action
                    LOGGER.log("Reverting to current model unit");
                },
                () => {
                    LOGGER.log("removing unnamed unit");
                    EditorCommunication.getInstance().deleteCurrentUnit();
                    callback(dialogData);
                });
        }
    }
}
