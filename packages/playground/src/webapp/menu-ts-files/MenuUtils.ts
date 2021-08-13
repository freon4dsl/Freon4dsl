import { ServerCommunication } from "../server/ServerCommunication";
import { currentModelName, saveUnitDialogVisible, unitNames } from "../WebappStore";
import { EditorCommunication } from "../editor/EditorCommunication";
import { get } from "svelte/store";

export function saveUnitInternal() {
    // get list of units from server, because a new name must not be identical to an existing one
    ServerCommunication.getInstance().loadUnitList(get(currentModelName), (names: string[]) => {
        // only show the dialog if the name is empty or unknown
        if (!EditorCommunication.getInstance().isUnitNamed()) {
            unitNames.set(names);
            saveUnitDialogVisible.set(true);
        } else {
            EditorCommunication.getInstance().saveCurrentUnit();
        }
    });
}
