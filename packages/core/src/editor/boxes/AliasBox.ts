import { Concept, Language } from "../../storage/index";
import { BehaviorExecutionResult, executeBehavior, executeSingleBehavior, PiLogger } from "../../util";
import { PiCreatePartAction } from "../actions/PiCreatePartAction";
import { triggerToString, PiEditor, TextBox, PiCustomAction } from "../internal";
import { DummyBox, DummyElement } from "./DummyBox";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { PiElement } from "../../language";
import { runInAction } from "mobx";

const LOGGER = new PiLogger("AliasBox");

export class AliasBox extends AbstractChoiceBox {
    readonly kind = "AliasBox";
    placeholder: string;
    /**
     * Filled with the name of the property, in case the AliasBox is used to create new elements
     */
    propertyName?: string;
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
    constructor(element: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>) {
        super(element, role, placeHolder, initializer);
    }

    selectOption(editor: PiEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("AliasBox selectOption " + JSON.stringify(option));
        if (!!option.action) {
            return executeSingleBehavior(option.action, this, option.id, option.label, editor);
        } else {
            // Try all statically defined actions
            let result = executeBehavior(this, option.id, option.label, editor);
            if (result === BehaviorExecutionResult.EXECUTED) {
                return result;
            }
            // Wasn't a match, now get all dynamic options, including referenceShortcuts and check these
            const allOptions = this.getOptions(editor);
            const selectedOptions = allOptions.filter(o => option.label === o.label);
            if (selectedOptions.length === 1) {
                LOGGER.log("AliasBox.selectOption dynamic " + JSON.stringify(selectedOptions));
                return executeBehavior(this, selectedOptions[0].id, selectedOptions[0].label, editor);
            } else {
                LOGGER.log("AliasBox.selectOption : " + JSON.stringify(selectedOptions));
                return BehaviorExecutionResult.NO_MATCH;
            }
        }
    }

    getOptions(editor: PiEditor): SelectOption[] {
        const result: SelectOption[] = [];
        if( !!this.propertyName && !!this.conceptName) {
            // If the alias box has a property and concept name, then this can be used to create element of the
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
            LOGGER.log("No property and concept defined for alias box " + this.role);
        }
        // Using the new actions:
        // Now look in all actions defined in the editor whether they fit this alias
        editor.new_pi_actions
            .filter(action => action.activeInBoxRoles.includes(this.role))
            .forEach(action => {
                const options: SelectOption[] = [];
                options.push({
                    id: triggerToString(action.trigger) ,//+ "_action",
                    label: triggerToString(action.trigger),// + "_action",
                    action: action,
                    description: "alias " + triggerToString(action.trigger)
                });
                // }
                result.push(...options);
            });

        // Now look in all actions defined in the ediotr whether they fit this alias
        // editor.behaviors
        //     .filter(behavior => behavior.activeInBoxRoles.includes(this.role))
        //     .forEach(behavior => {
        //         const options: SelectOption[] = [];
                // If the behavior has a referenceShortcut, we need to find all potential referred elements and add them to the options.
                // TODO Decide whethers this is neede, sas it assumes quite a lot implicitly
                // if (!!(behavior.referenceShortcut)) {
                //     // Create the new element for this behavior inside a dummy and then point the container to the
                //     // current element.  This way the new element is not part of the model and will not trigger mobx
                //     // reactions. But the scoper can be used to find available references, because the scoper only
                //     // needs the container.
                //     const dummyElement = new DummyElement();
                //     const dummyBox = new DummyBox(dummyElement, "dummy-role");
                //     runInAction(() => {
                //         const newElement = behavior.execute(dummyBox, triggerToString(behavior.trigger), editor);
                //         newElement["container"] = this.element;
                //         options.push(...
                //             editor.environment
                //                 .scoper.getVisibleNames(newElement, behavior.referenceShortcut.metatype)
                //                 .filter(name => !!name && name !== "")
                //                 .map(name => ({
                //                     id: triggerToString(behavior.trigger) + "-" + name,
                //                     label: name,
                //                     description: behavior.referenceShortcut.metatype,
                //                     behavior: behavior
                //                 })));
                //     });
                // }
                /// if there are no reference shortcut options, add the alias itself
                // if (options.length === 0) {
                //     options.push({
                //         id: triggerToString(behavior.trigger),
                //         label: triggerToString(behavior.trigger),
                //         behavior: behavior,
                //         description: "alias " + triggerToString(behavior.trigger)
                //     });
                // }
            //     result.push(...options);
            // });
        return result;
    }

    private getCreateElementOption(propertyName: string, conceptName: string, concept: Concept): SelectOption {
        console.log("AliasBox.createElementAction proeprty: " + propertyName + " concept " + conceptName);
        return {
            id: conceptName,
            label: concept.trigger,
            action: new PiCreatePartAction({
                propertyName: propertyName,
                conceptName: conceptName,
            }),
            description: "alias auto"
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
        // Create the new element for this behavior inside a dummy and then point the container to the
        // current element.  This way the new element is not part of the model and will not trigger mobx
        // reactions. But the scoper can be used to find available references, because the scoper only
        // needs the container.
        const self: AliasBox = this;
        runInAction(() => {
            const newElement = concept.constructor();
            newElement["container"] = this.element;
            result.push(...
                editor.environment
                    .scoper.getVisibleNames(newElement, concept.referenceShortcut.metatype)
                    .filter(name => !!name && name !== "")
                    .map(name => ({
                        id: concept.trigger + "-" + name,
                        label: name,
                        description: "create " + concept.referenceShortcut.metatype,
                        action: new PiCreatePartAction({
                            referenceShortcut: {
                                propertyname: concept.referenceShortcut.propertyname,
                                metatype: concept.referenceShortcut.metatype
                            },
                            propertyName: self.propertyName,
                            conceptName: concept.typeName
                            // action: (box: Box, text: string, editor: PiEditor): PiElement | null => {
                            //     LOGGER.log("Alias auto REFSHORTCUT action: " + this.propertyName + " concept " + concept.typeName);
                            //     const newElement: PiElement = concept.constructor()
                            //     if (newElement === undefined) {
                            //         // TODO Find out why this happens sometimes
                            //         console.error("AliasBox action: Unexpected new element undefined");
                            //         return null;
                            //     }
                            //     // runInAction(() => {
                            //         if (Language.getInstance().conceptProperty(this.element.piLanguageConcept(), this.propertyName).isList) {
                            //             this.element[this.propertyName].push(newElement);
                            //         } else {
                            //             this.element[this.propertyName] = newElement;
                            //         }
                            //         if (!!text && !!action.referenceShortcut) {
                            //             execresult[action.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(label, action.referenceShortcut.metatype);
                            //         }
                            //
                            //     // });
                            //
                            //     editor.selectElement(newElement);
                            //     editor.selectFirstEditableChildBox();
                            //     return newElement;
                            // }
                        })
                    })));
        });
    }

    triggerKeyPressEvent = (key: string) => {
        console.error("AliasBox " + this.role + " has empty triggerKeyPressEvent");
    };
}

export function isAliasBox(b: Box): b is AliasBox {
    return b.kind === "AliasBox"; //  b instanceof AliasBox;
}

export function isAliasTextBox(b: Box): b is TextBox {
    return b.kind === "TextBox" && isAliasBox(b.parent);
}


