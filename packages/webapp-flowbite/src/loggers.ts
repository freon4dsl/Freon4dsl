import { FreLogger, NumberControlBox } from "@freon4dsl/core"

/**
 * Configure loggers. Loggers are muted by default, unmuting loggers that you want to
 * activate here.
 */
export function configureLoggers() {
    // // Activate the following loggers
    // FreLogger.unmute("FreLionWebSerializer")
    // FreLogger.unmute("CheckBoxComponent")
    // FreLogger.unmute("NumericSliderComponent")
    // FreLogger.unmute("NumberControlBox")
    // FreLogger.unmute("TextComponent")
    // FreLogger.unmute("FreonComponent")
    // FreLogger.unmute("FreEditor")
    // FreLogger.unmute("TextDropdownComponent")
    // FreLogger.unmute("EditorState")
    // FreLogger.unmute("ModelManager")
    // FreLogger.unmute("DeltaModelManager")
    // FreLogger.unmute("TextComponent")
    // FreLogger.unmute("ServerCommunication")
    // // Do not show log messages containing any of these strings
    FreLogger.setFilter(["beforeUpdate", "afterUpdate", "selectedOption", "refresh", "undefined", "setting text"])
}
