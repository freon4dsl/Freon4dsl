import { PiActions, PiContext, PiEditor } from "@projectit/core";
import { PiProjection } from "@projectit/core";
import { PiEditorWithToolbar } from "../../application/app/toolbars/ToolBarDefinition";

import { loadComponent } from "../../editor/LoadComponent";
import { saveComponent } from "../../editor/SaveComponent";

import { MyToolbarItem } from "./toolbars/MyToolbarItem";
import { DemoProjection, getModelList } from "../../editor";

export class DemoEditor extends PiEditorWithToolbar {

    constructor(projection: PiProjection, actions?: PiActions) {
        super(projection, actions)
    }

    mytoolbarItems: MyToolbarItem[] = [
        {
            id: "save",
            label: "Save Demo",
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
                (editor.projection as DemoProjection).projectionType = "text";
            }
        },
        {
            id: "tree",
            label: "Tree",
            onClick: (editor: PiEditor): void => {
                (editor.projection as DemoProjection).projectionType = "tree";
            }
        },
        {
            id: "orboxed",
            label: "or boxed",
            onClick: (editor: PiEditor): void => {
                (editor.projection as DemoProjection).projectionType = "orboxed";
            }
        },
        {
            id: "brackets",
            label: "toggle brackets",
            onClick: (editor: PiEditor): void => {
                (editor.projection as DemoProjection).showBrackets = !(editor.projection as DemoProjection).showBrackets;
            }
        }

    ]
}
