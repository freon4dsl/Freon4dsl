import axios from "axios";
import * as Keys from "@projectit/core";
import {
    Box,
    EXPRESSION_PLACEHOLDER,
    KeyboardShortcutBehavior,
    MetaKey,
    PiActions,
    PiBinaryExpressionCreator,
    PiCustomBehavior,
    PiEditor,
    PiElement,
    PiExpressionCreator,
    PiKey,
    PiLogger,
    PiTriggerType
} from "@projectit/core";
import {
    MetaConcept,
    MetaElementProperty,
    MetaEnumeration,
    MetaEnumerationLiteral,
    MetaModel,
    MetaPrimitiveProperty
} from "../language/MetaModel";
const LOGGER = new PiLogger("MetaActions");

const EXPRESSION_CREATORS: PiExpressionCreator[] = [];

const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [];

const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
    {
        trigger: "element",
        activeInBoxRoles: ["empty-list-for-elements"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newElement = new MetaConcept();
            (box.element as MetaModel).elements.push(newElement);
            return newElement;
        },
        boxRoleToSelect: "textbox-name"
    },
    {
        trigger: "enumeration",
        activeInBoxRoles: ["empty-list-for-enumerations"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newElement = new MetaEnumeration();
            (box.element as MetaModel).enumerations.push(newElement);
            return newElement;
        },
        boxRoleToSelect: "textbox-name"
    },
    {
        trigger: "literal",
        activeInBoxRoles: ["empty-list-for-literals"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newElement = new MetaEnumerationLiteral();
            (box.element as MetaEnumeration).literals.push(newElement);
            return newElement;
        },
        boxRoleToSelect: "textbox-name"
    },
    {
        trigger: "property",
        activeInBoxRoles: ["empty-list-for-properties"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newElement = new MetaPrimitiveProperty();
            (box.element as MetaConcept).properties.push(newElement);
            return newElement;
        },
        boxRoleToSelect: "textbox-name"
    },
    {
        trigger: "reference",
        activeInBoxRoles: ["empty-list-for-references"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newReference = new MetaElementProperty();
            (box.element as MetaConcept).references.push(newReference);
            return newReference;
        },
        boxRoleToSelect: "textbox-name"
    },
    {
        trigger: "part",
        activeInBoxRoles: ["empty-list-for-parts"],
        action: (box: Box, trigger: PiTriggerType, editor: PiEditor): PiElement | null => {
            const newPart = new MetaElementProperty();
            (box.element as MetaConcept).parts.push(newPart);
            return newPart;
        },
        boxRoleToSelect: "textbox-name"
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
    }
];

export class MetaActions implements PiActions {
    expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
    binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
    keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;

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
