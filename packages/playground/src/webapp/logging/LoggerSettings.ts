import { PiLogger } from "@projectit/core";

// Mute or unmute logs here (in addition to elsewhere).
export function muteLogs() {
    PiLogger.unmute("PiEditor");
    PiLogger.mute("PiUtils");
    PiLogger.mute("SelectOptionList");
    PiLogger.mute("X");
    PiLogger.mute("Language");

    PiLogger.mute("BoxFactory");
    PiLogger.mute("TableUtil");
    PiLogger.mute("TextBox");
    PiLogger.mute("SelectBox");
    PiLogger.mute("HorizontalListBox");
    PiLogger.mute("AliasBox");
    PiLogger.mute("Box");

    PiLogger.mute("AliasComponent");
    PiLogger.mute("OptionalComponent");
    PiLogger.mute("RenderComponent");
    PiLogger.mute("SelectableComponent");
    PiLogger.mute("LabelComponent");
    PiLogger.mute("ListComponent");
    PiLogger.mute("IndentComponent");
    PiLogger.mute("ElementComponent");
    PiLogger.mute("DropdownComponent");
    PiLogger.mute("DropdownItemComponent");
    PiLogger.mute("GridCellComponent");
    PiLogger.mute("TextComponent");
    PiLogger.mute("ProjectItComponent");

    PiLogger.mute("AUTORUN");
    PiLogger.mute("FOCUS")
    PiLogger.mute("AFTER_UPDATE");
    PiLogger.mute("MOUNT");

    PiLogger.unmute("EditorRequestsHandler");
    PiLogger.mute("EditorState");
    PiLogger.mute("ServerCommunication");

    PiLogger.mute("ExampleScoper");

    // PiLogger.muteAllLogs();
}
