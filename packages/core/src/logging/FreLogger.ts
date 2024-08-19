/**
 * Logging helpers to enable quick filtering of certain log categories.
 */
type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class FreLogger {
    private static muteAll: boolean = false;
    private static FG_RED = "\x1b[31m";
    private static FG_BLACK = "\x1b[30m";
    private static FG_BLUE = "\x1b[34m";

    static mutedLogs: string[] = [];
    // static shownLogs: string[] = [];
    static mute(t: string): void {
        if (!this.mutedLogs.includes(t)) {
            this.mutedLogs.push(t);
        }
    }
    static unmute(t: string): void {
        const index = this.mutedLogs.indexOf(t);
        if (index >= 0) {
            this.mutedLogs.splice(index, 1);
        }
    }

    static muteAllLogs() {
        FreLogger.muteAll = true;
    }

    static unmuteAllLogs() {
        FreLogger.muteAll = false;
        this.mutedLogs = [];
    }

    static filter: string = null;

    static showString(s: string | null) {
        FreLogger.filter = s;
    }

    category: string;

    get active(): boolean {
        return !FreLogger.mutedLogs.includes(this.category);
    }
    set active(value: boolean) {
        if (value) {
            FreLogger.unmute(this.category);
        } else {
            FreLogger.mute(this.category);
        }
    }

    constructor(cat: string) {
        this.category = cat;
    }

    info(msg: LogMessage) {
        if (!FreLogger.muteAll && this.active) {
            this.logToConsole(FreLogger.FG_BLUE, this.category + ": " + this.message(msg));
        }
    }

    // log(msg: LogMessage) {
    //     if ((!FreLogger.muteAll) && this.active) {
    //         this.logToConsole(FreLogger.FG_BLACK, this.category + ": " + this.message(msg));
    //     }
    // }

    log(msg: LogMessage, tagOrTags?: string | string[]) {
        if (!FreLogger.muteAll && this.active) {
            this.logToConsole(FreLogger.FG_BLACK, this.category + ": " + this.message(msg));
        } else if (tagOrTags !== undefined && tagOrTags !== null) {
            const tags: string[] = typeof tagOrTags === "string" ? [tagOrTags] : (tagOrTags as string[]);
            for (const tag of tags) {
                if (!FreLogger.mutedLogs.includes(tag)) {
                    this.logToConsole(FreLogger.FG_BLACK, this.category + "." + tag + ": " + this.message(msg));
                    return;
                }
            }
        }
    }

    error(msg: LogMessage) {
        console.log(FreLogger.FG_RED, "ERROR: " + this.category + ": " + this.message(msg));
    }

    mute(): FreLogger {
        this.active = false;
        return this;
    }

    show(): FreLogger {
        this.active = true;
        return this;
    }

    protected message(msg: LogMessage): string {
        return typeof msg === "string" ? msg : msg();
    }

    protected logToConsole(color: string, message: string): void {
        if (FreLogger.filter === null) {
            console.log(color, message, FreLogger.FG_BLACK, "");
            // this.colorMyText();
        } else {
            if (message.includes(FreLogger.filter)) {
                console.log(color, message, FreLogger.FG_BLACK, "");
            }
        }
    }

    // following does not work
    colorMyText() {
        const text = "some text with some {special} formatting on this {keyword} and this {keyword}";
        const splitText = text.split(" ");
        const cssRules: string[] = [];
        let styledText = "";
        for (const split of splitText) {
            if (/^\{/.test(split)) {
                cssRules.push(FreLogger.FG_BLUE);
            } else {
                cssRules.push("color:inherit");
            }
            styledText += `%c${split} `;
        }
        console.log(styledText, ...cssRules);
    }
}

export const EVENT_LOG = new FreLogger("EVENT");
