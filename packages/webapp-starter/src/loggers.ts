import { FreLogger } from "@freon4dsl/core";

/**
 * Configure loggers. Loggers are muted by default, unmuting loggers that you want to
 * activate here.
 */
export function configureLoggers() {
    // // Activate the following loggers
    // FreLogger.unmute("FreLionwebSerializer")
    // FreLogger.unmute("MobxDecorators")
    FreLogger.unmute("ActionBox")
    FreLogger.unmute("TextComponentHelper")
    FreLogger.unmute("TextComponent")
    FreLogger.unmute("Box")
    FreLogger.unmute("FreEditor")
    // FreLogger.unmute("DropdownComponent")
    // FreLogger.unmute("EditorState")
    // FreLogger.unmute("InMemoryModel")
    // FreLogger.unmute("TextComponent")
    // FreLogger.unmute("ServerCommunication")
    // // Do not show log messages contaning any of these strings
    FreLogger.setFilter(["beforeUpdate", "afterUpdate"])
}
