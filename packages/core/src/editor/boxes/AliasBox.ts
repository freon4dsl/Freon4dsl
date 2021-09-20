import { BehaviorExecutionResult, executeBehavior, MatchUtil } from "../../util";
import { triggerToString, PiEditor, TextBox } from "../internal";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { PiElement } from "../../language";
import { runInAction } from "mobx";

export class AliasBox extends AbstractChoiceBox {
    readonly kind = "AliasBox";
    placeholder: string;
    /**
     * Filled with the name of the property, in case the AliasBox is used to create new elments
     */
    propertyName?: string;

    constructor(exp: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>) {
        super(exp, role, placeHolder, initializer);
    }

    getOptions(editor: PiEditor): SelectOption[] {
        const referenceShortcuts: SelectOption[] = [];
        const result: SelectOption[] = editor.behaviors
            // .filter(a => a.activeInBoxRoles.includes(this.role) && MatchUtil.partialMatch(this.textBox.getText(), a.trigger))
            .filter(behavior => behavior.activeInBoxRoles.includes(this.role))
            .map(behavior => {
                // If the behavior has a referenceShortcut, we need to find all potential referred elements and add them to the options.
                if (!!(behavior.referenceShortcut)) {
                    console.log("REFERENCE (" + this.role + "-" + this.element.piId() + ") " + behavior.referenceShortcut.propertyname + " TO " + behavior.referenceShortcut.metatype + " trigger " + triggerToString(behavior.trigger));
                    // TODO Special example of do/undo to be able to get the visible elements, probably Action should get an undo next to an execute.
                    // Uses thge mobx transaction to ensure no observers are trioggered during this execute/undo.
                    // Ans turns off setting selection in PiEditor.
                    editor.NOSELECT = true;
                    runInAction(() => {
                        console.log("START");
                        const newElement = behavior.execute(this, triggerToString(behavior.trigger), editor);
                        console.log("NEW ELEMENT is " + newElement);
                        referenceShortcuts.push(...
                            editor.environment
                                .scoper.getVisibleNames(newElement, behavior.referenceShortcut.metatype)
                                .filter( name => !!name && name !== "")
                                .map(name => ({
                                    id: triggerToString(behavior.trigger),
                                    label: name
                                })));
                        // UNDO
                        behavior.undo(this, editor);
                        console.log("END");
                    });
                    editor.NOSELECT = false;
                    // TODO This leaves the new element which is removed again as the selected element !
                }
                return {
                    id: triggerToString(behavior.trigger),
                    label: triggerToString(behavior.trigger),
                    description: "alias " + triggerToString(behavior.trigger)
                };
            });
        result.push(...referenceShortcuts);
        return result;
    }

    async selectOption(editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> {
        return await executeBehavior(this, option.id, option.label, editor);
    }

    triggerKeyPressEvent = (key: string) => {
        console.error("AliasBox " + this.role + " has empty triggerKeyPressEvent");
    };
}

export function isAliasBox(b: Box): b is AliasBox {
    return b.kind === "AliasBox"; //  b instanceof AliasBox;
}

export function isAliasTextBox(b: Box): b is TextBox {
    console.log(" =========== " + b.role + ", " + b.kind + " parent " + b.parent.role + ": " + b.parent.kind);
    return b.kind === "TextBox" && isAliasBox(b.parent);
}

