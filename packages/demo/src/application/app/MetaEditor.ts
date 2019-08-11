import { PiActions, PiContext, PiEditor } from "@projectit/core";
import { EditorWithToolBar, PiEditorWithToolbar } from "./toolbars/EditorWithToolbar";
import { MetaProjection } from "@projectit/meta";

import { loadComponent } from "../../editor/LoadComponent";
import { saveComponent } from "../../editor/SaveComponent";

import { MyToolbarItem } from "./toolbars/MyToolbarItem";
import { DemoProjection, getModelList } from "../../editor";

export class MetaEditor extends PiEditorWithToolbar {

    constructor(context: PiContext, projection: MetaProjection, actions?: PiActions) {
        super(context, projection, actions)
    }

    mytoolbarItems: MyToolbarItem[] = [
        {
            id: "save",
            label: "Save",
            onClick: (editor: PiEditor): void => {},
            component: async (editor: PiEditor): Promise<JSX.Element> => {
                return saveComponent({ editor: editor });
            }
        },
        {
            id: "load",
            label: "Load",
            onClick: (editor: PiEditor): void => {
                console.log("On Click");
            },
            component: async (editor: PiEditor): Promise<JSX.Element> => {
                const models = await getModelList();
                return loadComponent({ editor: editor, models: models as string[] });
            }
        },
        {
            id: "text",
            label: "Text",
            onClick: (editor: PiEditor): void => {
                (editor.projection as MetaProjection).projectionType = "text";
            }
        },
        {
            id: "table",
            label: "table",
            onClick: (editor: PiEditor): void => {
                (editor.projection as MetaProjection).projectionType = "table";
            }
        }
    ]
}
