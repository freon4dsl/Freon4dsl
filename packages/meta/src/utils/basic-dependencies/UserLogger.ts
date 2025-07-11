// The following instance of MetaLogger is used to present messages to the user of the Freon generators
import { MetaLogger } from "../no-dependencies/MetaLogger.js";

export const LOG2USER = new MetaLogger("");
// the following turns on info and log messages,
// default only error message are shown
LOG2USER.active = true;
