// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { MetaKey, PiKey } from "./Keys";
import * as Keys from "./Keys";
import { PiUtils, PiLogger } from "./internal";
import {
    AliasBox,
    Box,
    HorizontalListBox,
    VerticalListBox,
    PiEditor,
    KeyboardShortcutBehavior
} from "../editor";
import { PiElement } from "../language";

const LOGGER = new PiLogger("ListBoxUtil");

/**
 * Create a keyboard shortcut for use in an element list
 * @param collectionRole
 * @param elementCreator
 * @param roleToSelect
 */
export function createKeyboardShortcutForList<ELEMENT_TYPE extends PiElement>(
    collectionRole: string,
    elementCreator: (box: Box, editor: PiEditor) => ELEMENT_TYPE,
    roleToSelect: string
): KeyboardShortcutBehavior {
    const listKeyboardShortcut: KeyboardShortcutBehavior = {
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
        activeInBoxRoles: ["list-for-" + collectionRole],
        action: (box: Box, key: PiKey, editor: PiEditor): PiElement => {
            LOGGER.log("createKeyboardShortcutForList: Action: list-for-" + collectionRole);
            const element = box.element;
            const proc = element.piContainer();
            const parent: PiElement = proc.container;
            PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
            // CHECK(parent instanceof ProElement);
            // if (parent instanceof DemoModel) {
            const newElement: ELEMENT_TYPE = elementCreator(box, editor);
            parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);
            // wait(0);
            // editor.selectElement(newElement, roleToSelect);

            if (!!roleToSelect) {
                LOGGER.log("List select element for role " + roleToSelect);
                editor.selectElement(newElement, roleToSelect);
            } else {
                LOGGER.log("List select first leaf " + roleToSelect);
                editor.selectElement(newElement);
                LOGGER.log("List select first editable leaf NOW " + roleToSelect);
                editor.selectFirstEditableChildBox();
                // await editor.selectFirstLeafChildBox();
            }
            // }
            return null;
        }
    };
    return listKeyboardShortcut;
}
