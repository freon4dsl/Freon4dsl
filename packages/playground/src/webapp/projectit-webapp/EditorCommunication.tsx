// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiCompositeProjection, ProjectionalEditor, PiError, PiNamedElement, PiModel } from "@projectit/core";
import { editorEnvironment } from "../WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { EditorArea } from "../projectit-webapp/EditorArea";
import * as React from "react";
import { PiToolbar } from "../projectit-webapp/PiToolbar";
import { observable } from "mobx";

export class EditorCommunication {
    currentUnit: PiNamedElement = null;
    @observable currentModel: PiModel = null;
    hasChanges: boolean = false; // TODO get the value from the editor
    editorArea: EditorArea;
    private static instance: EditorCommunication = null;
    
    static getInstance(): EditorCommunication {
        if( EditorCommunication.instance === null){
            EditorCommunication.instance = new EditorCommunication();
        }
        return EditorCommunication.instance;
    }

    // called from the editor area
    getEditor(): ProjectionalEditor {
        const currentUnit = editorEnvironment.editor.rootElement;
        if (!!currentUnit) {
            return editorEnvironment.projectionalEditorComponent;
        } else {
            return null;
        }
    }

    // used from the menubar
    newModel(newName: string) {
        console.log("EditorCommunication new model called: " + newName);
        this.currentModel = editorEnvironment.newModel(newName);
        this.currentUnit = null;
        this.hasChanges = false;
    }

    newUnit(unitType: string) {
        console.log("EditorCommunication new unit called, unitType: " + unitType);
        if (!!this.currentUnit) {
            // get the interface of the current unit from the server
            ServerCommunication.getInstance().loadModelUnitInterface(
                EditorCommunication.getInstance().currentModel.name,
                EditorCommunication.getInstance().currentUnit.name,
                (oldUnitInterface: PiNamedElement) => {
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                        this.createNewUnit(unitType);
                    }
                });
        } else {
            this.createNewUnit(unitType);
        }
    }

    private createNewUnit(unitType: string) {
        // create a new unit and add it to the current model
        let newUnit = EditorCommunication.getInstance().currentModel.newUnit(unitType);
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            // error message
            PiToolbar.instance.alertContent = `Model unit of type '${unitType}' could not be created.`;
            PiToolbar.instance.alertIsVisible = true;
        }
    }

    saveCurrentUnit() {
        console.log("EditorCommunication save current unit called");
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().putModelUnit({
                unitName: this.currentUnit.name,
                modelName: this.currentModel.name,
                language: editorEnvironment.languageName
            }, editorEnvironment.editor.rootElement as PiNamedElement);
            this.hasChanges = false;
        } else {
            console.log("No current model unit");
        }
    }

    deleteCurrentUnit() {
        console.log("EditorCommunication delete called, current unit: " + this.currentUnit.name);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModelUnit({language: editorEnvironment.languageName, unitName: this.currentUnit.name, modelName: this.currentModel.name});
            // get rid of old model unit from memory
            this.currentModel.removeUnit(this.currentUnit);
            // show nothing in the editor and error list
            this.showUnitAndErrors(null);
        } else {
            console.log("No current model unit");
        }
    }

    async openModel(modelName: string) {
        console.log("EditorCommunication openModel called, modelName: " + modelName);
        // create new model instance and set its name
        let model: PiModel = editorEnvironment.newModel(modelName);
        ServerCommunication.getInstance().loadUnitList(modelName, (unitNames: string[]) => {
            // load the first unit completely and show it
            // load all others units as interfaces
            let first: boolean = true;
            for (const unitName of unitNames) {
                if (first) {
                    ServerCommunication.getInstance().loadModelUnit( modelName, unitName, (unit: PiNamedElement) => {
                        model.addUnit(unit);
                        EditorCommunication.getInstance().showUnitAndErrors(unit);
                    });
                    first = false;
                } else {
                    ServerCommunication.getInstance().loadModelUnitInterface(modelName, unitName, (unit: PiNamedElement) => {
                        model.addUnit(unit);
                    });
                }
            }
        });
        this.currentModel = model;
    }

    async openModelUnit(newUnitName: string) {
        console.log("EditorCommunication openModelUnit called, unitName: " + newUnitName);
        if (!!this.currentUnit && newUnitName == this.currentUnit.name ) {
            return;
        }

        // find the requested unit interface in the model
        let newUnitInterface: PiNamedElement = this.currentModel.findUnit(newUnitName);
        // get the full unit from the server
        await ServerCommunication.getInstance().loadModelUnit(EditorCommunication.getInstance().currentModel.name, newUnitName, (newUnit: PiNamedElement) => {
            if (!!EditorCommunication.getInstance().currentUnit) {
                // get the interface of the current unit from the server
                ServerCommunication.getInstance().loadModelUnitInterface(
                    EditorCommunication.getInstance().currentModel.name,
                    EditorCommunication.getInstance().currentUnit.name,
                    (oldUnitInterface: PiNamedElement) => {
                        // swap current unit with its interface in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                        // swap the new unit interface with the full unit in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newUnit);
                        // show the new unit in the editor
                        this.showUnitAndErrors(newUnit);
                    });
            } else {
                // swap the new unit interface with the full unit in the in-memory model
                EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newUnit);
                // show the new unit in the editor
                this.showUnitAndErrors(newUnit);
            }
        });
    }

    private showUnitAndErrors(newUnit: PiNamedElement) {
        editorEnvironment.editor.rootElement = newUnit;
        EditorCommunication.getInstance().currentUnit = newUnit;
        if (!!newUnit) {
            EditorCommunication.getInstance().hasChanges = true;
            EditorCommunication.getInstance().getErrors();
        } else {
            EditorCommunication.getInstance().hasChanges = false;
            this.editorArea.errorlist.allItems = [];
        }
    }

// we assume that newDocumentName is always set, but newModelName need not be set.
    // saveUnitAs(newDocumentName: string) {
    //     console.log("EditorCommunication save as called, new document name: " + newDocumentName);
    //     if (newDocumentName !== this.currentUnit.name) {
    //         if (!!editorEnvironment.editor.rootElement) {
    //             // save the document under the new name
    //             ServerCommunication.getInstance().putModelUnit({
    //                 unitName: newDocumentName,
    //                 modelName: this.currentModel.name,
    //                 language: editorEnvironment.languageName
    //             }, editorEnvironment.editor.rootElement);
    //             // add the name to the navigator
    //             this.editorArea.navigator._allUnits.push({
    //                 unitName: newDocumentName,
    //                 modelName: this.currentModel.name,
    //                 language: editorEnvironment.languageName
    //             });
    //             // remember the new name
    //             this.currentUnit.name = newDocumentName;
    //         } else {
    //             console.log("No current model unit");
    //         }
    //     }
    // }

    getModelUnitTypes(): string[] {
        return editorEnvironment.unitNames;
    }
    // END OF: for the communication with the navigator

    // for the communication with the error list:
    errorSelected(error: PiError) {
        console.log("Error selected: '" + error.message + "', location:  '" + error.reportedOn + "'");
        if (Array.isArray(error.reportedOn)) {
            editorEnvironment.editor.selectElement(error.reportedOn[0]);
        } else {
            editorEnvironment.editor.selectElement(error.reportedOn);
        }
    }

    getErrors() {
        if (!!this.currentUnit) {
            console.log("EditorCommunication.getErrors() for " + this.currentUnit.name);
            this.editorArea.errorlist.allItems = editorEnvironment.validator.validate(this.currentUnit);
        }
    }
    // END OF: for the communication with the error list

    getProjectionNames(): string[] {
        const proj = editorEnvironment.editor.projection;
        return (proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name]);
    }

    setProjection(name: string): void {
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectiontoFront(name);
        }
    }

    redo() {
        // TODO implement redo()
        return undefined;
    }

    undo() {
        // TODO implement undo()
        return undefined;
    }
}

