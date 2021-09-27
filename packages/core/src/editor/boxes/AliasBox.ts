import { BehaviorExecutionResult, executeBehavior, executeSingleBehavior, MatchUtil } from "../../util";
import { triggerToString, PiEditor, TextBox } from "../internal";
import { DummyBox, DummyElement } from "./DummyBox";
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

    async selectOption(editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> {
        console.log("AliasBox option " + JSON.stringify(option));
        if (!!option.behavior) {
            return await executeSingleBehavior(option.behavior, this, option.id, option.label, editor);
        } else {
            // Try all statically defined actions
            let result = await executeBehavior(this, option.id, option.label, editor);
            if (result === BehaviorExecutionResult.EXECUTED) {
                return result;
            }
            // Wasn't a match, now get all dynamic options, including referenceShortcuts and check these
            const allOptions = this.getOptions(editor);
            const selectedOptions = allOptions.filter(o => option.label === o.label);
            if (selectedOptions.length === 1) {
                console.log("AliasbBox.selectOption dynamic " + JSON.stringify(selectedOptions));
                return await executeBehavior(this, selectedOptions[0].id, selectedOptions[0].label, editor);
            } else {
                console.error("AliasBox.selectOption : " + JSON.stringify(selectedOptions));
                return BehaviorExecutionResult.NO_MATCH;
            }
        }
    }

    constructor(exp: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>) {
        super(exp, role, placeHolder, initializer);
    }

    getOptions(editor: PiEditor): SelectOption[] {
        const result: SelectOption[] = [];
        editor.behaviors
            .filter(behavior => behavior.activeInBoxRoles.includes(this.role))
            .forEach(behavior => {
                const options: SelectOption[] = [];
                // If the behavior has a referenceShortcut, we need to find all potential referred elements and add them to the options.
                if (!!(behavior.referenceShortcut)) {
                    // Crerate the new element for this behavior inside a dummy and then point the container to the
                    // current element.  This wat the new element is not part of the model and will not trigger mobx
                    // reaction. But the scoper can be used to find available references, because the scoper only
                    // needs the container.
                    const dummyElement = new DummyElement();
                    const dummyBox = new DummyBox(dummyElement, "dummy-role");
                    runInAction(() => {
                        console.log("START finding references");
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
                        console.log("END 2");
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
    console.log(" =========== " + b.role + ", " + b.kind + " parent " + b.parent.role + ": " + b.parent.kind);
    return b.kind === "TextBox" && isAliasBox(b.parent);
}

export class ObjectHelper {
    /**
     * Deep copy function for TypeScript.
     * @param T Generic type of target/copied value.
     * @param target Target value to be copied.
     * @see Source project, ts-deeply https://github.com/ykdr2017/ts-deepcopy
     * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
     */
    public static deepCopy<T>(target: T): T {
        if (target === null) {
            return target;
        }
        if (target instanceof Date) {
            return new Date(target.getTime()) as any;
        }
        // First part is for array and second part is for Realm.Collection
        // if (target instanceof Array || typeof (target as any).type === 'string') {
        if (typeof target === "object") {
            if (typeof (target as { [key: string]: any })[(Symbol as any).iterator] === "function") {
                const cp = [] as any[];
                if ((target as any as any[]).length > 0) {
                    for (const arrayMember of target as any as any[]) {
                        cp.push(ObjectHelper.deepCopy(arrayMember));
                    }
                }
                return cp as any as T;
            } else {
                const targetKeys = Object.keys(target);
                const cp = {} as { [key: string]: any };
                if (targetKeys.length > 0) {
                    for (const key of targetKeys) {
                        cp[key] = ObjectHelper.deepCopy((target as { [key: string]: any })[key]);
                    }
                }
                return cp as T;
            }
        }
        // Means that object is atomic
        return target;
    }
}

