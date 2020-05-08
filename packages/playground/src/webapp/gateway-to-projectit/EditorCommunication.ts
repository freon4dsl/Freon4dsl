// This file contains all methods to connect to the projectIt generated language editorEnvironment
import { PiElement, PiNamedElement, PiCompositeProjection, ProjectionalEditor, PiError } from "@projectit/core";
import { editorEnvironment, initializer, languageName } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { Navigator } from "../projectit-webapp/Navigator";
import { ErrorList, IErrorItem } from "../projectit-webapp/ErrorList";
import { EditorArea } from "../projectit-webapp/EditorArea";

// TODO this interface is not used
export interface IModelUnit {
    id: number;
    name: string;
    language: string;
    // TODO check whether the url is useful
    url?: string;
}

// TODO make this a singleton, no static methods

export class EditorCommunication {
    static currentModelName = '';
    static editorArea: EditorArea;

    // used from the editor area
    static getEditor(): ProjectionalEditor {
        return editorEnvironment.projectionalEditorComponent;
    }

    // used from the menubar
    static new() {
        console.log("EditorCommunication new called");
        // TODO save previous model
        editorEnvironment.editor.rootElement = initializer.initialize();
        this.currentModelName = "";
    }

    static open(name: string) {
        console.log("Open model unit '" + name + "'");
        // TODO save previous model
        this.currentModelName = name;
        ServerCommunication.loadModel(name, this.loadModelInEditor);
    }

    static loadModelInEditor(model: PiElement) {
        console.log("loadModelInEditor");
        editorEnvironment.editor.rootElement = model as PiElement;
        EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
        // TODO remove the next statement
        EditorCommunication.editorArea.errorlist.allItems.push(new PiError("new message" + randomIntFromInterval(10, 100), null))
    }

    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            if (this.currentModelName.length === 0) {
                // TODO get name from user
                this.currentModelName = "modelUnit" + randomIntFromInterval(10, 100);
            }
            ServerCommunication.putModel(this.currentModelName, editorEnvironment.editor.rootElement);
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static saveAs(newName: string) {
        console.log("EditorCommunication save as called, new name: " + newName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.putModel(newName, editorEnvironment.editor.rootElement);
            this.editorArea.navigator._allModels.push({id: randomIntFromInterval(0, 10000), name: newName, language: languageName, url: "100.100.100.100"})
        } else {
            console.log("NO rootElement in editor");
        }
    }

    // used from the navigator:
    static getModelUnits(modelListCallback: (names: string[]) => void) {
        ServerCommunication.loadModelList(modelListCallback);
    }

    // END OF: for the communication with the navigator

    // for the communication with the error list:
    static errorSelected(error: IErrorItem) {
        console.log("Error selected: '" + error.errormessage + "', location:  '" + error.errorlocation + "'");
    }

    static getErrors(): PiError[] {
        return editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
    }

    // END OF: for the communication with the error list

    static getProjectionNames(): string[] {
        const proj = editorEnvironment.editor.projection;
        return (proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name]);
    }

    static setProjection(name: string): void {
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectiontoFront(name);
        }
    }

    static redo() {
        // TODO implement redo()
        return undefined;
    }

    static undo() {
        // TODO implement undo()
        return undefined;
    }
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
