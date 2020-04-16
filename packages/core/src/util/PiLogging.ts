/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class PiLogger {
    private static muteAll: boolean = false;
    private static FgRed = "\x1b[31m";
    private static FgBlack = "\x1b[30m";
    private static FgBlue = "\x1b[34m";

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
        if (this.active) {
            const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
            // this.logToConsole(PiLogger.FgBlue, this.category + " " + type + ": " + this.message(msg));
            this.logToConsole(PiLogger.FgBlue, this.category + ": " + this.message(msg));
        }
    }

    log(msg: LogMessage) {
        if (this.active && !PiLogger.muteAll) {
            this.logToConsole(PiLogger.FgBlack, this.category + ": " + this.message(msg));
        }
    }

    error(o: any, msg: LogMessage) {
        const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
        console.log(PiLogger.FgRed, "ERROR: " + this.category + " " + type + ": " + this.message(msg));
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

    protected logToConsole(color : string, message: string): void {
        if (PiLogger.filter === null) {
            console.log(color, message, PiLogger.FgBlack, "");
            // this.colorMyText();
        } else {
            if (message.includes(PiLogger.filter)) {
                console.log(color, message, PiLogger.FgBlack, "");
            }
        }
    }

    // following does not work
    colorMyText() {
        var text = 'some text with some {special} formatting on this {keyword} and this {keyword}';
        var splitText = text.split(' ');
        var cssRules = [];
        var styledText = '';
        for (var split of splitText)  {
            if (/^\{/.test(split)) {
                cssRules.push(PiLogger.FgBlue);
            } else {
                cssRules.push('color:inherit')
            }
            styledText += `%c${split} `
        };
        console.log(styledText , ...cssRules)
    }
}

export const EVENT_LOG = new PiLogger("EVENT").mute();
export const RENDER_LOG = new PiLogger("RENDER").mute();
