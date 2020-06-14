// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiElement, PiCompositeProjection, ProjectionalEditor, PiError } from "@projectit/core";
import { editorEnvironment } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { EditorArea } from "../projectit-webapp/EditorArea";
import { App } from "../projectit-webapp/App";
import { Input } from "@fluentui/react-northstar";
import * as React from "react";

// TODO make this a singleton, no static methods

export class EditorCommunication {
    static currentModelName = '';
    static editorArea: EditorArea;

    // used from the editor area
    static getEditor(): ProjectionalEditor {
        return editorEnvironment.projectionalEditorComponent;
    }

    // used from the menubar
    static newModel() {
        console.log("EditorCommunication new called");
        if (!!editorEnvironment.editor.rootElement) {
            EditorCommunication.savePrevious();
        } else {
            editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
            EditorCommunication.currentModelName = "";
        }
    }

    private static input: HTMLInputElement = null;
    private static setInput = (element: any | null) => {
        EditorCommunication.input = element;
    };

    private static savePrevious(newModelName?: string) {
        // TODO this works for new but not for open
        if (!!editorEnvironment.editor.rootElement) {
            // set up the dialog and show it
            App.setDialogTitle("Changing to model '" + (!!newModelName? newModelName : "new") + "'");
            App.setDialogSubText("Should the previous model be saved? If so, please, enter its name. ");
            App.useDefaultButton();
            App.setDialogContent(<Input placeholder={EditorCommunication.currentModelName} inputRef={this.setInput}/>);
            App.showDialogWithCallback(() => {
                // user has pushed OK and may have entered a new name
                const saveName = EditorCommunication.input?.value;
                if (saveName !== EditorCommunication.currentModelName) {
                    ServerCommunication.getInstance().putModel(editorEnvironment.languageName, saveName, editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allModels.push({
                        id: randomIntFromInterval(0, 10000),
                        name: saveName,
                        language: editorEnvironment.languageName,
                        url: "100.100.100.100"
                    });
                } else {
                    ServerCommunication.getInstance().putModel(editorEnvironment.languageName, EditorCommunication.currentModelName, editorEnvironment.editor.rootElement);
                }
                // now we can finally switch to the new model
                if(!!newModelName) {
                    ServerCommunication.getInstance().loadModel(editorEnvironment.languageName, newModelName, EditorCommunication.loadModelInEditor);
                    EditorCommunication.currentModelName = newModelName;
                } else {
                    editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
                    EditorCommunication.currentModelName = "";
                }
            });
        }
    }

    static open(name: string) {
        console.log("Open model unit '" + name + "'");
        if (!!editorEnvironment.editor.rootElement) {
            EditorCommunication.savePrevious(name);
        } else {
            ServerCommunication.getInstance().loadModel(editorEnvironment.languageName, name, EditorCommunication.loadModelInEditor);
            EditorCommunication.currentModelName = name;
        }
    }

    static loadModelInEditor(model: PiElement) {
        console.log("loadModelInEditor");
        editorEnvironment.editor.rootElement = model as PiElement;
        EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
        // TODO remove the next statement, only used for debugging
        EditorCommunication.editorArea.errorlist.allItems.push(new PiError("new message" + randomIntFromInterval(10, 100), null, ""))
    }

    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            if (EditorCommunication.currentModelName.length === 0) {
                // no name, so get name from user
                App.setDialogTitle("Saving model");
                App.setDialogSubText("Please, enter a name. ");
                App.useDefaultButton();
                App.setDialogContent(<Input value={"modelUnit" + randomIntFromInterval(10, 100)} inputRef={this.setInput}/>);
                App.showDialogWithCallback(() => {
                    // user has pushed OK and may have entered a new name
                    const saveName = EditorCommunication.input?.value;
                    // TODO check saveName
                    EditorCommunication.currentModelName = saveName;
                    ServerCommunication.getInstance().putModel(editorEnvironment.languageName, EditorCommunication.currentModelName, editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allModels.push({id: randomIntFromInterval(0, 10000), name: EditorCommunication.currentModelName, language: editorEnvironment.languageName, url: "100.100.100.100"})
                });
            } else {
                ServerCommunication.getInstance().putModel(editorEnvironment.languageName, EditorCommunication.currentModelName, editorEnvironment.editor.rootElement);
            }
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static saveAs(newName: string) {
        console.log("EditorCommunication save as called, new name: " + newName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().putModel(editorEnvironment.languageName, newName, editorEnvironment.editor.rootElement);
            EditorCommunication.editorArea.navigator._allModels.push({id: randomIntFromInterval(0, 10000), name: newName, language: editorEnvironment.languageName, url: "100.100.100.100"})
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static deleteCurrentModel() {
        console.log("EditorCommunication delete called, current model: " + EditorCommunication.currentModelName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModel(editorEnvironment.languageName, EditorCommunication.currentModelName);
            editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
            EditorCommunication.editorArea.navigator.removeName(EditorCommunication.currentModelName);
            EditorCommunication.currentModelName = "";
        } else {
            console.log("NO rootElement in editor");
        }
    }

    // used from the navigator:
    static getModelUnits(modelListCallback: (names: string[]) => void) {
        ServerCommunication.getInstance().loadModelList(editorEnvironment.languageName, modelListCallback);
    }

    // END OF: for the communication with the navigator

    // for the communication with the error list:
    static errorSelected(error: PiError) {
        console.log("Error selected: '" + error.message + "', location:  '" + error.reportedOn + "'");
        if (Array.isArray(error.reportedOn)) {
            editorEnvironment.editor.selectElement(error.reportedOn[0]);
        } else {
            editorEnvironment.editor.selectElement(error.reportedOn);
        }
    }

    static getErrors() {
        console.log("EditorCommunication.getErrors() for " + editorEnvironment.editor.rootElement.piLanguageConcept());
        EditorCommunication.editorArea.errorlist.allItems =  editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
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
