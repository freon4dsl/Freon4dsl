import { PiActions, PiContext, PiEditor } from "@projectit/core";
import { PiProjection } from "@projectit/core";
import { PiEditorWithToolbar } from "./toolbars/ToolBarDefinition";

// import { loadComponent } from "../app/LoadComponent";
// import { saveComponent } from "../app/SaveComponent";

import { MyToolbarItem } from "./toolbars/MyToolbarItem";

export class DemoEditor extends PiEditorWithToolbar {

    constructor(context: PiContext, projection: PiProjection, actions?: PiActions) {
        super(context, projection, actions)
    }

    mytoolbarItems: MyToolbarItem[] = [
        {
            id: "save",
            label: "Save Demo",
            onClick: (editor: PiEditor): void => {},
            component: async (editor: PiEditor): Promise<JSX.Element> => {
                // return saveComponent({ editor: editor });
                return null;
            }
        },
        {
            id: "load",
            label: "Load",
            onClick: (editor: PiEditor): void => {
                console.log("On Click");
            },
            component: async (editor: PiEditor): Promise<JSX.Element> => {
                // const models = await getModelList();
                // return loadComponent({ editor: editor, models: models as string[] });
                return null;
            }
        },
        {
            id: "text",
            label: "Text",
            onClick: (editor: PiEditor): void => {
                // (editor.projection as DemoProjection).projectionType = "text";
            }
        },
        {
            id: "tree",
            label: "Tree",
            onClick: (editor: PiEditor): void => {
                // (editor.projection as DemoProjection).projectionType = "tree";
            }
        },
        {
            id: "orboxed",
            label: "or boxed",
            onClick: (editor: PiEditor): void => {
                // (editor.projection as DemoProjection).projectionType = "orboxed";
            }
        },
        {
            id: "brackets",
            label: "toggle brackets",
            onClick: (editor: PiEditor): void => {
                // (editor.projection as DemoProjection).showBrackets = !(editor.projection as DemoProjection).showBrackets;
            }
        }

    ]
}
