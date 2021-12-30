import { Language } from "../../storage/index";
import { BehaviorExecutionResult, executeBehavior, executeSingleBehavior } from "../../util";
import { triggerToString, PiEditor, TextBox, InternalCustomBehavior } from "../internal";
import { DummyBox, DummyElement } from "./DummyBox";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { PiElement } from "../../language";
import { runInAction } from "mobx";

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
        console.log("AliasBox option " + JSON.stringify(option));
        if (!!option.behavior) {
            return executeSingleBehavior(option.behavior, this, option.id, option.label, editor);
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
                console.log("AliasBox.selectOption dynamic " + JSON.stringify(selectedOptions));
                return executeBehavior(this, selectedOptions[0].id, selectedOptions[0].label, editor);
            } else {
                console.error("AliasBox.selectOption : " + JSON.stringify(selectedOptions));
                return BehaviorExecutionResult.NO_MATCH;
            }
        }
    }

    getOptions(editor: PiEditor): SelectOption[] {
        const result: SelectOption[] = [];
        if( !!this.propertyName && !!this.conceptName) {
            const clsOtIntf = Language.getInstance().concept(this.conceptName) ?? Language.getInstance().interface(this.conceptName);
             clsOtIntf.subConceptNames.concat(this.conceptName).forEach( (subName: string) => {
                const concept = Language.getInstance().concept(subName);
                if (!!concept && !concept.isAbstract) {
                    if (!!(concept.referenceShortcut)) {
                        // Create the new element for this behavior inside a dummy and then point the container to the
                        // current element.  This way the new element is not part of the model and will not trigger mobx
                        // reactions. But the scoper can be used to find available references, because the scoper only
                        // needs the container.
                        const dummyElement = new DummyElement();
                        const dummyBox = new DummyBox(dummyElement, "dummy-role");
                        runInAction(() => {
                            // console.log("START finding references");
                            const newElement = Language.getInstance().concept(subName)?.constructor();
                            newElement["container"] = this.element;
                            result.push(...
                                editor.environment
                                    .scoper.getVisibleNames(newElement, concept.referenceShortcut.metatype)
                                    .filter(name => !!name && name !== "")
                                    .map(name => ({
                                        id: triggerToString(concept.trigger) + "-" + name,
                                        label: name,
                                        description: "create " + concept.referenceShortcut.metatype,
                                        behavior: new InternalCustomBehavior({
                                            referenceShortcut: { propertyname: concept.referenceShortcut.propertyname, metatype: concept.referenceShortcut.metatype },
                                            action:  (box: Box, text: string, editor: PiEditor): PiElement | null => {
                                                console.log("Alias auto REFSHORTCUT action: " + this.propertyName + " concept " + subName);
                                                const newElement: PiElement = Language.getInstance().concept(subName)?.constructor()
                                                if( newElement === undefined) {
                                                    // TODO Find out why this happens sometimes
                                                    console.error("AliasBox action: Unexpected new element undefined");
                                                    return null;
                                                }
                                                runInAction( () => {
                                                    if (Language.getInstance().conceptProperty(this.element.piLanguageConcept(), this.propertyName).isList) {
                                                        this.element[this.propertyName].push(newElement);
                                                    } else {
                                                        this.element[this.propertyName] = newElement;
                                                    }
                                                });

                                                editor.selectElement(newElement);
                                                editor.selectFirstEditableChildBox();
                                                // await editor.selectFirstLeafChildBox();
                                                return newElement;
                                            }
                                        })
                                    })));
                            // console.log("END 2");
                        });
                    }

                    result.push({
                        id: subName,
                        label: concept.trigger,
                        behavior: new InternalCustomBehavior({
                                        action:  (box: Box, text: string, editor: PiEditor): PiElement | null => {
                                            console.log("Alias auto action: " + this.propertyName + " concept " + subName);
                                            const newElement: PiElement = Language.getInstance().concept(subName)?.constructor()
                                            if( newElement === undefined) {
                                                // TODO Find out why this happens sometimes
                                                console.error("AliasBox action: Unexpected new element undefined");
                                                return null;
                                            }
                                            runInAction( () => {
                                                if (Language.getInstance().classifierProperty(this.element.piLanguageConcept(), this.propertyName).isList) {
                                                    this.element[this.propertyName].push(newElement);
                                                } else {
                                                    this.element[this.propertyName] = newElement;
                                                }
                                            });

                                            editor.selectElement(newElement);
                                            editor.selectFirstEditableChildBox();
                                            // await editor.selectFirstLeafChildBox();
                                            return newElement;
                                        }
                                    }),
                        description: "alias auto"
                    });
                }
            });
        } else {
            console.log("No property and concept defined for alias box " + this.role);
        }
        editor.behaviors
            .filter(behavior => behavior.activeInBoxRoles.includes(this.role))
            .forEach(behavior => {
                // console.log("Active behavior: " + behavior.trigger)
                const options: SelectOption[] = [];
                // If the behavior has a referenceShortcut, we need to find all potential referred elements and add them to the options.
                if (!!(behavior.referenceShortcut)) {
                    // Create the new element for this behavior inside a dummy and then point the container to the
                    // current element.  This way the new element is not part of the model and will not trigger mobx
                    // reactions. But the scoper can be used to find available references, because the scoper only
                    // needs the container.
                    const dummyElement = new DummyElement();
                    const dummyBox = new DummyBox(dummyElement, "dummy-role");
                    runInAction(() => {
                        // console.log("START finding references");
                        const newElement = behavior.execute(dummyBox, triggerToString(behavior.trigger), editor);
                        newElement["container"] = this.element;
                        options.push(...
                            editor.environment
                                .scoper.getVisibleNames(newElement, behavior.referenceShortcut.metatype)
                                .filter(name => !!name && name !== "")
                                .map(name => ({
                                    id: triggerToString(behavior.trigger) + "-" + name,
                                    label: name,
                                    description: behavior.referenceShortcut.metatype,
                                    behavior: behavior
                                })));
                        // console.log("END 2");
                    });
                }
                /// if there are no reference shortcut options, add the alias itself
                if (options.length === 0) {
                    options.push({
                        id: triggerToString(behavior.trigger),
                        label: triggerToString(behavior.trigger),
                        behavior: behavior,
                        description: "alias " + triggerToString(behavior.trigger)
                    });
                }
                result.push(...options);
            });
        return result;
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


