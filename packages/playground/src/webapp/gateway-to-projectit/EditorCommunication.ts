// This file contains all methods to connect to the projectIt generated language editorEnvironment
import { PiElement, PiCompositeProjection, ProjectionalEditor } from "@projectit/core";

import { editorEnvironment, initializer, languageName } from "./WebappConfiguration";
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
    key: number | string;
    errormessage: string;
    errorlocation: string;
}

export class EditorCommunication {
    // used from the editor area
    static getEditor(): ProjectionalEditor {
        return editorEnvironment.projectionalEditorComponent;
    }

    // used from the menubar
    static new() {
        console.log("EditorCommunication new called");
        // TODO save previous model
        editorEnvironment.editor.rootElement = initializer.initialize();
    }

    static open(name: string) {
        console.log("Open model unit '" + name + "'");
        // TODO save previous model
        // TODO get model name from navigator
        this.currentModelName = "default";
        ServerCommunication.loadModel(name, this.loadModelInEditor);
    }

    static loadModelInEditor(model: PiElement) {
        editorEnvironment.editor.rootElement = model as PiElement;
    }

    static currentModelName = '';
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
            key: 0,
            errormessage: "This is an error from ProjectIt",
            errorlocation: "somewhere in the editor"
        });
        for (let i = 1; i < 25; i++) {
            myList.push({
                key: i,
                errormessage: EditorCommunication.mockErrors(),
                errorlocation: EditorCommunication.mockErrors()
            });
        }
        return myList;
    }

    // the following sets the content of the errorlist items and can be removed when the errors are observable
    static LOREM_IPSUM = (
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut " +
        "labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut "
    ).split(" ");
    static loremIndex = 0;

    static mockErrors(): string {
        let wordCount = 4;
        const startIndex = this.loremIndex + wordCount > this.LOREM_IPSUM.length ? 0 : this.loremIndex;
        this.loremIndex = startIndex + wordCount;
        return this.LOREM_IPSUM.slice(startIndex, this.loremIndex).join(" ");
    }
    // END OF: the following sets the content of the errorlist items and can be removed when the errors are observable
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
        return undefined;
    }

    static undo() {
        return undefined;
    }
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
