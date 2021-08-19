import { ServerCommunication } from "../server/ServerCommunication";
import { currentModelName, unitNames } from "../WebappStore";
import { EditorCommunication } from "../editor/EditorCommunication";
import { get } from "svelte/store";
import { editorEnvironment } from "../WebappConfiguration";

// export function saveUnitInternal() {
//     // get list of units from server, because a new name must not be identical to an existing one
//     ServerCommunication.getInstance().loadUnitList(get(currentModelName), (names: string[]) => {
//         // only show the dialog if the name is empty or unknown
//             EditorCommunication.getInstance().saveCurrentUnit();
//     });
// }

export function metaTypeForExtension (extension: string) {
    for (let [key, value] of editorEnvironment.fileExtensions) {
        if (value === extension)
            return key;
    }
    return "";
}
