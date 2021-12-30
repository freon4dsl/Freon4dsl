import { PiLogger } from "@projectit/core";
import { makeObservable, observable, action } from "mobx";

export const AUTO_LOGGER: PiLogger = new PiLogger("AUTORUN");
export const UPDATE_LOGGER: PiLogger = new PiLogger("AFTER_UPDATE");
export const FOCUS_LOGGER: PiLogger = new PiLogger("FOCUS");
export const MOUNT_LOGGER: PiLogger = new PiLogger("MOUNT");


/**
 * Helper class to enforce change notification.
 * Sometimes handy to enforce Svelte to re-render a component.
 *
 * NB Only use this when there is no other option!
 */
export class ChangeNotifier {
    dummy: number = 0;

    constructor() {
        // makeObservable(this, {
        //     dummy: observable,
        //     notifyChange: action
        // })
    }
    notifyChange(): void {
        this.dummy++;
    }
}
