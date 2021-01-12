// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiElement, PiCompositeProjection, ProjectionalEditor, PiError, PiNamedElement, PiModel } from "@projectit/core";
import { editorEnvironment } from "../WebappConfiguration";
import { ServerCommunication } from "./ServerCommunication";
import { EditorArea } from "../projectit-webapp/EditorArea";
import * as React from "react";
import { PiToolbar } from "../projectit-webapp/PiToolbar";
import { IModelUnitData } from "./IServerCommunication";

// TODO make this a singleton, no static methods

export class EditorCommunication {
    static currentUnitName = '';
    static currentModelName = '';
    static hasChanges: boolean = true;
    static editorArea: EditorArea;

    // used from the editor area
    static getEditor(): ProjectionalEditor {
        const currentUnit = editorEnvironment.editor.rootElement;
        if (!!currentUnit) {
            this.currentUnitName = (currentUnit as PiNamedElement).name;
        }
        const model: PiElement = currentUnit.piContainer()?.container;
        if (!!model) { // should not be null or undefined
            // models should have a name property
            this.currentModelName = (model as PiNamedElement).name;
        }
        // console.log(`unit '${this.currentUnitName}' has model '${this.currentModelName}'`);
        return editorEnvironment.projectionalEditorComponent;
    }

    // used from the menubar
    static newModel() {
        console.log("EditorCommunication new model called");
        editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
        EditorCommunication.currentModelName = "";
        EditorCommunication.currentUnitName = "";
    }

    static newUnit(documentType: string) {
        console.log("EditorCommunication new document called, documentType: " + documentType);
        // add new model unit of right type to current model
        let unit = editorEnvironment.initializer.newUnit(editorEnvironment.editor.rootElement.piContainer().container, documentType);
        if (!!unit){
            editorEnvironment.editor.rootElement = unit;
            EditorCommunication.currentUnitName = (unit as PiNamedElement).name;    // this is save, because all units must have a name
        } else {
            // error message
            PiToolbar.instance.alertContent = `Document type '${documentType}' could not be created.`;
            PiToolbar.instance.alertIsVisible = true;
        }
    }

    static async open(modelName: string, documentName: string) {
        console.log("Open document '" + modelName + "/" + documentName + "'");
        const parentOfCurrentDocument = editorEnvironment.editor.rootElement.piContainer().container;
        let model: PiModel = (parentOfCurrentDocument.piIsModel() ? (parentOfCurrentDocument as PiModel) : null);
        if (!!model) { // else internal error
            let oldUnit = editorEnvironment.editor.rootElement;
            if (model.name === modelName && modelName === this.currentModelName) { // we are opening another unit of the same model
                console.log("opening another unit of the same model: " + model.name);
                await this.openUnitOfCurrentModel(model, documentName, oldUnit, modelName);
            } else {
                console.log(`opening a unit of a different model than the current`);
                await this.openUnitAndModel(modelName, documentName);
            }
        }
    }

    private static async openUnitAndModel(modelName: string, documentName: string) {
        // TODO remember old situation: make this atomic
        // create new model instance and set its name
        let model: PiModel = editorEnvironment.initializer.newModel(modelName);
        // create the requested unit
        await ServerCommunication.getInstance().loadModelUnit({
                language: editorEnvironment.languageName,
                unitName: documentName,
                model: modelName
            },
            async (unit: PiElement) => {
                console.log("loadModelUnitInEditor");
                let allright: boolean = true;
                if (!!unit) {
                    console.log(`adding the complete unit (${(unit as PiNamedElement).name}) `);
                    allright = model.addUnit(unit);

                    // create the other units as interfaces
                    await ServerCommunication.getInstance().getInterfacesForModel(editorEnvironment.languageName, modelName, (muInterface: PiElement) => {

                        if ((muInterface as PiNamedElement).name !== (unit as PiNamedElement).name) {
                            console.log(`adding unit interface ${(muInterface as PiNamedElement)?.name}`);
                            model.addUnit(muInterface);
                        }
                    });

                    // now set the editor to show the new unit and current names
                    console.log(`setting the editor to the new unit`);
                    editorEnvironment.editor.rootElement = unit;
                    EditorCommunication.currentUnitName = documentName;
                    EditorCommunication.currentModelName = modelName;
                    console.log("validating the new unit");
                    EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
                    // test
                    if (unit.piContainer()?.container !== model) {
                        console.log(`openUnitAndModel: ERROR the container of unit ${(unit as PiNamedElement).name} is not equal to the model ${model.name}`);
                    }
                    // end test
                } else {
                    // give error message to user
                    PiToolbar.instance.alertContent = `Document '${modelName}/${documentName}' could not be found on the server.`;
                    PiToolbar.instance.alertIsVisible = true;
                }
            });
    }

    private static async openUnitOfCurrentModel(model: PiModel, documentName: string, oldUnit: PiElement, modelName: string) {
        let allright: boolean = true;
        // make whole operation atomic, i.e. it can be reversed if anything in the process goes wrong
        // so remember both old unit and new unit interface
        let newUnitInterface = model.findUnit(documentName);

        // remove old unit and add old unit model unit interface, if present
        await ServerCommunication.getInstance().loadModelUnitInterface({
                language: editorEnvironment.languageName,
                unitName: this.currentUnitName,
                model: this.currentModelName
            },
            (oldUnitInterface: PiElement) => {
                if (!!oldUnitInterface) {
                    console.log(`we are replacing old unit (${(oldUnit as PiNamedElement).name}) by its interface (${(oldUnitInterface as PiNamedElement).name}) `);
                    allright = model.replaceUnit(oldUnit, oldUnitInterface);
                } else {
                    allright = false;
                    // give error message to user
                    PiToolbar.instance.alertContent = `Document interface for '${this.currentModelName}/${this.currentUnitName}' could not be found on the server.`;
                    PiToolbar.instance.alertIsVisible = true;
                }
            });
        // TODO allright will not be set correctly, it should be a param of loadCallback
        // remove model unit interface of new unit, if present, and add the new complete unit
        if (allright) { // only set the new unit if the replacement of the old one was executed correctly
            ServerCommunication.getInstance().loadModelUnit({
                    language: editorEnvironment.languageName,
                    unitName: documentName,
                    model: this.currentModelName
                },
                (newUnit: PiElement) => {
                    if (!!newUnit) {
                        let allright: boolean = true;
                        if (!!newUnitInterface) {
                            console.log(`XXX we are replacing new unit interface (${(newUnitInterface as PiNamedElement).name}) by the complete unit (${(newUnit as PiNamedElement).name}) `);
                            // TODO replace does not seem to work correctly
                            allright = model.replaceUnit(newUnitInterface, newUnit);
                        } else {
                            console.log(`Interface was not loaded before, so we are adding complete unit (${(newUnit as PiNamedElement).name}) `);
                            model.addUnit(newUnit);
                        }
                        if (allright) {
                            console.log(`we are setting the root element of the editor to the new complete unit (${(newUnit as PiNamedElement).name}) `);
                            // if everything goes well, show the new unit in the editor
                            editorEnvironment.editor.rootElement = newUnit;
                            EditorCommunication.editorArea.errorlist.allItems = editorEnvironment.validator.validate(editorEnvironment.editor.rootElement);
                            EditorCommunication.currentUnitName = documentName;
                            EditorCommunication.currentModelName = modelName;
                            // test
                            if (newUnit.piContainer()?.container !== model) {
                                console.log(`openUnitAndModel: ERROR the container of unit ${(newUnit as PiNamedElement).name} is not equal to the model ${model.name}`);
                            }
                            // end test
                        }
                    } else {
                        // give error message to user
                        PiToolbar.instance.alertContent = `Document '${this.currentModelName}/${documentName}' could not be found on the server.`;
                        PiToolbar.instance.alertIsVisible = true;
                    }
                });
        }
    }

// we assume that elsewhere (in Menubar) it is checked that both modelName and documentName are present
    static save() {
        console.log("EditorCommunication save called");
        if (!!editorEnvironment.editor.rootElement) {
            // save the document under the current name
            ServerCommunication.getInstance().putModelUnit({
                unitName: EditorCommunication.currentUnitName,
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
        if (newModelName !== EditorCommunication.currentModelName && newDocumentName !== EditorCommunication.currentUnitName) {
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
                EditorCommunication.currentUnitName = newDocumentName;
                EditorCommunication.currentModelName = (!!newModelName? newModelName : EditorCommunication.currentModelName);
            } else {
                console.log("NO rootElement in editor");
            }
        }
    }

    static deleteCurrentModel() {
        console.log("EditorCommunication delete called, current document: " + EditorCommunication.currentUnitName);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModelUnit({language: editorEnvironment.languageName, unitName: EditorCommunication.currentUnitName, model: EditorCommunication.currentModelName});
            editorEnvironment.editor.rootElement = editorEnvironment.initializer.initialize();
            EditorCommunication.editorArea.navigator.removeName(EditorCommunication.currentUnitName);
            EditorCommunication.currentUnitName = "";
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
