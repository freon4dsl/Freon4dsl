/**
 * Logging helpers to enable quick filtering of certain log categories.
 */

type MessageFunction = () => string;
type LogMessage = string | MessageFunction;

export class PiLogger {
  category: string;
  active: boolean = true;

  constructor(cat: string) {
    this.category = cat;
  }

  info(o: any, msg: LogMessage) {
    if (this.active && !PiLogger.muteAll) {
      const type = o ? Object.getPrototypeOf(o).constructor.name : "-";
      this.logToConsole(this.category + " " + type + ": " + this.message(msg));
    }
  }

  log(msg: LogMessage) {
    if (this.active && !PiLogger.muteAll) {
      this.logToConsole(this.category + ": " + this.message(msg));
    }
  }

  error(o: any, msg: LogMessage) {
    const type = Object.getPrototypeOf(o).constructor.name;
    console.log(
      "ERROR: " + this.category + " " + type + ": " + this.message(msg)
    );
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

  protected logToConsole(message: string): void {
    if (PiLogger.filter === null) {
      console.log(message);
    } else {
      if (message.includes(PiLogger.filter)) {
        console.log(message);
      }
    }
  }

  private static muteAll: boolean = false;
  static muteAllLogs() {
    PiLogger.muteAll = true;
  }
  static filter: string = null;
  static showString(s: string | null) {
    PiLogger.filter = s;
  }
}

export const EVENT_LOG = new PiLogger("EVENT");
export const RENDER_LOG = new PiLogger("RENDER").mute();
