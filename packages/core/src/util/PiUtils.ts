import { runInAction } from "mobx";
import { PiLogger } from "../logging";
import { Box, PiEditor } from "../editor";
import { PiOwnerDescriptor, PiElement, PiExpression } from "../ast";
import { isPiExpression } from "../ast-utils";

// export type BooleanCallback = () => boolean;
// export type DynamicBoolean = BooleanCallback | boolean;

// export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// export const NBSP: string = "".concat("\u00A0");

let LATEST_ID = 0;

const LOGGER = new PiLogger("PiUtils");

export class PiUtils {

    /**
     * Resets the ID, so the same ID can now appear twice.
     * Use only in tests to ensure the ID's there always start at 0
     */
    static resetId(): void {
        LATEST_ID = 0;
    }
    /**
     *
     */
    static ID() {
        LATEST_ID++;
        return "ID-" + LATEST_ID;
    }
    /** Initialize an object with a JSON object
     */
    static initializeObject<TTarget, TSource>(target: TTarget, source: TSource) {
        if (!(target && source)) {
            return;
        }
        Object.keys(source).forEach((key) => {
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

    static setContainer(exp: PiElement, piOwnerDescriptor: PiOwnerDescriptor | null, editor: PiEditor): void {
        runInAction(() => {
            if (!!piOwnerDescriptor) {
                if (piOwnerDescriptor.propertyIndex === undefined) {
                    piOwnerDescriptor.owner[piOwnerDescriptor.propertyName] = exp;
                } else {
                    piOwnerDescriptor.owner[piOwnerDescriptor.propertyName][piOwnerDescriptor.propertyIndex] = exp;
                }
            } else {
                editor.rootElement = exp;
            }
        });
    }

    static replaceExpression(oldExpression: PiExpression, newExpression: PiExpression, editor: PiEditor) {
        PiUtils.CHECK(isPiExpression(oldExpression), "replaceExpression: old element should be a PiExpression, but it isn't");
        PiUtils.CHECK(isPiExpression(newExpression), "replaceExpression: new element should be a PiExpression, but it isn't");
        runInAction(() => {
            PiUtils.setContainer(newExpression, oldExpression.piOwnerDescriptor(), editor);
        });
    }
}

export function isNullOrUndefined(obj: Object | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}

export function startWithUpperCase(word: string): string {
    if (!!word) {
        return word[0].toUpperCase() + word.substring(1);
    }
    return "";
}
