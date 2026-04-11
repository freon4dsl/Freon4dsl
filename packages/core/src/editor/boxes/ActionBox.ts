import { BehaviorExecutionResult, executeSingleBehavior } from "../util/index.js";
import { isRegExp } from "../actions/index.js";
import type { FreEditor} from "../internal.js";
import { triggerTypeToString, isProKey } from "../internal.js";
import { AbstractChoiceBox } from "./internal.js";
import type { SelectOption , Box} from "./internal.js";
import type { FreNode } from "../../ast/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils, MatchUtil, notNullOrUndefined } from '../../util/index.js';
import { createOptions } from "../util/SelectOptionUtils.js"

const LOGGER: FreLogger = new FreLogger("ActionBox");

export class ActionBox extends AbstractChoiceBox {
    readonly kind: string = "ActionBox"

    /**
     * Filled with the name of the concept, in case this is used to create new concept instance.
     */
    conceptName?: string
    /**
     * Temporary text value, settable programmatically to remember user input.
     * Never stored in the AST.
     * @private
     */
    private rememberedText: string = ""

    /**
     * This constructor should be private, but must be public to enable the factory method to call it.
     * @param node
     * @param role
     * @param placeHolder
     * @param initializer
     */
    constructor(node: FreNode, role: string, placeHolder: string, initializer?: Partial<ActionBox>) {
        super(node, role, placeHolder, initializer)
    }

    rememberText(text: string): void {
        this.rememberedText = text
        this.isDirty()
    }

    override getText(): string {
        if (this.rememberedText !== "") {
            return this.rememberedText
        } else {
            return super.getText()
        }
    }

    /**
     * Returns the options (for a dropdown component) that fit this ActionBox.
     * @param editor
     */
    getOptions(editor: FreEditor): SelectOption[] {
        LOGGER.log("getOptions for " + this.$id + "- " + this.conceptName + "." + this.propertyName)
        const result: SelectOption[] = createOptions(editor, this.node, this, this.conceptName)
        // Using the new actions:
        // Now look in all actions defined in the editor whether they fit this action, except for the keyboard shortcuts
        editor.newFreActions
            .filter((action) => !isProKey(action.trigger) && action.activeInBoxRoles.includes(this.role))
            .forEach((action) => {
                const options: SelectOption[] = []
                if (!isRegExp(action.trigger)) {
                    options.push({
                        id: triggerTypeToString(action.trigger), // + "_action",
                        label: triggerTypeToString(action.trigger), // + "_action",
                        action: action,
                        description: "action " + triggerTypeToString(action.trigger),
                    })
                    result.push(...options)
                }
            })
        return this.makeOptionsUnique(result)
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.log("ActionBox executeOption " + JSON.stringify(option))
        FreUtils.CHECK(!!option.action, `ActionBox.executeOption: action missing for ${option.label}`)
        if (!!option.action) {
            return executeSingleBehavior(option.action, this, option.label, editor)
        }
        LOGGER.log("<== ActionBox executeOption ")
        return BehaviorExecutionResult.NULL
    }

    tryToExecute(key: string, editor: FreEditor): BehaviorExecutionResult {
        LOGGER.log(`ActionBox ${this.id} tryToExecute [${key}]`)
        let result: BehaviorExecutionResult
        // Try if key fits one of the options, and execute the action that is associated with it
        const filteredOptions: SelectOption[] = MatchUtil.partiallyMatchingOptions(key, this.getOptions(editor))
        if (filteredOptions.length === 1 && MatchUtil.isFullMatchWithTrigger(key, filteredOptions[0].label)) {
            result = this.executeOption(editor, filteredOptions[0])
        } else {
            // Try if key matches a regular expression, and execute the action that is associated with it
            result = this.tryToMatchRegExpAndExecuteAction(key, editor)
            // The following is now handled in the component:
            // if (result !== BehaviorExecutionResult.EXECUTED) {
            // The action was not executed, so add 'key' to the text that is already present
            // this.setText(this.getText() + key);
            // this.isDirty();
            // }
        }
        return result
    }

    tryToMatchRegExpAndExecuteAction(text: string, editor: FreEditor): BehaviorExecutionResult {
        LOGGER.log(`ActionBox tryToMatchRegExpAndExecuteAction [${text}]`)
        // Find all regular expression actions
        const regExpActions = editor.newFreActions.filter(
            (action) => !isProKey(action.trigger) && action.activeInBoxRoles.includes(this.role) && isRegExp(action.trigger),
        )

        const matchingAction = regExpActions.find((action) => {
            if (isRegExp(action.trigger)) {
                if (action.trigger.test(text)) {
                    LOGGER.log("Matched regexp" + triggerTypeToString(action.trigger) + " for '" + text + "'")
                    return true
                }
                return false
            }
            return false
        })
        // If there is a match, execute it.
        if (notNullOrUndefined(matchingAction)) {
            LOGGER.log(`Found match to regexp: ${triggerTypeToString(matchingAction.trigger)}`)
            if (!!matchingAction) {
                return executeSingleBehavior(matchingAction, this, text, editor)
            }
            return BehaviorExecutionResult.NULL
        }
        return BehaviorExecutionResult.NO_MATCH
    }
}

export function isActionBox(b: Box): b is ActionBox {
    return b?.kind === "ActionBox"; //  b instanceof ActionBox;
}
