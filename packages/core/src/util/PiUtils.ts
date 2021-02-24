import { action } from "mobx";
import { PiLogger } from "./PiLogging";
import { Box } from "../editor/boxes/Box";
import { isPiExpression } from "../language/PiModel";
import { PiKey } from "../util/Keys";
import { PiContainerDescriptor, PiElement, PiExpression } from "../language/PiModel";
import { PiEditor } from "../editor/PiEditor";

export type BooleanCallback = () => boolean;
export type DynamicBoolean = BooleanCallback | boolean;

export const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const NBSP: string = "".concat("\u00A0");

const LOGGER = new PiLogger("PiUtils"); // .mute();

export class PiUtils {
    /** Initialize an object with a JSON object
     */
    static initializeObject<TTarget, TSource>(target: TTarget, source: TSource) {
        if (!(target && source)) {
            return;
        }
        Object.keys(source).forEach(key => {
            if (source.hasOwnProperty(key)) {
                (target as any)[key] = (source as any)[key];
            }
        });
    }

    static CHECK(b: boolean, msg?: string): void {
        if (!b) {
            throw new Error(msg ? "FAILED Check: " + msg : "check error");
        }
    }

    @action
    static setContainer(exp: PiElement, piContainer: PiContainerDescriptor | null, editor: PiEditor): void {
        if (!!piContainer) {
            if (piContainer.propertyIndex === undefined) {
                piContainer.container[piContainer.propertyName] = exp;
            } else {
                piContainer.container[piContainer.propertyName][piContainer.propertyIndex] = exp;
            }
        } else {
            editor.rootElement = exp;
        }
    }

    @action
    static replaceExpression(oldExpression: PiExpression, newExpression: PiExpression, editor: PiEditor) {
        PiUtils.CHECK(isPiExpression(oldExpression), "replaceExpression: old element should be a ProExpression, but it isn't");
        PiUtils.CHECK(isPiExpression(newExpression), "replaceExpression: new element should be a ProExpression, but it isn't");
        PiUtils.setContainer(newExpression, oldExpression.piContainer(), editor);
    }

    // TODO refactor this into an InternalBehavior class, like other behaviors.
    /**
     * Check whether `piKey` is a defined keyboard-shortcut for `box`.
     * If so execute the corresponding keyboard-shortcut action and return true.
     * Else return false.
     * @param piKey
     * @param box
     * @param editor
     */
    static async handleKeyboardShortcut(piKey: PiKey, box: Box, editor: PiEditor): Promise<boolean> {
        for (const act of editor.keyboardActions) {
            // LOGGER.log("handleKeyboardShortcut activeroles: " + act.activeInBoxRoles);
            if (act.trigger.meta === piKey.meta && act.trigger.keyCode === piKey.keyCode) {
                if (act.activeInBoxRoles.includes(box.role)) {
                    LOGGER.log("handleKeyboardShortcut: executing keyboard action");
                    const selected = await act.action(box, piKey, editor);
                    if (selected) {
                        await editor.selectElement(selected, act.boxRoleToSelect);
                    }
                    return true;
                } else {
                    LOGGER.log("handleKeyboardShortcut: Keyboard action does not include role " + box.role);
                }
            }
        }
        return false;
    }
}

export function initializeObject<TTarget, TSource>(target: TTarget, source: TSource) {
    if (!(target && source)) {
        return;
    }
    Object.keys(source).forEach(key => {
        if (source.hasOwnProperty(key)) {
            (target as any)[key] = (source as any)[key];
        }
    });
}

export function isNullOrUndefined(obj: Object | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}
