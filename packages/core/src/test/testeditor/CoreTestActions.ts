import * as Keys from "../../util/Keys";
import { PiElement } from "../../language";
import {
    Box,
    KeyboardShortcutBehavior,
    PiActions,
    PiBinaryExpressionCreator,
    PiCustomBehavior,
    PiEditor,
    PiExpressionCreator,
    PiTriggerType,
} from "../../editor";
import { AFTER_BINARY_OPERATOR, BEFORE_BINARY_OPERATOR, BTREE, LEFT_MOST, PiLogger, RIGHT_MOST, PiUtils, PiKey, PiCaret, MetaKey, EXPRESSION_PLACEHOLDER } from "../../util";
import axios from "axios";

import {
    CoreTestAndExpression,
    CoretestComparisonExpression,
    CoreTestDivideExpression,
    CoreTestMultiplyExpression,
    CoreTestNumberLiteralExpression,
    CoreTestOrExpression,
    CoreTestPlusExpression,
    CoreTestStringLiteralExpression,
    CoreTestFunction, CoreTestAttribute
} from "../testmodel";

import { CoreTestModel } from "../testmodel/CoreTestModel";
import { CoreTestEntity } from "../testmodel/domain/CoreTestEntity";
import { CoreTestSumExpression } from "../testmodel/expressions/CoreTestSumExpression";

const LOGGER = new PiLogger("CoreTestActions");

const EXPRESSION_CREATORS: PiExpressionCreator[] = [
    {
        trigger: '"',
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return new CoreTestStringLiteralExpression();
        },
        boxRoleToSelect: "string-value"
    },
    {
        trigger: /[0-9]/,
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            PiUtils.CHECK(typeof trigger === "string", "Trigger for numeric literal should be a string");
            return CoreTestNumberLiteralExpression.create(trigger as string);
        },
        boxRoleToSelect: "num-literal-value",
        caretPosition: PiCaret.RIGHT_MOST
    },
    {
        trigger: "sum",
        activeInBoxRoles: [EXPRESSION_PLACEHOLDER],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            return new CoreTestSumExpression();
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
            return new CoreTestPlusExpression();
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
            return CoretestComparisonExpression.create(">");
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
            return CoretestComparisonExpression.create("<=");
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
            return CoretestComparisonExpression.create("<");
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
            return CoretestComparisonExpression.create(">=");
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
            return CoretestComparisonExpression.create("==");
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
            return new CoreTestAndExpression();
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
            return new CoreTestOrExpression();
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
            return new CoreTestDivideExpression();
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
            return new CoreTestMultiplyExpression();
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
            var model: CoreTestModel = box.element as CoreTestModel;
            const fun: CoreTestFunction = new CoreTestFunction();
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
            var model: CoreTestModel = box.element as CoreTestModel;
            const entity: CoreTestEntity = new CoreTestEntity();
            model.entities.push(entity);
            return entity;
        },
        boxRoleToSelect: "entity-name"                                                  // <4>
    },
    // end::CreateEntityAction[]
    // tag::CreateAttributeAction[]
    {
        trigger: "attribute",                                                           // <1>
        activeInBoxRoles: ["end-of-attribute-list"],                                    // <2>
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            var entity: CoreTestEntity = box.element as CoreTestEntity;                 // <3>
            const attribute: CoreTestAttribute = new CoreTestAttribute();
            entity.attributes.push(attribute);
            return attribute;
        },
        boxRoleToSelect: "attribute-name"                                               // <4>
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
            PiUtils.CHECK(entity instanceof CoreTestEntity, "current element should be an entity but it is " + entity);
            const proc = entity.piContainer();
            const parent: PiElement = proc.container;
            PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === entity);
            PiUtils.CHECK(parent instanceof CoreTestModel);
            if (parent instanceof CoreTestModel) {
                const e = new CoreTestEntity();
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
            var model: CoreTestModel = box.element as CoreTestModel;
            const entity: CoreTestEntity = CoreTestEntity.create("");
            model.entities.push(entity);
            return Promise.resolve(entity);
        },
        boxRoleToSelect: "entity-name"
    },
    // end::createEntityByEnter[]

];

export class CoreTestActions implements PiActions {
    expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
    binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
    keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;
    constructor() {
        // LOGGER.log("creating CoreTestActions");
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
