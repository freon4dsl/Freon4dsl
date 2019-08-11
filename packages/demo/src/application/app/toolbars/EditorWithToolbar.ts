import { PiEditor } from "@projectit/core";
import { MyToolbarItem } from "packages/demo/src/application/app/toolbars/MyToolbarItem";

export interface EditorWithToolBar {
    mytoolbarItems: MyToolbarItem[];
}

export class PiEditorWithToolbar extends PiEditor implements EditorWithToolBar {
    mytoolbarItems: MyToolbarItem[];
}

