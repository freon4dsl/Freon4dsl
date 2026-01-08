import { Box } from "./Box.js"
import type { SelectOption } from "./SelectOption.js"
import type { FreEditor } from "../FreEditor.js"
import { autorun } from "mobx"
import type { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js"
import { FreUtils, isNullOrUndefined, notNullOrUndefined } from "../../util/index.js"
import { BehaviorExecutionResult, createOptions, executeSingleBehavior } from "../util/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLanguage, type FreLanguageProperty } from "../../language/index.js"
import { AST } from "../../change-manager/index.js"

const LOGGER: FreLogger = new FreLogger("NewOptionalBox");

export class NewOptionalBox extends Box {
    readonly kind: string = "NewOptionalBox";

    content: Box = null;
    placeholder: string = 'placeholder';
    /**
     * Filled with the name of the concept, in case the optional needs to create new concept instance or reference.
     * May remain undefined when the property is primitive.
     */
    conceptOfProperty?: string;

    constructor(node: FreNode,
                role: string,
                placeHolder: string,
                contentBox: Box,
                initializer?: Partial<NewOptionalBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.placeholder = placeHolder
        this.content = contentBox;
        contentBox.parent = this;
        autorun(this.contentChanged);
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("OptionalBox executeOption " + JSON.stringify(option));
        FreUtils.CHECK(!!option.action, `OptionalBox.executeOption: action missing for ${option.label}` )
        if (!!option.action) {
            return executeSingleBehavior(option.action, this, option.label, editor);
        }
        LOGGER.log("<== OptionalBox executeOption " );
        return BehaviorExecutionResult.NULL;
    }

    getOptions(editor: FreEditor): SelectOption[] {
        LOGGER.log("getOptions for " + this.$id + "- " + this.conceptOfProperty + "." + this.propertyName);
        return createOptions(editor, this.node, this, this.conceptOfProperty);
    }

    removeContent() {
        console.log('removeContent TODO');
        const self: NewOptionalBox = this;
        AST.change( ()=> {
            self.node[self.propertyName] = undefined;
        });
    }

    isEmpty(): boolean {
        console.log('isEmpty');
        const nodeConcept = this.node.freLanguageConcept();
        const propDef: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            nodeConcept,
            this.propertyName
        );
        if (isNullOrUndefined(propDef)) {
            console.log(`Cannot find property definition for property ${this.propertyName} of concept ${nodeConcept}.`)
            return false;
        }
        if (propDef.propertyKind === "primitive") {
            const actualValue = this.node[this.propertyName];
            // todo check whether these are the right conditions
            if (typeof actualValue === "string") {
                return actualValue.length === 0;
            } else if (typeof actualValue === "boolean") {
                return isNullOrUndefined(actualValue);
            } else if (typeof actualValue === "number") {
                return isNullOrUndefined(actualValue);
            }
        } else if (propDef.propertyKind === "part") {
            const actualValue: FreNode[] = FreLanguage.getInstance().getPropertyValue(this.node, propDef);
            return isNullOrUndefined(actualValue) || actualValue.length === 0;
        } else if (propDef.propertyKind === "reference") {
            const actualValue: FreNodeReference<FreNamedNode>[] = FreLanguage.getInstance().getReferencePropertyValue(this.node, propDef);
            return isNullOrUndefined(actualValue) || actualValue.length === 0;
        }
        return true;
    }

    contentChanged() {
        this.isEmpty();
        this.isDirty();
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (notNullOrUndefined(this.content)) {
            return this.content.firstLeaf;
        }
        return null;
    }

    get lastLeaf(): Box {
        if (notNullOrUndefined(this.content)) {
            return this.content.lastLeaf;
        }
        return null;
    }

    get firstEditableChild(): Box {
        if (notNullOrUndefined(this.content)) {
            return this.content.firstEditableChild;
        }
        return null;
    }

    get children(): ReadonlyArray<Box> {
        if (notNullOrUndefined(this.content)) {
            return [this.content];
        }
        return [];
    }

}

export function isNewOptionalBox(b: Box): b is NewOptionalBox {
    return b?.kind === "NewOptionalBox"; // b instanceof NewOptionalBox;
}
