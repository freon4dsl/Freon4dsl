// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiElement, PiCompositeProjection, ProjectionalEditor, PiError } from "@projectit/core";
import { editorEnvironment } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { EditorArea } from "../projectit-webapp/EditorArea";
import { App } from "../projectit-webapp/App";
import { Input } from "@fluentui/react-northstar";
import * as React from "react";
import { IModelUnitData } from "./IServerCommunication";

// TODO make this a singleton, no static methods
// for now, but TODO change this
const modelName: string = "currentModel";


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
            App.setDialogSubText("Should the previous model be saved? If so, please, enter its unitName. ");
            App.useDefaultButton();
            App.setDialogContent(<Input placeholder={EditorCommunication.currentModelName} inputRef={this.setInput}/>);
            App.showDialogWithCallback(() => {
                // user has pushed OK and may have entered a new unitName
                const saveName = EditorCommunication.input?.value;
                if (saveName !== EditorCommunication.currentModelName) {
                    ServerCommunication.getInstance().putModelUnit({
                            language: editorEnvironment.languageName,
                            unitName: saveName,
                            model: modelName},
                        editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allModels.push({
                        unitName: saveName,
                        model: modelName,
                        language: editorEnvironment.languageName,
                    });
                } else {
                    ServerCommunication.getInstance().putModelUnit({
                            language: editorEnvironment.languageName,
                            unitName: EditorCommunication.currentModelName,
                            model: modelName},
                        editorEnvironment.editor.rootElement);
                }
                // now we can finally switch to the new model
                if(!!newModelName) {
                    ServerCommunication.getInstance().loadModelUnit({
                        language: editorEnvironment.languageName,
                        unitName: newModelName,
                        model: modelName},
                        EditorCommunication.loadModelInEditor);
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
            ServerCommunication.getInstance().loadModelUnit({
                language: editorEnvironment.languageName,
                unitName: name,
                model: modelName},
                EditorCommunication.loadModelInEditor);
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
                // no unitName, so get unitName from user
                App.setDialogTitle("Saving model");
                App.setDialogSubText("Please, enter a unitName. ");
                App.useDefaultButton();
                App.setDialogContent(<Input value={"modelUnit" + randomIntFromInterval(10, 100)} inputRef={this.setInput}/>);
                App.showDialogWithCallback(() => {
                    // user has pushed OK and may have entered a new unitName
                    const saveName = EditorCommunication.input?.value;
                    // TODO check saveName
                    EditorCommunication.currentModelName = saveName;
                    ServerCommunication.getInstance().putModelUnit({
                        language: editorEnvironment.languageName,
                        unitName: EditorCommunication.currentModelName,
                        model: modelName},
                        editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allModels.push({
                        unitName: EditorCommunication.currentModelName,
                        model: modelName,
                        language: editorEnvironment.languageName
                    })
                });
            } else {
                ServerCommunication.getInstance().putModelUnit({
                    unitName: EditorCommunication.currentModelName,
                    model: modelName,
                    language: editorEnvironment.languageName
                }, editorEnvironment.editor.rootElement);
            }
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static saveAs(newName: string) {
        console.log("EditorCommunication save as called, new unitName: " + newName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().putModelUnit({
                unitName: newName,
                model: modelName,
                language: editorEnvironment.languageName
            }, editorEnvironment.editor.rootElement);
            EditorCommunication.editorArea.navigator._allModels.push({unitName: newName, model: modelName, language: editorEnvironment.languageName})
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static deleteCurrentModel() {
        console.log("EditorCommunication delete called, current model: " + EditorCommunication.currentModelName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModelUnit({language: editorEnvironment.languageName, unitName: EditorCommunication.currentModelName, model: modelName});
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
