/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class PiLogger {
    private static muteAll: boolean = false;
    private static FG_RED = "\x1b[31m";
    private static FG_BLACK = "\x1b[30m";
    private static FG_BLUE = "\x1b[34m";

    static muteAllLogs() {
        PiLogger.muteAll = true;
    }

    static unmuteAllLogs() {
        PiLogger.muteAll = false;
    }

    static filter: string = null;

    static showString(s: string | null) {
        PiLogger.filter = s;
    }

    category: string;
    active: boolean = true;

    constructor(cat: string) {
        this.category = cat;
    }

    info(o: any, msg: LogMessage) {
        if (this.active && !PiLogger.muteAll) {
            const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
            this.logToConsole(PiLogger.FG_BLUE, type + ": " + this.message(msg));
        }
    }

    log(msg: LogMessage) {
        if (this.active && !PiLogger.muteAll) {
            this.logToConsole(PiLogger.FG_BLACK, this.category + ": " + this.message(msg));
        }
    }

    error(o: any, msg: LogMessage) {
        const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
        console.log(PiLogger.FG_RED, "ERROR: " + type + ": " + this.message(msg));
    }

    mute(): PiLogger {
        this.active = false;
        return this;
    }

    show(): PiLogger {
        this.active = true;
        return this;
    }

    protected message(msg: LogMessage): string {
        return typeof msg === "string" ? msg : msg();
    }

    protected logToConsole(color: string, message: string): void {
        if (PiLogger.filter === null) {
            console.log(color, message, PiLogger.FG_BLACK, "");
            // this.colorMyText();
        } else {
            if (message.includes(PiLogger.filter)) {
                console.log(color, message, PiLogger.FG_BLACK, "");
            }
        }
    }

    // following does not work
    colorMyText() {
        const text = "some text with some {special} formatting on this {keyword} and this {keyword}";
        const splitText = text.split(" ");
        const cssRules = [];
        let styledText = "";
        for (const split of splitText) {
            if (/^\{/.test(split)) {
                cssRules.push(PiLogger.FG_BLUE);
            } else {
                cssRules.push("color:inherit");
            }
            styledText += `%c${split} `;
        }
        console.log(styledText, ...cssRules);
    }
}

export const EVENT_LOG = new PiLogger("EVENT").mute();
export const RENDER_LOG = new PiLogger("RENDER").mute();
