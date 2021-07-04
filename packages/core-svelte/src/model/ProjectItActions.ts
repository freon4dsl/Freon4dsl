import * as Keys from "@projectit/core";
import {
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    Box,
    KeyboardShortcutBehavior,
    MetaKey,
    PiActions,
    PiBinaryExpressionCreator,
    PiCaret,
    PiCustomBehavior,
    PiEditor,
    PiElement,
    PiExpressionCreator,
    PiBinaryExpression,
    PiKey,
    PiLogger,
    PiTriggerType,
    PiUtils,
    AliasBox,
    LEFT_MOST,
    RIGHT_MOST
} from "@projectit/core";
import { SvelteEntity } from "./SvelteEntity";

/**
 * This module implements all default actions for the editor.
 * These default actions are merged with custom actions.
 */
export const EXPRESSION_CREATORS: PiExpressionCreator[] = [
    {
        trigger: "'",
        activeInBoxRoles: ["alias-1"],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            console.log("ACTION in alias-1")
            const parent = box.element as SvelteEntity;
            parent.name = parent.name + "_!"
            return null;
        }
        // boxRoleToSelect: "StringLiteralExpression-value" /* CURSOR  0 */
    },
];

export const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
    // {
    //     trigger: "*",
    //     activeInBoxRoles: [LEFT_MOST, RIGHT_MOST, BEFORE_BINARY_OPERATOR, AFTER_BINARY_OPERATOR],
    //     expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
    //         const parent = box.element;
    //         const newExpression = new MultiplyExpression();
    //         parent[(box as AliasBox).propertyName] = newExpression;
    //         return newExpression;
    //     }
    // },
];

export const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
    {
        activeInBoxRoles: ["alias-1"],
        trigger: ";", // for Concept part
        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
            console.log("Cusrtom action triggerd");
            const parent = box.element;
            (parent as SvelteEntity).name = (parent as SvelteEntity).name + " :";
            return parent;
        },
        boxRoleToSelect: "entity-name"
    }
];

export const KEYBOARD: KeyboardShortcutBehavior[] = [
    // {
    //     activeInBoxRoles: ["new-models"],
    //     trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
    //     action: (box: Box, trigger: PiTriggerType, ed: PiEditor): Promise< PiElement> => {
    //         var parent: Demo = box.element as Demo;
    //         const newmodels: ExModel = new ExModel();
    //         parent.models.push(newmodels);
    //         return Promise.resolve(newmodels);
    //     },
    //     boxRoleToSelect: "models-name"
    // },
];
