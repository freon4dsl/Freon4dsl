import { FreKey } from "../util";

export type FreTriggerType = string | RegExp | FreKey; // the definition, like parameter
export type FreTriggerUse = string | FreKey; // the use, like argument

export function isRegExp(a: FreTriggerType): a is RegExp {
    if (a === undefined) {
        return false;
    }
    return (a as any).exec !== undefined;
}

/**
 * Returns true if 'a' is a FreKey with its meta atrribute set.
 * @param a
 */
export function isProKey(a: FreTriggerType): a is FreKey {
    return (a as any).meta !== undefined;
}

export function isString(a: FreTriggerType): a is string {
    return !isRegExp(a) && typeof a === "string";
}

export function triggerTypeToString(trigger: FreTriggerType): string {
    if (isString(trigger)) {
        return trigger;
    } else if (isProKey(trigger)) {
        return "'" + trigger.meta.toString() + "-" + trigger.key + "'";
    } else if (isRegExp(trigger)) {
        return "/" + trigger.source + "/";
    } else {
        console.error("triggerToString() argument is not of FreTriggerType: " + typeof trigger);
        return "";
    }
}
