/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class MetaLogger {
    private static muteAll: boolean = false;
    private static muteErrors: boolean = false;
    private static fgRed = "\x1b[31m";
    private static fgBlack = "\x1b[30m";
    private static fgBlue = "\x1b[34m";
    // private static fgCyan = "\x1b[36m";
    // private static fgMagenta = "\x1b[35m";
    private static fgYellow = "\x1b[33m";

    static muteAllLogs() {
        MetaLogger.muteAll = true;
    }

    static muteAllErrors() {
        MetaLogger.muteErrors = true;
    }

    static unmuteAllLogs() {
        MetaLogger.muteAll = false;
    }

    static filter: string = "";

    static showString(s: string | null) {
        MetaLogger.filter = s ? s : "";
    }

    category: string = "";
    active: boolean = false;

    constructor(cat: string) {
        this.category = cat;
    }

    info(msg: LogMessage) {
        if (this.active) {
            this.logToConsole(MetaLogger.fgBlue, this.message(msg));
        }
    }

    warning(msg: LogMessage) {
        if (this.active && !MetaLogger.muteAll) {
            this.logToConsole(MetaLogger.fgYellow, this.message(msg));
        }
    }

    log(msg: LogMessage) {
        if (this.active && !MetaLogger.muteAll) {
            this.logToConsole(MetaLogger.fgBlack, this.message(msg));
        }
    }

    error(msg: LogMessage) {
        if (!MetaLogger.muteErrors) {
            this.logToConsole(MetaLogger.fgRed, "ERROR: " + this.message(msg));
        }
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
            if (this.category.length > 0) {
                console.log(color, this.category + ": " + message, MetaLogger.fgBlack, "");
            } else {
                console.log(color, message, MetaLogger.fgBlack, "");
            }
        } else {
            if (message.includes(MetaLogger.filter)) {
                if (this.category.length > 0) {
                    console.log(color, this.category + ": " + message, MetaLogger.fgBlack, "");
                } else {
                    console.log(color, message, MetaLogger.fgBlack, "");
                }
            }
        }
    }
}
