import DialogData from "./DialogData";
import { EditorCommunication } from "./EditorCommunication";
import { App } from "./App";

export default class CommonOperations {
    private static instance: CommonOperations = null;

    static getInstance(): CommonOperations {
        if( CommonOperations.instance === null){
            CommonOperations.instance = new CommonOperations();
        }
        return CommonOperations.instance;
    }

    public async saveChangesBeforeCallback(dialogData: DialogData, callback: (dialogData: DialogData) => void) {
        const unitName = EditorCommunication.getInstance().currentUnit?.name;
        if (!!unitName && unitName.length > 0) {
            App.setDialogTitle(`Current model unit '${unitName}' has unsaved changes.`);
            App.setDialogSubText("Do you want to save it?");
            App.useDefaultButton();
            await App.showDialogWithCallback(() => {
                    EditorCommunication.getInstance().saveCurrentUnit();
                    callback(dialogData);
                },
                () => {
                    callback(dialogData);
                });
        } else {
            App.setDialogTitle(`Current model unit has unsaved changes.`);
            App.setDialogSubText("The model unit cannot be saved because it is unnamed. Do you want to revert and name it?");
            App.useDefaultButton();
            await App.showDialogWithCallback(() => {
                },
                () => {
                    callback(dialogData);
                });
        }
    }
}
