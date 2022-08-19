import { PiKey } from "../util/Keys";

export type PiTriggerType = string | RegExp | PiKey; // the definition, like parameter
export type PiTriggerUse = string | PiKey; // the use, like argument

export function isRegExp(a: PiTriggerType): a is RegExp {
    return (a as any).exec !== undefined;
}

/**
 * Returns true if 'a' is a PiKey with its meta atrribute set.
 * @param a
 */
export function isProKey(a: PiTriggerType): a is PiKey {
    return (a as any).meta !== undefined;
}

export function isString(a: PiTriggerType): a is string {
    return !isRegExp(a) && typeof a === "string";
}

export function triggerTypeToString(trigger: PiTriggerType): string {
    if (isString(trigger)){
        return trigger;
    } else if (isProKey(trigger)) {
        return "'" + trigger.meta.toString() + "-" + trigger.key + "'";
    } else if (isRegExp(trigger)) {
        return "/" + trigger.source + "/";
    } else {
        console.error("triggerToString() argument is not of PiTriggerType: " + typeof(trigger));
        return "";
    }
}
