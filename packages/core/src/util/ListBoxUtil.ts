// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { MetaKey } from "./Keys";
import * as Keys from "./Keys";
import { PiLogger } from "../logging";
import { PiCreatePartAction } from "../editor";

const LOGGER = new PiLogger("ListBoxUtil");

export function createKeyboardShortcutForList2 (
    role: string,
    propertyName: string,
    conceptName: string,
    roleToSelect: string
): PiCreatePartAction {
    console.log("LIST role [" + role + "]")
    const listKeyboardShortcut: PiCreatePartAction = new PiCreatePartAction({
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
        activeInBoxRoles: [role, "alias-" + role + "-textbox"],
        conceptName: conceptName,
        propertyName: propertyName,
        boxRoleToSelect: roleToSelect
    });
    return listKeyboardShortcut;
}
