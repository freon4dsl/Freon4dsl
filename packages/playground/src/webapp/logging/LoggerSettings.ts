import { PiLogger } from "@projectit/core";

// Mute or unmute logs here (in addition to elsewhere).
export function muteLogs() {
    // from ~/core-svelte:
    PiLogger.mute("ContextMenu");            // currently, there is no LOGGER for ContextMenu
    PiLogger.mute("DropdownComponent");      // currently, there is no LOGGER for DropdownComponent
    PiLogger.mute("EmptyLineComponent");     // currently, there is no LOGGER for EmptyLineComponent
    // PiLogger.mute("GridCellComponent");
    // PiLogger.mute("GridComponent");
    PiLogger.mute("IndentComponent");        // currently, there is no LOGGER for IndentComponent
    PiLogger.mute("LabelComponent");
    PiLogger.mute("LayoutComponent");
    // PiLogger.mute("ListComponent");
    PiLogger.mute("OptionalComponent");
    // PiLogger.mute("ProjectItComponent");
    // PiLogger.mute("RenderComponent");
    PiLogger.mute("TextComponent");
    PiLogger.mute("TextDropdownComponent");

    // from ~/core:
    // PiLogger.mute("PiEditor");
    // PiLogger.mute("PiUtils");
    // PiLogger.mute("SelectOptionList");
    // PiLogger.mute("BoxFactory");
    // PiLogger.mute("Language");
    // PiLogger.mute("TableUtil");
    // PiLogger.mute("TextBox");
    // PiLogger.mute("SelectBox");
    // PiLogger.mute("HorizontalListBox");
    PiLogger.mute("ActionBox");

    // from ~/webapp:
    PiLogger.mute("EditorCommunication");
    PiLogger.mute("ServerCommunication");
    PiLogger.mute("EditorState");

    // from current project:
    PiLogger.mute("ExampleScoper");

    // PiLogger.muteAllLogs();
}
