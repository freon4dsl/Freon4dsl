import { PiLogger } from "@projectit/core";
import { observable } from "mobx";

export const AUTO_LOGGER: PiLogger = new PiLogger("AUTORUN");
export const UPDATE_LOGGER: PiLogger = new PiLogger("AFTER_UPDATE");

/**
 * Helper class to enforce change notification.
 */
export class ChangeNotifier {
    @observable dummy: number = 0;

    notifyChange(): void {
        this.dummy++;
    }
}
