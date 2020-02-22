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
    PiTriggerType,
    PiUtils,
    RIGHT_MOST
} from "@projectit/core";
import axios from "axios";
import { DemoAttribute } from "../";

import {
    DemoAndExpression,
    DemoComparisonExpression,
    DemoDivideExpression,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlusExpression,
    DemoStringLiteralExpression,
    DemoFunction
} from "../model";

import { DemoModel } from "../model/DemoModel";
import { DemoEntity } from "../model/domain/DemoEntity";
import { DemoSumExpression } from "../model/expressions/DemoSumExpression";

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
    // tag::CreateFunctionAction[]
    {
        trigger: "function",
        activeInBoxRoles: ["end-of-function-list"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            var model: DemoModel = box.element as DemoModel;
            const fun: DemoFunction = new DemoFunction();
            model.functions.push(fun);
            return fun;
        },
        boxRoleToSelect: "fun-name"
    },
    // end::CreateFunctionAction[]
    // tag::CreateEntityAction[]
    {
        activeInBoxRoles: ["end-of-entity-list"],                                       // <1>
        trigger: "entity",                                                              // <2>
        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => { // <3>
            var model: DemoModel = box.element as DemoModel;
            const entity: DemoEntity = new DemoEntity();
            model.entities.push(entity);
            return entity;
        },
        boxRoleToSelect: "entity-name"                                                  // <4>
    },
    // end::CreateEntityAction[]
    // tag::CreateAttributeAction[]
    {
        trigger: "attribute",
        activeInBoxRoles: ["end-of-attribute-list"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            var entity: DemoEntity = box.element as DemoEntity;
            const attribute: DemoAttribute = new DemoAttribute();
            entity.attributes.push(attribute);
            return attribute;
        },
        boxRoleToSelect: "attribute-name"
    },
    // end::CreateAttributeAction[]
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
    },
    // tag::createEntityByEnter[]
    {
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
        activeInBoxRoles: ["end-of-entity-list"],
        action: (box: Box,key: PiKey, editor: PiEditor): Promise<PiElement> => {
            var model: DemoModel = box.element as DemoModel;
            const entity: DemoEntity = DemoEntity.create("");
            model.entities.push(entity);
            return Promise.resolve(entity);
        },
        boxRoleToSelect: "entity-name"
    },
    // end::createEntityByEnter[]

];

export class DemoActions implements PiActions {
    expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
    binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
    keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;
    constructor() {
        // LOGGER.log("creating DemoActions");
    }
}

export async function getModelList(): Promise<Object> {
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
