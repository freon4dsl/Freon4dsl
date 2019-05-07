import { PiUtils, wait } from "./PiUtils";
import { MetaKey, PiKey } from "./Keys";
import { KeyboardShortcutBehavior } from "../editor/PiAction";
import { AliasBox } from "../boxes/AliasBox";
import { Box } from "../boxes/Box";
import { HorizontalListBox, VerticalListBox } from "../boxes/ListBox";
import { PiEditor } from "../editor/PiEditor";
import { PiElement } from "../language/PiModel";
import { PiLogger } from "./PiLogging";
import * as Keys from "./Keys";

const LOGGER = new PiLogger("ListBoxUtil");

export function boxAbove(box: Box): Box {
    wait(0);
    let x = box.actualX;
    let y = box.actualY;
    let result: Box = box.nextLeafLeft;
    let tmpResult = result;
    LOGGER.log("boxAbove: " + x + ", " + y);
    while (result !== null) {
        LOGGER.log("previous : " + result.role + "  " + result.actualX + ", " + result.actualY);
        if ((isOnPreviousLine(tmpResult, result)) && (isOnPreviousLine(box, tmpResult))) {
            return tmpResult;
        }
        if (isOnPreviousLine(box, result)) {
            if (result.actualX <= x) {
                return result;
            }
        }
        let next = result.nextLeafLeft;
        tmpResult = result;
        result = next;
    }
    return result;
}

export function boxBelow(box: Box): Box {
    let x = box.actualX;
    let y = box.actualY;
    let result: Box = box.nextLeafRight;
    let tmpResult = result;
    LOGGER.log("boxBelow " + box.role + ": " + x + ", " + y);
    while (result !== null) {
        LOGGER.log("next : " + result.role + "  " + result.actualX + ", " + result.actualY);
        if ((isOnNextLine(tmpResult, result)) && (isOnNextLine(box, tmpResult))) {
            LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
            return tmpResult;
        }
        if (isOnNextLine(box, result)) {
            if (result.actualX + result.actualWidth >= x) {
                LOGGER.log("Found box below 2 [" + (!!result ? result.role : "null") + "]");
                return result;
            }
        }
        let next = result.nextLeafRight;
        tmpResult = result;
        result = next;
    }
    LOGGER.log("Found box below 3 [" + ((!!result) ? result.role : "null") + "]");
    return result;
}

function isOnPreviousLine(ref: Box, other: Box): boolean {
    const margin = 5;
    return other.actualY + 5 < ref.actualY;
}

function isOnNextLine(ref: Box, other: Box): boolean {
    return isOnPreviousLine(other, ref);
}

export function firstVerticalBoxParent(box: Box): Box[] {
    let resultL: Box[] = [];
    resultL.push(box);
    let result: Box = box;
    while (result.parent) {
        result = result.parent;
        resultL.push(result);
        if (result instanceof VerticalListBox) {
            return resultL;
        }
    }
    return resultL;
}

export function createVerticalListBox<E extends PiElement>(
    element: PiElement,
    role: string,
    list: E[],
    placeholderRole: string,
    elementCreator: (box: Box, editor: PiEditor) => E,
    editor: PiEditor
): Box {
    LOGGER.info(this, "createVerticalListBox");
    const result = new VerticalListBox(element, role, []);

    for (var index = 0; index < list.length; index++) {
        const ent = list[index];
        const line = new HorizontalListBox(element, role + "-hor-" + index,
            [
                editor.projection.getBox(ent),
                new AliasBox(ent, "list-for-" + role, "    ", { roleNumber: index })
            ]);
        result.addChild(line);
    }

    return result;
}

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
        action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("list-for-elements");
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
                await editor.selectElement(newElement, roleToSelect);
            } else {
                LOGGER.log("List select first leaf " + roleToSelect);
                await editor.selectElement(newElement);
                LOGGER.log("List select first editable leaf NOW " + roleToSelect);
                await editor.selectFirstEditableChildBox();
                // await editor.selectFirstLeafChildBox();
            }
            // }
            return null;
        }
    };
    return listKeyboardShortcut;
}

