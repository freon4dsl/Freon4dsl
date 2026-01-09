import { Box } from "./Box.js"
import type { SelectOption } from "./SelectOption.js"
import type { FreEditor } from "../FreEditor.js"
import { autorun } from "mobx"
import type { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js"
import { FreUtils, isNullOrUndefined } from "../../util/index.js"
import { BehaviorExecutionResult, createOptions, executeSingleBehavior } from "../util/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLanguage, type FreLanguageProperty } from "../../language/index.js"
import { AST } from "../../change-manager/index.js"
import { isBooleanControlBox } from "./BooleanControlBox.js"
import { isSelectBox } from "./SelectBox.js"

const LOGGER: FreLogger = new FreLogger("NewOptionalBox");

export class NewOptionalBox extends Box {
    readonly kind: string = "NewOptionalBox";

    content: Box = null;
    placeholder: string = 'placeholder';
    /**
     * The name of the concept of the node attached to this box.
     */
    nodeConcept: string;
    /**
     * Filled with the name of the concept, in case the optional needs to create new concept instance or reference.
     * May remain undefined when the property is primitive.
     */
    conceptOfProperty?: string;
    /**
     * Holds the definition of the optional property that is contained in this box.
     */
    private _propDef: FreLanguageProperty;

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
        this.nodeConcept = this.node.freLanguageConcept();
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("OptionalBox executeOption " + JSON.stringify(option) + `${this.nodeConcept}, this.propDef: ${this.propDef?.propertyKind}`);
        if (this.propDef.propertyKind === "primitive") {
            let actualValue = this.node[this.propertyName];
            LOGGER.log(`isPrimitive for property ${this.propertyName}, actualValue: "${actualValue}"`);
            if (this.propDef.type === "boolean") {
                const boolBox: Box = this.content.firstEditableChild;
                console.log(`getOptions: boolBox: ${boolBox?.kind}`);
                if (isBooleanControlBox(boolBox)) {
                    AST.change(() => {
                        if (option.id === boolBox.labels.yes) {
                            actualValue = true;
                        } else if (option.id === boolBox.labels.no) {
                            actualValue = false;
                        } else if (option.id === boolBox.labels.unknown) {
                            actualValue = undefined;
                        }
                    });
                } else if (isSelectBox(boolBox)) {
                    boolBox.executeOption(editor, option);
                }
            }
            // else if (typeof actualValue === "number") {
                //     return isNullOrUndefined(actualValue);
                // }
        } else {
            FreUtils.CHECK(!!option?.action, `NewOptionalBox.executeOption: action missing for ${option?.label}`)
            if (!!option.action) {
                return executeSingleBehavior(option.action, this, option.label, editor);
            }
            LOGGER.log("<== DONE OptionalBox executeOption ");
        }
        return BehaviorExecutionResult.NULL;
    }

    getOptions(editor: FreEditor): SelectOption[] {
        LOGGER.log(`getOptions: ${this.nodeConcept}, this.propDef: ${this.propDef?.propertyKind}`);
        if (this.propDef.propertyKind === "primitive") {
            if (this.propDef.type === "boolean") {
                const boolBox: Box = this.content.firstEditableChild;
                console.log(`getOptions: boolBox: ${boolBox?.kind}`);
                if (isBooleanControlBox(boolBox)) {
                    // Create two options, one for true and one for false
                    return [
                        {
                            id: boolBox.labels.yes,
                            label: boolBox.labels.yes,
                            description: `true value for ${ this.propertyName }`,
                        },
                        {
                            id: boolBox.labels.no,
                            label: boolBox.labels.no,
                            description: `false value for ${ this.propertyName }`,
                        }
                    ];
                } else if (isSelectBox(boolBox)) {
                    // Use the options from the SelectBox, but filter out the 'unknown' option
                    const rawResult = boolBox.getOptions(editor);
                    return [rawResult[0], rawResult[1]];
                }
            }
            return [];
        } else {
            LOGGER.log("getOptions for " + this.$id + "- " + this.conceptOfProperty + "." + this.propertyName)
            return createOptions(editor, this.node, this, this.conceptOfProperty)
        }
    }

    removeContent() {
        LOGGER.log(`removeContent ${this.id}`);
        const self: NewOptionalBox = this;
        if (this.propDef.propertyKind === "primitive") {
            if (this.propDef.type === "boolean") {
                AST.change(() => {
                    self.node[self.propertyName] = undefined;
                });
            } else if (this.propDef.type === "string") {
                AST.change(() => {
                    self.node[self.propertyName] = "";
                });
            } else if (this.propDef.type === "number") {
                AST.change(() => {
                    self.node[self.propertyName] = 0; // todo improve when undefined value for numbers has been decided
                });
            }
        } else if (this.propDef.propertyKind === "part") {
            AST.change(() => {
                self.node[self.propertyName] = undefined;
            });
        }
        console.log(`removeContent ${this.id}: "${this.node[this.propertyName]}"`);
    }

    isEmpty(): boolean {
        LOGGER.log(`isEmpty for property ${this.propertyName} of concept ${this.nodeConcept}`);

        LOGGER.log(`executeOption: ${this.nodeConcept}, this.propDef: ${this.propDef?.propertyKind}`);
        if (isNullOrUndefined(this.propDef)) {
            LOGGER.log(`Cannot find property definition for property ${this.propertyName} of concept ${this.nodeConcept}.`)
            return false;
        }
        if (this.propDef.propertyKind === "primitive") {
            const actualValue = this.node[this.propertyName];
            LOGGER.log(`isPrimitive for property ${this.propertyName}, actualValue: "${actualValue}"`);
            // todo check whether these are the right conditions
            if (typeof actualValue === "string") {
                return actualValue.length === 0;
            } else if (typeof actualValue === "boolean") {
                return isNullOrUndefined(actualValue);
            } else if (typeof actualValue === "number") {
                return isNullOrUndefined(actualValue);
            }
        } else if (this.propDef.propertyKind === "part") {
            const actualValue: FreNode[] = FreLanguage.getInstance().getPropertyValue(this.node, this.propDef);
            return isNullOrUndefined(actualValue) || actualValue.length === 0;
        } else if (this.propDef.propertyKind === "reference") {
            const actualValue: FreNodeReference<FreNamedNode>[] = FreLanguage.getInstance().getReferencePropertyValue(this.node, this.propDef);
            return isNullOrUndefined(actualValue) || actualValue.length === 0;
        }
        return true;
    }

    contentChanged = () => {
        LOGGER.log(`contentChanged ${this.id}`);
        this.isEmpty();
        this.isDirty();
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (!this.isEmpty()) {
            return this.content.firstLeaf;
        }
        return null;
    }

    get lastLeaf(): Box {
        if (!this.isEmpty()) {
            return this.content.lastLeaf;
        }
        return null;
    }

    get firstEditableChild(): Box {
        if (!this.isEmpty()) {
            return this.content.firstEditableChild;
        }
        return null;
    }

    get children(): ReadonlyArray<Box> {
        if (!this.isEmpty()) {
            return [this.content];
        }
        return [];
    }

    /**
     * Returns the definition of the optional property that is contained in this box.
     */
    private get propDef(): FreLanguageProperty {
        if (isNullOrUndefined(this._propDef)) {
            this._propDef = FreLanguage.getInstance().classifierProperty(this.nodeConcept, this.propertyName)
        }
        return this._propDef;
    }
}

export function isNewOptionalBox(b: Box): b is NewOptionalBox {
    return b?.kind === "NewOptionalBox"; // b instanceof NewOptionalBox;
}
