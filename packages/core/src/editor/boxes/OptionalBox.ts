import { FREON } from "../../environment/index.js"
import { Box } from "./Box.js"
import type { SelectOption } from "./SelectOption.js"
import type { FreEditor } from "../FreEditor.js"
import { autorun } from "mobx"
import type { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js"
import { FreUtils, isNullOrUndefined } from "../../util/index.js"
import { BehaviorExecutionResult, createOptionsForOptional, executeSingleBehavior } from "../util/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLanguage, type FreLanguageProperty } from "../../language/index.js"
import { isBooleanControlBox } from "./BooleanControlBox.js"
import { isSelectBox } from "./SelectBox.js"

const LOGGER: FreLogger = new FreLogger("OptionalBox");

export class OptionalBox extends Box {
    readonly kind: string = "OptionalBox"

    content: Box = null
    placeholder: string = "placeholder"
    /**
     * Switch between showing the placeholder text or an icon in the 'add' button in the accompanying component
     */
    showPlaceholderButton: boolean = true;
    /**
     * The name of the concept of the parent node attached to this box.
     */
    nodeConcept: string
    /**
     * Filled with the name of the concept, in case the optional needs to create new concept instance or reference.
     * May remain undefined when the property is primitive.
     */
    conceptOfProperty?: string
    /**
     * Holds the definition of the optional property that is contained in this box.
     */
    private _propDef: FreLanguageProperty

    constructor(node: FreNode, role: string, placeHolder: string, contentBox: Box, initializer?: Partial<OptionalBox>) {
        super(node, role)
        FreUtils.initializeObject(this, initializer)
        this.placeholder = placeHolder
        this.content = contentBox
        contentBox.parent = this
        autorun(this.contentChanged)
        this.nodeConcept = this.node.freLanguageConcept()
    }

    getOptions(editor: FreEditor): SelectOption[] {
        LOGGER.log(`getOptions: ${this.nodeConcept}, this.propDef: ${this.propDef?.propertyKind}`)
        if (this.propDef.propertyKind === "primitive") {
            if (this.propDef.type === "boolean") {
                return this.getBooleanOptions(editor)
            }
            return []
        } else {
            console.log("getOptions for " + this.$id + "- " + this.conceptOfProperty + "." + this.propertyName)
            return createOptionsForOptional(editor, this.node, this, this.propDef)
        }
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("OptionalBox executeOption " + JSON.stringify(option) + ` ${this.nodeConcept}, this.propDef: ${this.propDef?.propertyKind}`)
        if (this.propDef.propertyKind === "primitive") {
            const self: OptionalBox = this
            LOGGER.log(`isPrimitive for property ${this.propertyName}, actualValue: "${self.node[self.propertyName]}"`)
            if (this.propDef.type === "boolean") {
                const boolBox: Box = this.content.firstEditableChild
                LOGGER.log(`getOptions: boolBox: ${boolBox?.kind}`)
                if (isBooleanControlBox(boolBox)) {
                    FREON.astChanger.change(() => {
                        if (option.id === boolBox.labels.yes) {
                            self.node[self.propertyName] = true
                        } else if (option.id === boolBox.labels.no) {
                            self.node[self.propertyName] = false
                        } else if (option.id === boolBox.labels.unknown) {
                            self.node[self.propertyName] = undefined
                        }
                    })
                } else if (isSelectBox(boolBox)) {
                    boolBox.executeOption(editor, option)
                }
            } else if (this.propDef.type === "string") {
                LOGGER.log("found string")
                FREON.astChanger.change(() => {
                    self.node[self.propertyName] = ""
                })
            } else if (this.propDef.type === "number") {
                FREON.astChanger.change(() => {
                    self.node[self.propertyName] = 0
                })
            }
            // TODO: find out whether this next line can be removed
            editor.selectFirstLeafChildBox()
        } else {
            FreUtils.CHECK(!!option?.action, `OptionalBox.executeOption: action missing for ${option?.label}`)
            if (!!option.action) {
                return executeSingleBehavior(option.action, this, option.label, editor)
            }
            LOGGER.log("<== DONE OptionalBox executeOption ")
        }
        return BehaviorExecutionResult.NULL
    }

    /**
     * Sets the value of the property that is contained in this Optional Box to not present / not set.
     */
    removeContent() {
        LOGGER.log(`removeContent ${this.id}`)
        const self: OptionalBox = this
        if (!this.propDef.isList) {
            FREON.astChanger.change(() => {
                self.node[self.propertyName] = undefined
            })
        } else {
            FREON.astChanger.change(() => {
                (self.node[self.propertyName] as []).length = 0
            })
        }
        LOGGER.log(`removeContent ${this.id}: "${this.node[this.propertyName]}"`)
        this.isDirty()
    }

    /**
     * Returns true when the property that is contained in this Optional Box is not present / not set.
     */
    isEmpty(): boolean {
        LOGGER.log(`isEmpty for property ${this.propertyName} of concept ${this.nodeConcept}`)
        if (isNullOrUndefined(this.propDef)) {
            LOGGER.log(`Cannot find property definition for property ${this.propertyName} of concept ${this.nodeConcept}.`)
            return false
        }
        if (this.propDef.propertyKind === "primitive") {
            const actualValue = this.node[this.propertyName]
            LOGGER.log(`isPrimitive for property ${this.propertyName}, actualValue: "${actualValue}"`)
            if (!this.propDef.isList) {
                return isNullOrUndefined(actualValue)
            } else {
                return actualValue.length === 0
            }
        } else if (this.propDef.propertyKind === "part") {
            const actualValue: FreNode[] = FreLanguage.getInstance().getPropertyValue(this.node, this.propDef)
            return isNullOrUndefined(actualValue) || actualValue.length === 0
        } else if (this.propDef.propertyKind === "reference") {
            const actualValue: FreNodeReference<FreNamedNode>[] = FreLanguage.getInstance().getReferencePropertyValue(this.node, this.propDef)
            return isNullOrUndefined(actualValue) || actualValue.length === 0
        }
        return true
    }

    contentChanged = () => {
        LOGGER.log(`contentChanged ${this.id}`)
        this.isEmpty()
        this.isDirty()
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (!this.isEmpty()) {
            return this.content.firstLeaf
        }
        return null
    }

    get lastLeaf(): Box {
        if (!this.isEmpty()) {
            return this.content.lastLeaf
        }
        return null
    }

    get firstEditableChild(): Box {
        if (!this.isEmpty()) {
            return this.content.firstEditableChild
        }
        return null
    }

    get children(): ReadonlyArray<Box> {
        if (!this.isEmpty()) {
            return [this.content]
        }
        return []
    }

    /**
     * Returns the definition of the optional property that is contained in this box.
     */
    private get propDef(): FreLanguageProperty {
        if (isNullOrUndefined(this._propDef)) {
            this._propDef = FreLanguage.getInstance().classifierProperty(this.nodeConcept, this.propertyName)
        }
        return this._propDef
    }

    /**
     * Returns the SelectOptions for the property, when it is of boolean type.
     * @param editor
     * @private
     */
    private getBooleanOptions(editor: FreEditor): SelectOption[] {
        const boolBox: Box = this.content.firstEditableChild
        LOGGER.log(`getOptions: boolBox: ${boolBox?.kind}`)
        if (isBooleanControlBox(boolBox)) {
            // Create two options, one for true and one for false
            return [
                {
                    id: boolBox.labels.yes,
                    label: boolBox.labels.yes,
                    description: `true value for ${this.propertyName}`,
                },
                {
                    id: boolBox.labels.no,
                    label: boolBox.labels.no,
                    description: `false value for ${this.propertyName}`,
                },
            ]
        } else if (isSelectBox(boolBox)) {
            // Use the options from the SelectBox, but filter out the 'unknown' option
            const rawResult = boolBox.getOptions(editor)
            return [rawResult[0], rawResult[1]]
        }
        return []
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b?.kind === "OptionalBox"; // b instanceof OptionalBox;
}
