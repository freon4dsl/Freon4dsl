/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class MetaLogger {
    private static muteAll: boolean = false;
    private static muteErrors: boolean = false;
    private static FgRed = "\x1b[31m";
    private static FgBlack = "\x1b[30m";
    private static FgBlue = "\x1b[34m";
    private static FgCyan = "\x1b[36m";
    private static FgMagenta = "\x1b[35m";
    private static FgYellow = "\x1b[33m";

    static muteAllLogs() {
        MetaLogger.muteAll = true;
    }

    static muteAllErrors() {
        MetaLogger.muteErrors = true;
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

    info(msg: LogMessage) {
        if (this.active) {
            this.logToConsole(MetaLogger.FgBlue, this.message(msg));
        }
    }

    warning(msg: LogMessage) {
        if (this.active && !MetaLogger.muteAll) {
            this.logToConsole(MetaLogger.FgYellow, this.message(msg));
        }
    }

    log(msg: LogMessage) {
        if (this.active && !MetaLogger.muteAll) {
            this.logToConsole(MetaLogger.FgBlack, this.message(msg));
        }
    }

    error(msg: LogMessage) {
        if (!MetaLogger.muteErrors) {
            this.logToConsole(MetaLogger.FgRed, "at " + this.message(msg));
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
                console.log(color, this.category + ": " + message, MetaLogger.FgBlack, "");
            } else {
                console.log(color, message, MetaLogger.FgBlack, "");
            }
        } else {
            if (message.includes(MetaLogger.filter)) {
                if (this.category.length > 0) {
                    console.log(color, this.category + ": " + message, MetaLogger.FgBlack, "");
                } else {
                    console.log(color, message, MetaLogger.FgBlack, "");
                }
            }
        }
    }
}
