import type { FreTriggerType, SelectOption } from "../editor/index.js"
import { isProKey, isRegExp, isString } from "../editor/index.js";
import { isEmpty, notNullOrUndefined } from "./FreUtils.js"

export function isIdentifier(str: string): boolean {
    if (notNullOrUndefined(str)) {
        // We choose not to use 'any' or 'any but' in the regexp, because then all kinds of characters (with accents
        // and from other keyboards) also become possible, and we can't oversee what consequences this has. Therefore,
        // we prefer a positive statement of what is possible.
        const match = str.match(/^[0-9,a-z,A-Z~!@\#\$%^&*\()_\-+={}[\]|\\:;"'<>?\,\./][0-9,a-z,A-Z~!@\#\$%^&*\()_\-+={}[\]|\\:;"'<>?\,\./ ]*$/)
        return match !== null && match.length > 0
    } else {
        return false
    }
}

export class MatchUtil {
    /**
     * Returns array of all options in `options` where the option label matches `text`.
     * @param text
     * @param options
     */
    public static partiallyMatchingOptions(text: string, options: SelectOption[]): SelectOption[] {
        if (isEmpty(text)) {
            return options
        }
        return options.filter((opt) => opt.label.toLowerCase().startsWith(text.toLowerCase()))
    }

    /**
     * Returns array of all options in `options` where the option label matches `text`.
     * @param text
     * @param options
     */
    public static fullMatchingOptions(text: string, options: SelectOption[]): SelectOption[] {
        if (isEmpty(text)) {
            return options
        }
        return options.filter((opt) => opt.label.toLowerCase() === text.toLowerCase())
    }

    /**
     * Test whether `text` is a full match with `option.label`.
     * The test is case insensitive.     
     * @param text
     * @param option
     */
    public static isPrefixOf(text: string, option: string): boolean {
        if (isEmpty(text) || isEmpty(option)) {
            return true
        }
        return option.toLowerCase().startsWith(text.toLowerCase())
    }

    /**
     * Test whether `text` has a full match with `trigger`
     * For string triggers, the test is case insensitive.
     * @param text
     * @param trigger
     */
    public static isFullMatchWithTrigger(text: string, trigger: FreTriggerType): boolean {
        if (isEmpty(text)) {
            return false
        }
        if (isRegExp(trigger)) {
            return trigger.test(text)
        } else if (isString(trigger)) {
            return trigger.toLowerCase() === text.toLowerCase()
        } else if (isProKey(trigger)) {
            return false
        }
        return false
    }
}
