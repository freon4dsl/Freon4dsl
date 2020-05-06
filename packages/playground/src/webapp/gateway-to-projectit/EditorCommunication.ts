// This file contains all methods to connect to the projectIt generated language editorEnvironment
import { PiElement, PiNamedElement, PiCompositeProjection, ProjectionalEditor, PiError } from "@projectit/core";
import { editorEnvironment, initializer } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";

// TODO this interface is not used
export interface IModelUnit {
    id: number;
    name: string;
    language: string;
    // TODO check whether the url is useful
    url?: string;
}

export interface IErrorItem {
    key: number;
    errormessage: string;
    errorlocation: string;
}

export class EditorCommunication {
    static currentModelName = '';
    static currentErrorList: PiError[] = [];

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
        editorEnvironment.editor.rootElement = model as PiElement;
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
            // TODO add name to navigator pane
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

    static getErrors(): IErrorItem[] {
        let myList: IErrorItem[] = [];
        myList.push({
            key: -1,
            errormessage: "This is an error from ProjectIt",
            errorlocation: "somewhere"
        });
        this.currentErrorList = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
        this.currentErrorList.forEach((err:PiError, index: number) => {
            myList.push({
                key: index,
                errormessage: err.message,
                errorlocation: "ergens"
            })
        });
        // TODO get the errorlocation right
        return myList;
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
