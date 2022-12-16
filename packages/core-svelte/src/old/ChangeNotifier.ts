import { PiLogger } from "@projectit/core";

export const AUTO_LOGGER: PiLogger = new PiLogger("AUTORUN").mute();
export const UPDATE_LOGGER: PiLogger = new PiLogger("AFTER_UPDATE").mute();
export const FOCUS_LOGGER: PiLogger = new PiLogger("FOCUS").mute();
export const MOUNT_LOGGER: PiLogger = new PiLogger("MOUNT").mute();
