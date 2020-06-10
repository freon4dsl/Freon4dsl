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

export class EditorCommunication {
    static currentDocumentName = '';
    static currentModelName = 'currentModel';
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
            EditorCommunication.currentDocumentName = "";
        }
    }

    private static input: HTMLInputElement = null;
    private static setInput = (element: any | null) => {
        EditorCommunication.input = element;
    };

    private static savePrevious(newModelName?: string) {
        console.log(`savePrevious called`);
        // TODO this works for new but not for open
        if (!!editorEnvironment.editor.rootElement) {
            // set up the dialog and show it
            App.setDialogTitle("Changing to document '" + (!!newModelName? newModelName : "new") + "'");
            App.setDialogSubText("Should the previous document be saved? If so, please, enter its name. ");
            App.useDefaultButton();
            App.setDialogContent(<Input placeholder={EditorCommunication.currentDocumentName} inputRef={this.setInput}/>);
            App.showDialogWithCallback(() => {
                // user has pushed OK and may have entered a new unitName
                const saveName = EditorCommunication.input?.value;
                if (saveName !== EditorCommunication.currentDocumentName) {
                    console.log(`savePrevious: saveName != current name `);
                    ServerCommunication.getInstance().putModelUnit({
                            language: editorEnvironment.languageName,
                            unitName: saveName,
                            model: EditorCommunication.currentModelName},
                        editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allDocuments.push({
                        unitName: saveName,
                        model: EditorCommunication.currentModelName,
                        language: editorEnvironment.languageName,
                    });
                } else {
                    console.log(`savePrevious: saveName == current name `);
                    ServerCommunication.getInstance().putModelUnit({
                            language: editorEnvironment.languageName,
                            unitName: EditorCommunication.currentDocumentName,
                            model: EditorCommunication.currentModelName},
                        editorEnvironment.editor.rootElement);
                }
                // now we can finally switch to the new model
                if(!!newModelName) {
                    console.log(`savePrevious: newModelName has value `);
                    ServerCommunication.getInstance().loadModelUnit({
                        language: editorEnvironment.languageName,
                        unitName: newModelName,
                        model: EditorCommunication.currentModelName},
                        EditorCommunication.loadModelInEditor);
                    EditorCommunication.currentDocumentName = newModelName;
                } else {
                    console.log(`savePrevious: newModelName does not have a value `);
                    editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
                    EditorCommunication.currentDocumentName = "";
                }
            });
        } else {
            console.log(`savePrevious called ELSE branch`);
        }
    }

    static open(model: string, document: string) {
        console.log("Open document '" + model + "/" + document + "'");
        if (!!editorEnvironment.editor.rootElement) {
            EditorCommunication.savePrevious(document);
            console.log("savePrevious should have been called");
        } else {
            console.log("loading new document");
            ServerCommunication.getInstance().loadModelUnit({
                language: editorEnvironment.languageName,
                unitName: document,
                model: model},
                EditorCommunication.loadModelInEditor);
            EditorCommunication.currentDocumentName = document;
            EditorCommunication.currentModelName = model;
        }
    }

    static loadModelInEditor(model: PiElement) {
        console.log("loadModelInEditor");
        editorEnvironment.editor.rootElement = model as PiElement;
        EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
        // TODO remove the next statement, only used for debugging
        // EditorCommunication.editorArea.errorlist.allItems.push(new PiError("new message" + randomIntFromInterval(10, 100), null, ""))
    }

    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            if (EditorCommunication.currentDocumentName.length === 0) {
                // no unitName, so get unitName from user
                App.setDialogTitle("Saving document");
                App.setDialogSubText("Please, enter a name. ");
                App.useDefaultButton();
                App.setDialogContent(<Input value={"document" + randomIntFromInterval(10, 100)} inputRef={this.setInput}/>);
                App.showDialogWithCallback(() => {
                    // user has pushed OK and may have entered a new unitName
                    const saveName = EditorCommunication.input?.value;
                    // TODO check saveName
                    EditorCommunication.currentDocumentName = saveName;
                    ServerCommunication.getInstance().putModelUnit({
                        language: editorEnvironment.languageName,
                        unitName: EditorCommunication.currentDocumentName,
                        model: EditorCommunication.currentModelName},
                        editorEnvironment.editor.rootElement);
                    EditorCommunication.editorArea.navigator._allDocuments.push({
                        unitName: EditorCommunication.currentDocumentName,
                        model: EditorCommunication.currentModelName,
                        language: editorEnvironment.languageName
                    })
                });
            } else {
                ServerCommunication.getInstance().putModelUnit({
                    unitName: EditorCommunication.currentDocumentName,
                    model: EditorCommunication.currentModelName,
                    language: editorEnvironment.languageName
                }, editorEnvironment.editor.rootElement);
            }
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static saveAs(newName: string) {
        console.log("EditorCommunication save as called, new name: " + newName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().putModelUnit({
                unitName: newName,
                model: EditorCommunication.currentModelName,
                language: editorEnvironment.languageName
            }, editorEnvironment.editor.rootElement);
            EditorCommunication.editorArea.navigator._allDocuments.push({unitName: newName, model: EditorCommunication.currentModelName, language: editorEnvironment.languageName})
        } else {
            console.log("NO rootElement in editor");
        }
    }

    static deleteCurrentModel() {
        console.log("EditorCommunication delete called, current document: " + EditorCommunication.currentDocumentName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModelUnit({language: editorEnvironment.languageName, unitName: EditorCommunication.currentDocumentName, model: EditorCommunication.currentModelName});
            editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
            EditorCommunication.editorArea.navigator.removeName(EditorCommunication.currentDocumentName);
            EditorCommunication.currentDocumentName = "";
        } else {
            console.log("NO rootElement in editor");
        }
    }

    // used from the navigator:
    static getModelUnits(modelListCallback: (names: string[]) => void) {
        ServerCommunication.getInstance().loadModelUnitList(editorEnvironment.languageName, EditorCommunication.currentModelName, modelListCallback);
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
