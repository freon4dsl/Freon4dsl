import { BehaviorExecutionResult, executeBehavior, MatchUtil } from "../../util";
import { triggerToString, PiEditor, TextBox } from "../internal";
import { Box, AbstractChoiceBox, SelectOption } from "./internal";
import { PiElement } from "../../language";

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
            .filter(a => a.activeInBoxRoles.includes(this.role))
            .map(a => {
                if (!!(a.referenceShortcut)) {
                    console.log("REFERENCE "+ a.referenceShortcut.propertyname + " TO " + a.referenceShortcut.metatype);
                    referenceShortcuts.push({ id: a.referenceShortcut.propertyname + "-" + a.referenceShortcut.propertyname, label: "ref to " + a.referenceShortcut.propertyname, description: "REF"});
                    referenceShortcuts.push(...
                    editor.environment
                        .scoper.getVisibleNames(this.element, a.referenceShortcut.metatype)
                        .map(name => ({
                            id: name,
                            label: name
                        })));
                }
                return {
                    id: triggerToString(a.trigger),
                    label: triggerToString(a.trigger),
                    description: "alias " + triggerToString(a.trigger)
                };
            });
        result.push(...referenceShortcuts);
        return result;
    }

    async selectOption(editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> {
        return await executeBehavior(this, option.id, editor);
    }

    triggerKeyPressEvent = (key: string) => {
        console.error("AliasBox " + this.role + " has empty triggerKeyPressEvent");
    };
}

export function isAliasBox(b: Box): b is AliasBox {
    return b.kind === "AliasBox"; //  b instanceof AliasBox;
}

export function isAliasTextBox(b : Box): b is TextBox {
    console.log(" =========== " + b.role + ", " + b.kind + " parent " + b.parent.role + ": " + b.parent.kind )
    return b.kind === "TextBox" && isAliasBox(b.parent);
}

