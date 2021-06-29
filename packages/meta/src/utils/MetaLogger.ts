/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class MetaLogger {
    private static muteAll: boolean = false;
    private static FgRed = "\x1b[31m";
    private static FgBlack = "\x1b[30m";
    private static FgBlue = "\x1b[34m";

    static muteAllLogs() {
        MetaLogger.muteAll = true;
    }

    static unmuteAllLogs() {
        MetaLogger.muteAll = false;
    }

    static filter: string = null;

    static showString(s: string | null) {
        MetaLogger.filter = s;
    }

    category: string;
    active: boolean = true;

    constructor(cat: string) {
        this.category = cat;
    }

    info(o: any, msg: LogMessage) {
        if (this.active) {
            const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
            this.logToConsole(MetaLogger.FgBlue, type + ": " + this.message(msg));
        }
    }

    log(msg: LogMessage) {
        if (this.active && !MetaLogger.muteAll) {
            this.logToConsole(MetaLogger.FgBlack, this.category + ": " + this.message(msg));
        }
    }

    error(o: any, msg: LogMessage) {
        const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
        console.log(MetaLogger.FgRed, "ERROR: " + type + ": " + this.message(msg));
    }

    mute(): MetaLogger {
        this.active = false;
        return this;
    }

    show(): MetaLogger {
        this.active = true;
        return this;
    }

    protected message(msg: LogMessage): string {
        return typeof msg === "string" ? msg : msg();
    }

    protected logToConsole(color: string, message: string): void {
        if (MetaLogger.filter === null) {
            console.log(color, message, MetaLogger.FgBlack, "");
            // this.colorMyText();
        } else {
            if (message.includes(MetaLogger.filter)) {
                console.log(color, message, MetaLogger.FgBlack, "");
            }
        }
    }
}
