import { FreAction, FreTriggerType } from "../index";
// the following import is needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.FreKey'
import { FreKey } from "./Keys";
import { remove, union } from "lodash";

/**
 * Utility functions to combine two FreAction objects.
 */
export class ActionsUtil {
    /**
     * Join the actions, ensuring no duplicare triggers are in the result.
     * If there is a duplicate trigger, the one in `newActions` will be used.
     *
     * @param defaultActions The first FreActions to join.
     * @param newActions The ssecond FreActions to join.
     */
    static join(defaultActions: FreAction[], newActions: FreAction[]) {
        newActions.forEach((newA) => this.remove(defaultActions, newA));
        return union(defaultActions, newActions);
    }

    static remove(from: FreAction[], item: FreAction) {
        remove(from, (value) => this.equalsTrigger(value.trigger, item.trigger));
    }

    static equalsTrigger(trigger1: FreTriggerType, trigger2: FreTriggerType): boolean {
        let type1: string = typeof trigger1;
        let type2: string = typeof trigger2;

        if (type1 === type2) {
            if (type1 === "string") {
                return trigger1 === trigger2;
            } else if (type1 === "object") {
                type1 = trigger1["meta"] === undefined ? "FreKey" : "RegExp";
                type2 = trigger2["meta"] === undefined ? "FreKey" : "RegExp";
                if (type1 === type2) {
                    if (type1 === "FreKey") {
                        const key1 = trigger1 as FreKey;
                        const key2 = trigger2 as FreKey;
                        return key1.meta === key2.meta && key1.key === key2.key;
                    } else {
                        const regexp1 = trigger1 as RegExp;
                        const regexp2 = trigger2 as RegExp;
                        return regexp1.source === regexp2.source;
                    }
                }
            }
        }
        return false;
    }
}
