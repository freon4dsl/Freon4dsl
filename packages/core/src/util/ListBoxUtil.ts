import { PiUtils, wait } from "./PiUtils";
import { MetaKey, PiKey } from "./Keys";
import { KeyboardShortcutBehavior } from "../editor/PiAction";
import { AliasBox } from "../editor/boxes/AliasBox";
import { Box } from "../editor/boxes/Box";
import { HorizontalListBox, VerticalListBox } from "../editor/boxes/ListBox";
import { IPiEditor } from "../editor/IPiEditor";
import { PiElement } from "../language/PiModel";
import { PiLogger } from "./PiLogging";
import * as Keys from "./Keys";

const LOGGER = new PiLogger("ListBoxUtil");

export function boxAbove(box: Box): Box {
    wait(0);
    const x = box.actualX;
    const y = box.actualY;
    let result: Box = box.nextLeafLeft;
    let tmpResult = result;
    LOGGER.log("boxAbove: " + x + ", " + y);
    while (result !== null) {
        LOGGER.log("previous : " + result.role + "  " + result.actualX + ", " + result.actualY);
        if (isOnPreviousLine(tmpResult, result) && isOnPreviousLine(box, tmpResult)) {
            return tmpResult;
        }
        if (isOnPreviousLine(box, result)) {
            if (result.actualX <= x) {
                return result;
            }
        }
        const next = result.nextLeafLeft;
        tmpResult = result;
        result = next;
    }
    return result;
}

export function boxBelow(box: Box): Box {
    const x = box.actualX;
    const y = box.actualY;
    let result: Box = box.nextLeafRight;
    let tmpResult = result;
    LOGGER.log("boxBelow " + box.role + ": " + x + ", " + y);
    while (result !== null) {
        LOGGER.log("next : " + result.role + "  " + result.actualX + ", " + result.actualY);
        if (isOnNextLine(tmpResult, result) && isOnNextLine(box, tmpResult)) {
            LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
            return tmpResult;
        }
        if (isOnNextLine(box, result)) {
            if (result.actualX + result.actualWidth >= x) {
                LOGGER.log("Found box below 2 [" + (!!result ? result.role : "null") + "]");
                return result;
            }
        }
        const next = result.nextLeafRight;
        tmpResult = result;
        result = next;
    }
    LOGGER.log("Found box below 3 [ null ]");
    return result;
}

function isOnPreviousLine(ref: Box, other: Box): boolean {
    const margin = 5;
    return other.actualY + margin < ref.actualY;
}

function isOnNextLine(ref: Box, other: Box): boolean {
    return isOnPreviousLine(other, ref);
}

export function firstVerticalBoxParent(box: Box): Box[] {
    const resultL: Box[] = [];
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
    elementCreator: (box: Box, editor: IPiEditor) => E,
    editor: IPiEditor
): Box {
    LOGGER.log("createVerticalListBox");
    const result = new VerticalListBox(element, role, []);

    for (let index = 0; index < list.length; index++) {
        const ent = list[index];
        const line = new HorizontalListBox(element, role + "-hor-" + index, [
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
    elementCreator: (box: Box, editor: IPiEditor) => ELEMENT_TYPE,
    roleToSelect: string
): KeyboardShortcutBehavior {
    const listKeyboardShortcut: KeyboardShortcutBehavior = {
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
        activeInBoxRoles: ["list-for-" + collectionRole],
        action: async (box: Box, key: PiKey, editor: IPiEditor): Promise<PiElement> => {
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
