import { PiEditor } from "@projectit/core";
import { MyToolbarItem } from "./MyToolbarItem";

export interface ToolBarDefinition {
    mytoolbarItems: MyToolbarItem[];
}

export class PiEditorWithToolbar extends PiEditor implements ToolBarDefinition {
    mytoolbarItems: MyToolbarItem[];
}

