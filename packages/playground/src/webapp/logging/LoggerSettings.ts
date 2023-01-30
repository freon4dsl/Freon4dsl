import { PiLogger } from "@projectit/core";

// Mute or unmute logs here (in addition to elsewhere).
export function muteLogs() {
    PiLogger.unmute("PiEditor");
    PiLogger.mute("PiUtils");
    PiLogger.unmute("TextComponent");
    PiLogger.mute("AliasComponent");
    PiLogger.mute("AUTORUN");
    PiLogger.mute("FOCUS")
    PiLogger.mute("AFTER_UPDATE");
    PiLogger.mute("MOUNT");
    PiLogger.mute("SelectOptionList");
    PiLogger.mute("OptionalComponent");
    PiLogger.mute("RenderComponent");
    PiLogger.mute("SelectableComponent");
    PiLogger.mute("LabelComponent");
    PiLogger.mute("ListComponent");
    PiLogger.mute("DropdownComponent");
    PiLogger.mute("DropdownItemComponent");
    PiLogger.mute("X");
    PiLogger.mute("BoxFactory");
    PiLogger.mute("Language");
    PiLogger.mute("TableUtil");
    PiLogger.mute("GridCellComponent");
    PiLogger.mute("ProjectItComponent");
    PiLogger.mute("TextBox");
    PiLogger.mute("SelectBox");
    PiLogger.mute("HorizontalListBox");
    PiLogger.mute("AliasBox");
    PiLogger.mute("BehaviorUtils");

// PiLogger.mute("EditorCommunication");

    PiLogger.mute("ExampleScoper");

    // PiLogger.muteAllLogs();
}
