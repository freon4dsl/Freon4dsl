import axios from "axios";
import * as Keys from "@projectit/core";
import {
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    Box,
    EXPRESSION_PLACEHOLDER,
    KeyboardShortcutBehavior,
    LEFT_MOST,
    MetaKey,
    PiActions,
    PiBinaryExpressionCreator,
    PiCaret,
    PiCustomBehavior,
    PiEditor,
    PiElement,
    PiExpressionCreator,
    PiKey,
    PiLogger,
    PiToolbarItem,
    PiTriggerType,
    PiUtils,
    RIGHT_MOST
} from "@projectit/core";
import { DemoProjection } from "../";
import { saveComponent } from "./SaveComponent";
import { DemoSumExpression } from "../model/expressions/DemoSumExpression";

import {
    DemoAndExpression,
    DemoComparisonExpression,
    DemoDivideExpression,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlusExpression,
    DemoStringLiteralExpression
} from "../model";
import { loadComponent } from "./LoadComponent";

import { DemoModel } from "../model/DemoModel";
import { DemoEntity } from "../model/domain/DemoEntity";

const LOGGER = new PiLogger("DemoActions");

const EXPRESSION_CREATORS: PiExpressionCreator[] = [
    {
        trigger: '"',
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return new DemoStringLiteralExpression();
        },
        boxRoleToSelect: "string-value"
    },
    {
        trigger: /[0-9]/,
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            PiUtils.CHECK(typeof trigger === "string", "Trigger for numeric literal should be a string");
            return DemoNumberLiteralExpression.create(trigger as string);
        },
        boxRoleToSelect: "num-literal-value",
        caretPosition: PiCaret.RIGHT_MOST
    },
    {
        trigger: "sum",
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return new DemoSumExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER,
        caretPosition: PiCaret.RIGHT_MOST
    }
];

const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
    {
        trigger: "+",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return new DemoPlusExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: ">",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return DemoComparisonExpression.create(">");
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "<=",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return DemoComparisonExpression.create("<=");
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "<",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return DemoComparisonExpression.create("<");
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: ">=",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return DemoComparisonExpression.create(">=");
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "==",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return DemoComparisonExpression.create("==");
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "and",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return new DemoAndExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "or",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return new DemoOrExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "/",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return new DemoDivideExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    },
    {
        trigger: "*",
        activeInBoxRoles: [
            LEFT_MOST,
            RIGHT_MOST,
            EXPRESSION_PLACEHOLDER,
            BEFORE_BINARY_OPERATOR,
            AFTER_BINARY_OPERATOR
        ],
        expressionBuilder: (box: Box) => {
            return new DemoMultiplyExpression();
        },
        boxRoleToSelect: EXPRESSION_PLACEHOLDER
    }
];

const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
    {
        trigger: "!!",
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            LOGGER.log("Action done");
            return null;
        }
    },
    {
        trigger: "a",
        activeInBoxRoles: ["string-value"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            LOGGER.log("========================== Action done");
            return null;
        }
    }
];

const KEYBOARD: KeyboardShortcutBehavior[] = [
    {
        trigger: { meta: MetaKey.Shift, keyCode: Keys.ENTER },
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        action: (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("Ketyboard ENTER SHIFT Action done");
            return null;
        }
    },
    {
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
        activeInBoxRoles: ["list-for-entities"],
        action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("list================= -for-entities ");
            const entity = box.element;
            PiUtils.CHECK(entity instanceof DemoEntity, "current element should be an entity but it is " + entity);
            const proc = entity.piContainer();
            const parent: PiElement = proc.container;
            PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === entity);
            PiUtils.CHECK(parent instanceof DemoModel);
            if (parent instanceof DemoModel) {
                const e = new DemoEntity();
                parent.entities.splice(proc.propertyIndex + 1, 0, e);
                await editor.selectElement(e, "entity-name");
            }
            return null;
        }
    },
    {
        trigger: { meta: MetaKey.Ctrl, keyCode: Keys.CHARACTER_A },
        activeInBoxRoles: ["start-quote"],
        action: (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("========================== Action Ctrl-a done");
            return null;
        }
    },
    {
        trigger: { meta: MetaKey.None, keyCode: Keys.CHARACTER_A },
        activeInBoxRoles: ["end-quote"],
        action: (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("========================== Action 'a' done");
            return null;
        }
    }
];

const TOOLBAR: PiToolbarItem[] = [
    {
        id: "save",
        label: "Save",
        onClick: (editor: PiEditor): void => {},
        component: async (editor: PiEditor): Promise<JSX.Element> => {
            return saveComponent({ editor: editor });
        }
    },
    {
        id: "load",
        label: "Load",
        onClick: (editor: PiEditor): void => {
            console.log("On Click");
        },
        component: async (editor: PiEditor): Promise<JSX.Element> => {
            const models = await getModelList();
            return loadComponent({ editor: editor, models: models as string[] });
        }
    },
    {
        id: "text",
        label: "Text",
        onClick: (editor: PiEditor): void => {
            (editor.projection as DemoProjection).projectionType = "text";
        }
    },
    {
        id: "tree",
        label: "Tree",
        onClick: (editor: PiEditor): void => {
            (editor.projection as DemoProjection).projectionType = "tree";
        }
    },
    {
        id: "orboxed",
        label: "or boxed",
        onClick: (editor: PiEditor): void => {
            (editor.projection as DemoProjection).projectionType = "orboxed";
        }
    },
    {
        id: "brackets",
        label: "toggle brackets",
        onClick: (editor: PiEditor): void => {
            (editor.projection as DemoProjection).showBrackets = !(editor.projection as DemoProjection).showBrackets;
        }
    }
];

export class DemoActions implements PiActions {
    expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
    binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
    keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;
    toolbarActions: PiToolbarItem[] = TOOLBAR;
    constructor() {
        // LOGGER.log("creating DemoActions");
    }
}

async function getModelList(): Promise<Object> {
    console.log("getModelList");
    try {
        const res = await axios.get(`http://127.0.0.1:3001/getModelList`);
        console.log(res.data + " is " + typeof res.data);
        console.log(JSON.stringify(res.data));
        return res.data;
    } catch (e) {
        console.log("Error " + e.toString());
    }
    return {};
}
