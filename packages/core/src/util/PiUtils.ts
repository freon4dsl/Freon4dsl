import { PiLogger } from "../logging";

let LATEST_ID = 0;

const LOGGER = new PiLogger("PiUtils").mute();

export class PiUtils {

    /**
     * Resets the ID, so the same ID can now appear twice.
     * Use only in tests to ensure the ID's there always start at 0
     */
    static resetId(): void {
        LATEST_ID = 0;
    }
    /**
     *
     */
    static ID() {
        LATEST_ID++;
        return "ID-" + LATEST_ID;
    }
    /** Initialize an object with a JSON object
     */
    static initializeObject<TTarget, TSource>(target: TTarget, source: TSource) {
        if (!(target && source)) {
            return;
        }
        Object.keys(source).forEach((key) => {
            if (source.hasOwnProperty(key)) {
                (target as any)[key] = (source as any)[key];
            }
        });
    }

    static CHECK(b: boolean, msg?: string): void {
        if (!b) {
            throw new Error(msg ? "FAILED Check: " + msg : "check error");
        }
    }
}

export function isNullOrUndefined(obj: Object | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}
