// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiElement, PiCompositeProjection, ProjectionalEditor, PiError } from "@projectit/core";
import { editorEnvironment, initializer, languageName } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { IErrorItem } from "../projectit-webapp/ErrorList";
import { EditorArea } from "../projectit-webapp/EditorArea";

// TODO rethink this interface
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
        EditorCommunication.currentModelName = "";
    }

    static open(name: string) {
        console.log("Open model unit '" + name + "'");
        // TODO save previous model
        EditorCommunication.currentModelName = name;
        ServerCommunication.loadModel(languageName, name, EditorCommunication.loadModelInEditor);
    }

    static loadModelInEditor(model: PiElement) {
        console.log("loadModelInEditor");
        editorEnvironment.editor.rootElement = model as PiElement;
        EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
        // TODO remove the next statement, only used for debugging
        EditorCommunication.editorArea.errorlist.allItems.push(new PiError("new message" + randomIntFromInterval(10, 100), null))
    }

    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            if (EditorCommunication.currentModelName.length === 0) {
                // TODO get name from user
                EditorCommunication.currentModelName = "modelUnit" + randomIntFromInterval(10, 100);
            }
            ServerCommunication.putModel(languageName, EditorCommunication.currentModelName, editorEnvironment.editor.rootElement);
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static saveAs(newName: string) {
        console.log("EditorCommunication save as called, new name: " + newName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.putModel(languageName, newName, editorEnvironment.editor.rootElement);
            EditorCommunication.editorArea.navigator._allModels.push({id: randomIntFromInterval(0, 10000), name: newName, language: languageName, url: "100.100.100.100"})
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static deleteCurrentModel() {
        console.log("EditorCommunication delete called, current model: " + EditorCommunication.currentModelName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.deleteModel(languageName, EditorCommunication.currentModelName);
            editorEnvironment.editor.rootElement = initializer.initialize();
            EditorCommunication.editorArea.navigator.removeName(EditorCommunication.currentModelName);
            EditorCommunication.currentModelName = "";
        } else {
            console.log("NO rootElement in editor");
        }
    }

    // used from the navigator:
    static getModelUnits(modelListCallback: (names: string[]) => void) {
        ServerCommunication.loadModelList(languageName, modelListCallback);
    }

    // END OF: for the communication with the navigator

    // for the communication with the error list:
    static errorSelected(error: IErrorItem) {
        console.log("Error selected: '" + error.errormessage + "', location:  '" + error.errorlocation + "'");
        // TODO implement errorSelected()
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
