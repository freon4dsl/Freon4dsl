import { PiLogger } from "@projectit/core";

// Mute or unmute logs here (in addition to elsewhere).
export function muteLogs() {
    // from ~/core-svelte:
    PiLogger.mute("ContextMenu");
    PiLogger.mute("DropdownComponent");      // currently, there is no LOGGER for DropdownComponent
    PiLogger.mute("EmptyLineComponent");     // currently, there is no LOGGER for EmptyLineComponent
    PiLogger.mute("ElementComponent");
    PiLogger.mute("TableCellComponent");
    PiLogger.mute("TableRowComponent");
    PiLogger.mute("TableComponent");
    PiLogger.mute("IndentComponent");        // currently, there is no LOGGER for IndentComponent
    PiLogger.mute("LabelComponent");
    PiLogger.mute("LayoutComponent");
    PiLogger.mute("ListComponent");
    PiLogger.mute("OptionalComponent");
    PiLogger.mute("ProjectItComponent");
    PiLogger.mute("RenderComponent");
    PiLogger.mute("TextComponent");
    PiLogger.mute("TextDropdownComponent");

    // from ~/core:
    PiLogger.mute("PiEditor");
    PiLogger.mute("PiUtils");
    PiLogger.mute("SelectOptionList");
    PiLogger.mute("BoxFactory");
    PiLogger.mute("Language");
    PiLogger.mute("TableUtil");
    PiLogger.mute("TableBox");
    PiLogger.mute("TextBox");
    PiLogger.mute("SelectBox");
    PiLogger.mute("HorizontalListBox");
    PiLogger.mute("ActionBox");
    PiLogger.mute("PiCommand");
    PiLogger.mute("BehaviorUtils");
    PiLogger.mute("Box");
    // PiLogger.mute("ListBox");

    // from ~/webapp:
    PiLogger.mute("EditorCommunication");
    PiLogger.mute("ServerCommunication");
    PiLogger.mute("EditorState");
    PiLogger.mute("EditorRequestsHandler");

    // from current project:
    PiLogger.mute("ExampleScoper");

    // PiLogger.muteAllLogs();
}
