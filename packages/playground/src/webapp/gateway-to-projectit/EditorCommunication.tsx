// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiElement, PiCompositeProjection, ProjectionalEditor, PiError, PiNamedElement } from "@projectit/core";
import { editorEnvironment } from "./WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { EditorArea } from "../projectit-webapp/EditorArea";
import * as React from "react";
import { PiToolbar } from "../projectit-webapp/PiToolbar";
import { IModelUnitData } from "./IServerCommunication";

// TODO make this a singleton, no static methods

export class EditorCommunication {
    static currentDocumentName = '';
    static currentModelName = '';
    static hasChanges: boolean = true;
    static editorArea: EditorArea;

    // used from the editor area
    static getEditor(): ProjectionalEditor {
        const currentUnit = editorEnvironment.editor.rootElement;
        if (!!currentUnit) {
            this.currentDocumentName = (currentUnit as PiNamedElement).name;
        }
        const model: PiElement = currentUnit.piContainer()?.container;
        if (!!model) { // should not be null of undefined
            // models should have a name property
            this.currentModelName = (model as PiNamedElement).name;
        }
        // console.log(`unit '${this.currentDocumentName}' has model '${this.currentModelName}'`);
        return editorEnvironment.projectionalEditorComponent;
    }

    // used from the menubar
    static newModel() {
        console.log("EditorCommunication new model called");
        editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
        EditorCommunication.currentModelName = "";
        EditorCommunication.currentDocumentName = "";
    }

    static newDocument(documentType: string) {
        console.log("EditorCommunication new document called, documentType: " + documentType);
        // add new model unit of right type to current model
        editorEnvironment.editor.rootElement = editorEnvironment.initializer.newUnit(editorEnvironment.editor.rootElement.piContainer().container, documentType);
        EditorCommunication.currentDocumentName = "";
    }

    static open(modelName: string, documentName: string) {
        console.log("Open document '" + modelName + "/" + documentName + "'");
        // TODO make sure the model unit interfaces are read
        ServerCommunication.getInstance().loadModelUnit({
                language: editorEnvironment.languageName,
                unitName: documentName,
                model: modelName},
            (unit: PiElement) => {
                console.log("loadModelInEditor");
                if (!!unit) {
                    // TODO make sure the model unit interfaces are read

                    // now set the editor to show the new unit
                    editorEnvironment.editor.rootElement = unit;
                    EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
                    EditorCommunication.currentDocumentName = documentName;
                    EditorCommunication.currentModelName = modelName;
                } else {
                    // give error message to user
                    PiToolbar.instance.alertContent = `Document '${modelName}/${documentName}' could not be found on the server.`;
                    PiToolbar.instance.alertIsVisible = true;
                }
            });
    }

    // we assume that elsewhere (in Menubar) it is checked that both modelName and documentName are present
    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            // save the document under the current name
            ServerCommunication.getInstance().putModelUnit({
                unitName: EditorCommunication.currentDocumentName,
                model: EditorCommunication.currentModelName,
                language: editorEnvironment.languageName
            }, editorEnvironment.editor.rootElement);
        } else {
            console.log("NO rootElement in editor");
        }
    }

    // we assume that newDocumentName is always set, but newModelName need not be set.
    static saveAs(newModelName: string, newDocumentName: string) {
        console.log("EditorCommunication save as called, new model name: " + newModelName + ", new document name: " + newDocumentName);
        if (newModelName !== EditorCommunication.currentModelName && newDocumentName !== EditorCommunication.currentDocumentName) {
            if (!!editorEnvironment.editor.rootElement) {
                // save the document under the new name
                ServerCommunication.getInstance().putModelUnit({
                    unitName: newDocumentName,
                    model: (!!newModelName? newModelName : EditorCommunication.currentModelName),
                    language: editorEnvironment.languageName
                }, editorEnvironment.editor.rootElement);
                // add the name to the navigator
                EditorCommunication.editorArea.navigator._allDocuments.push({
                    unitName: newDocumentName,
                    model: newModelName,
                    language: editorEnvironment.languageName
                });
                // remember the new names
                EditorCommunication.currentDocumentName = newDocumentName;
                EditorCommunication.currentModelName = (!!newModelName? newModelName : EditorCommunication.currentModelName);
            } else {
                console.log("NO rootElement in editor");
            }
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

    static getModelUnitTypes(): string[] {
        return editorEnvironment.unitNames;
    }

    // used from the navigator:
    static getModelUnits(modelListCallback: (names: IModelUnitData[]) => void) {
        ServerCommunication.getInstance().loadModelUnitList(editorEnvironment.languageName, modelListCallback);
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

// function randomIntFromInterval(min, max) { // min and max included
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }
