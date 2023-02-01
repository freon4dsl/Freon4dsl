import { Concept, Language } from "../../language";
import { BehaviorExecutionResult, executeBehavior, executeSingleBehavior } from "../util";
import { PiCreatePartAction } from "../actions";
import { triggerTypeToString, PiEditor, TextBox, isProKey } from "../internal";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { PiElement } from "../../ast";
import { runInAction } from "mobx";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("ActionBox");

export class ActionBox extends AbstractChoiceBox {
    readonly kind = "ActionBox";
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
    constructor(element: PiElement, role: string, placeHolder: string, initializer?: Partial<ActionBox>) {
        super(element, role, placeHolder, initializer);
    }

    selectOption(editor: PiEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("ActionBox selectOption " + JSON.stringify(option));
        if (!!option.action) {
            return executeSingleBehavior(option.action, this, option.id, option.label, editor);
        } else {
            // Try all statically defined actions
            const result = executeBehavior(this, option.id, option.label, editor);
            if (result === BehaviorExecutionResult.EXECUTED) {
                return result;
            }
            // Wasn't a match, now get all dynamic options, including referenceShortcuts and check these
            const allOptions = this.getOptions(editor);
            const selectedOptions = allOptions.filter(o => option.label === o.label);
            if (selectedOptions.length === 1) {
                LOGGER.log("ActionBox.selectOption dynamic " + JSON.stringify(selectedOptions));
                return executeBehavior(this, selectedOptions[0].id, selectedOptions[0].label, editor);
            } else {
                LOGGER.log("ActionBox.selectOption : " + JSON.stringify(selectedOptions));
                return BehaviorExecutionResult.NO_MATCH;
            }
        }
    }

    /**
     * Returns the options (for a dropdown component) that fit this ActionBox.
     * @param editor
     */
    getOptions(editor: PiEditor): SelectOption[] {
        const result: SelectOption[] = [];
        if( !!this.propertyName && !!this.conceptName) {
            // If the action box has a property and concept name, then this can be used to create element of the
            // concept type and its subtypes.
            const clsOtIntf = Language.getInstance().concept(this.conceptName) ?? Language.getInstance().interface(this.conceptName);
            clsOtIntf.subConceptNames.concat(this.conceptName).forEach( (creatableConceptname: string) => {
                const creatableConcept = Language.getInstance().concept(creatableConceptname);
                if (!!creatableConcept && !creatableConcept.isAbstract) {
                    if (!!(creatableConcept.referenceShortcut)) {
                        this.addReferenceShortcuts(creatableConcept, result, editor);
                    }
                    result.push(this.getCreateElementOption(this.propertyName, creatableConceptname, creatableConcept));
                }
            });
        } else {
            LOGGER.log("No property and concept defined for action box " + this.role);
        }
        // Using the new actions:
        // Now look in all actions defined in the editor whether they fit this action, except for the keyboard shortcuts
        editor.newPiActions
            .filter(action => !isProKey(action.trigger) && action.activeInBoxRoles.includes(this.role))
            .forEach(action => {
                const options: SelectOption[] = [];
                options.push({
                    id: triggerTypeToString(action.trigger) ,//+ "_action",
                    label: triggerTypeToString(action.trigger),// + "_action",
                    action: action,
                    description: "action " + triggerTypeToString(action.trigger)
                });
                // }
                result.push(...options);
            });
        return result;
    }

    private getCreateElementOption(propertyName: string, conceptName: string, concept: Concept): SelectOption {
        LOGGER.log("ActionBox.createElementAction property: " + propertyName + " concept " + conceptName);
        return {
            id: conceptName,
            label: concept.trigger,
            action: new PiCreatePartAction({
                propertyName: propertyName,
                conceptName: conceptName,
            }),
            description: "action auto"
        };
    }

    /**
     * Get all referrable element for the reference shortcut of concept
     * @param concept The concept with the referenceShortcut
     * @param result  The array where the resutling actions should be addedd to
     * @param editor  The editor context
     * @private
     */
    private addReferenceShortcuts(concept: Concept, result: SelectOption[], editor: PiEditor) {
        // Create the new element for this behavior inside a dummy and then point the owner to the
        // current element.  This way the new element is not part of the model and will not trigger mobx
        // reactions. But the scoper can be used to find available references, because the scoper only
        // needs the owner.
        const self: ActionBox = this;
        runInAction(() => {
            const newElement = concept.constructor();
            newElement["owner"] = this.element;
            result.push(...
                editor.environment
                    .scoper.getVisibleNames(newElement, concept.referenceShortcut.conceptName)
                    .filter(name => !!name && name !== "")
                    .map(name => ({
                        id: concept.trigger + "-" + name,
                        label: name,
                        description: "create " + concept.referenceShortcut.conceptName,
                        action: new PiCreatePartAction({
                            referenceShortcut: {
                                propertyName: concept.referenceShortcut.propertyName,
                                conceptName: concept.referenceShortcut.conceptName
                            },
                            propertyName: self.propertyName,
                            conceptName: concept.typeName
                        })
                    })));
        });
    }

    triggerKeyPressEvent = (key: string) => { // TODO rename this one, e.g. to triggerKeyEvent
        console.error("ActionBox " + this.role + " has empty triggerKeyPressEvent");
    };
}

export function isActionBox(b: Box): b is ActionBox {
    return b?.kind === "ActionBox"; //  b instanceof ActionBox;
}

export function isActionTextBox(b: Box): boolean {
    return b?.kind === "TextBox" && isActionBox(b?.parent);
}


