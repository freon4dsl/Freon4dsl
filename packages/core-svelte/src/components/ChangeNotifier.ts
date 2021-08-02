import { PiLogger } from "@projectit/core";
import { observable } from "mobx";

export const AUTO_LOGGER: PiLogger = new PiLogger("AUTORUN");
export const UPDATE_LOGGER: PiLogger = new PiLogger("AFTER_UPDATE");

/**
 * Helper class to enforce change notification.
 * Sometimes handy to enforce Svelte to re-render a component.
 *
 * NB Only use this when there is no other option!
 */
export class ChangeNotifier {
    @observable dummy: number = 0;

    notifyChange(): void {
        this.dummy++;
    }
}
