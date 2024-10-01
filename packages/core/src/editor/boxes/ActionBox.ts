import { FreLanguageConcept, FreLanguage, FreLanguageProperty, FreLanguageClassifier } from "../../language";
import { BehaviorExecutionResult, executeSingleBehavior } from "../util";
import {FreCreatePartAction, FreCustomAction, FreTriggerType, isRegExp} from "../actions";
import { triggerTypeToString, FreEditor, isProKey } from "../internal";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { FreNode, FreNodeReference } from "../../ast";
import { runInAction } from "mobx";
import { FreLogger } from "../../logging";
import {FreUtils} from "../../util";

const LOGGER: FreLogger = new FreLogger("ActionBox");

export class ActionBox extends AbstractChoiceBox {
    readonly kind: string = "ActionBox";
    placeholder: string;
    /**
     * Filled with the name of the concept, in case this is used to create new concept instance.
     */
    conceptName?: string;

    /**
     * This constructor should be private, but must be public to enable the factory method to call it.
     * @param element
     * @param role
     * @param placeHolder
     * @param initializer
     */
    constructor(element: FreNode, role: string, placeHolder: string, initializer?: Partial<ActionBox>) {
        super(element, role, placeHolder, initializer);
    }

    /**
     * Returns the options (for a dropdown component) that fit this ActionBox.
     * @param editor
     */
    getOptions(editor: FreEditor): SelectOption[] {
        LOGGER.log("getOptions for " + this.$id + "- " + this.conceptName + "." + this.propertyName);
        const result: SelectOption[] = [];
        if (!!this.propertyName && !!this.conceptName) {
            LOGGER.log(`  has property ${this.propertyName} and concept ${this.conceptName}`);
            // If the action box has a property and concept name, then this can be used to create element of the
            // concept type and its subtypes.
            const clsOtIntf: FreLanguageClassifier = FreLanguage.getInstance().classifier(this.conceptName);
            const propDef: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
                this.conceptName,
                this.propertyName,
            );
            LOGGER.log(`clsIntf: ${clsOtIntf} prop kind: ${propDef?.propertyKind}`);
            clsOtIntf.subConceptNames.concat(this.conceptName).forEach((creatableConceptname: string) => {
                const creatableConcept: FreLanguageConcept = FreLanguage.getInstance().concept(creatableConceptname);
                LOGGER.log(`creatableConcept: ${creatableConcept}`);
                if (!!creatableConcept && !creatableConcept.isAbstract) {
                    if (!!creatableConcept.referenceShortcut) {
                        this.addReferenceShortcuts(creatableConcept as FreLanguageConcept, result, editor);
                    }
                    result.push(
                        this.getCreateElementOption(
                            this.propertyName,
                            creatableConceptname,
                            creatableConcept as FreLanguageConcept,
                        ),
                    );
                }
            });
        } else if (!!this.propertyName) {
            // Reference property
            const propDef: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
                this.node.freLanguageConcept(),
                this.propertyName,
            );
            LOGGER.log(`parent: ${this.node.freLanguageConcept()} prop ${propDef.name} kind: ${propDef?.propertyKind}`);
            this.addReferences(this.node, propDef, result, editor);
        } else {
            LOGGER.log("No property and concept defined for action box " + this.role);
        }
        // Using the new actions:
        // Now look in all actions defined in the editor whether they fit this action, except for the keyboard shortcuts
        editor.newFreActions
            .filter((action) => !isProKey(action.trigger) && action.activeInBoxRoles.includes(this.role))
            .forEach((action) => {
                const options: SelectOption[] = [];
                options.push({
                    id: triggerTypeToString(action.trigger), // + "_action",
                    label: triggerTypeToString(action.trigger), // + "_action",
                    action: action,
                    description: "action " + triggerTypeToString(action.trigger),
                });
                // }
                result.push(...options);
            });
        return result;
    }

    private getCreateElementOption(
        propertyName: string,
        conceptName: string,
        concept: FreLanguageConcept,
    ): SelectOption {
        LOGGER.log("ActionBox.createElementAction property: " + propertyName + " concept " + conceptName);
        return {
            id: conceptName,
            label: concept.trigger,
            action: new FreCreatePartAction({
                propertyName: propertyName,
                conceptName: conceptName,
            }),
            description: "action auto",
        };
    }

    /**
     * Get all referable element for the reference shortcut of concept
     * @param concept The concept with the referenceShortcut
     * @param result  The array where the resulting actions should be added to
     * @param editor  The editor context
     * @private
     */
    private addReferenceShortcuts(concept: FreLanguageConcept, result: SelectOption[], editor: FreEditor) {
        // Create the new element for this behavior inside a dummy and then point the owner to the
        // current element.  This way the new element is not part of the model and will not trigger mobx
        // reactions. But the scoper can be used to find available references, because the scoper only
        // needs the owner.
        const self: ActionBox = this;
        runInAction(() => {
            const newElement = concept.constructor();
            newElement["$$owner"] = this.node;
            result.push(
                ...editor.environment.scoper
                    .getVisibleNames(newElement, concept.referenceShortcut.conceptName)
                    .filter((name) => !!name && name !== "")
                    .map((name) => ({
                        id: concept.trigger + "-" + name,
                        label: name,
                        description: "create " + concept.referenceShortcut.conceptName,
                        action: new FreCreatePartAction({
                            referenceShortcut: {
                                propertyName: concept.referenceShortcut.propertyName,
                                conceptName: concept.referenceShortcut.conceptName,
                            },
                            propertyName: self.propertyName,
                            conceptName: concept.typeName,
                        }),
                    })),
            );
        });
    }

    /**
     * Get all referable elements for the property
     * @param parentNode
     * @param property
     * @param result  The array where the resulting actions should be added to
     * @param editor  The editor context
     * @private
     */
    private addReferences(
        parentNode: FreNode,
        property: FreLanguageProperty,
        result: SelectOption[],
        editor: FreEditor,
    ) {
        // Create the new element for this behavior inside a dummy and then point the owner to the
        // current element.  This way the new element is not part of the model and will not trigger mobx
        // reactions. But the scoper can be used to find available references, because the scoper only
        // needs the owner.
        LOGGER.log("addReferences: " + parentNode.freLanguageConcept() + " property " + property.name);
        const propType: string = property.type;
        // const self: ActionBox = this;
        runInAction(() => {
            // const newElement = concept.constructor();
            // newElement["$$owner"] = this.element;
            result.push(
                ...editor.environment.scoper
                    .getVisibleNames(parentNode, propType)
                    .filter((name) => !!name && name !== "")
                    .map((name) => ({
                        id: parentNode.freLanguageConcept() + "-" + name,
                        label: name,
                        description: "create ref to " + propType,
                        action: FreCustomAction.create({
                            activeInBoxRoles: [],
                            // @ts-ignore
                            action: (box: Box, trigger: FreTriggerType, ed: FreEditor): FreNode | null => {
                                parentNode[property.name].push(FreNodeReference.create(name, null));
                                return null;
                            },
                        }),
                    })),
            );
        });
    }

    triggerKeyPressEvent = (key: string) => {
        // TODO rename this one, e.g. to triggerKeyEvent
        console.error("ActionBox " + this.role + " has empty triggerKeyPressEvent " + key);
    };

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        console.log("ActionBox executeOption " + JSON.stringify(option));
        FreUtils.CHECK(!!option.action, `ActionBox.executeOption: action missing for ${option.label}` )
        if (!!option.action) {
            return executeSingleBehavior(option.action, this, option.id, option.label, editor);
        }
        return BehaviorExecutionResult.NULL;
    }

    tryToExecute(key: string, editor: FreEditor): BehaviorExecutionResult {
        console.log(`ActionBox ${this.id} tryToExecute [${key}]`);
        let result: BehaviorExecutionResult;
        // Try if key fits one of the options, and execute the action that is associated with it
        const filteredOptions: SelectOption[] = this.getOptions(editor).filter(o => o.label.startsWith(key));
        if (filteredOptions.length === 1 && filteredOptions[0].label === key ) {
            result = this.executeOption(editor, filteredOptions[0]);
        } else {
            // Try if key matches a regular expression, and execute the action that is associated with it
            result = this.tryToMatchRegExpAndExecuteAction(key, editor);
            if (result !== BehaviorExecutionResult.EXECUTED) {
                // The action was not executed, so add 'key' to the text that is already present
                this.textHelper.setText(this.textHelper.getText() + key);
                this.isDirty();
            }
        }
        return result;
    }

    tryToMatchRegExpAndExecuteAction(text: string, editor: FreEditor): BehaviorExecutionResult {
        console.log(`ActionBox tryToMatchRegExpAndExecuteAction [${text}]`);
        // Try to match a regular expression
        const matchingOption = this.getOptions(editor).find(option => {
            if (isRegExp(option.action.trigger)) {
                if (option.action.trigger.test(text)) {
                    LOGGER.log("Matched regexp" + triggerTypeToString(option.action.trigger) + " for '" + text + "'");
                    return true;
                }
                return false;
            }
            return false;
        })
        // If there is a match, execute it.
        if (!!matchingOption) {
            LOGGER.log(`Found match to regexp: ${matchingOption.label}`);
            return this.executeOption(editor, matchingOption);
        }
        return BehaviorExecutionResult.NO_MATCH;
    }
}

export function isActionBox(b: Box): b is ActionBox {
    return b?.kind === "ActionBox"; //  b instanceof ActionBox;
}

export function isActionTextBox(b: Box): boolean {
    return b?.kind === "TextBox" && isActionBox(b?.parent);
}
