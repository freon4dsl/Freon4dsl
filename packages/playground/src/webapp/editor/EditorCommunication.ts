// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiNamedElement, PiModel } from "@projectit/core";
import { PiLogger } from "@projectit/core";
import { ServerCommunication } from "../server/ServerCommunication";
import { currentModelName, currentUnitName, unitTypes } from "../menu-ts-files/WebappStore";
import { get } from "svelte/store";
import { editorEnvironment } from "webapp/WebappConfiguration";

const LOGGER = new PiLogger("EditorCommunication"); //.mute();

export const unnamed: string = "<unnamed>";

export class EditorCommunication {
    currentUnit: PiNamedElement = null;
    currentModel: PiModel = null;
    hasChanges: boolean = false; // TODO get the value from the editor
    // editorArea: EditorArea;
    private static instance: EditorCommunication = null;
    
    static getInstance(): EditorCommunication {
        if( EditorCommunication.instance === null){
            EditorCommunication.instance = new EditorCommunication();
        }
        return EditorCommunication.instance;
    }

    /**
     * fills the WebappStore with initial values
     */
    static initialize(): void {
        currentModelName.set(unnamed);
        currentUnitName.set(unnamed);
        // unitTypes are the same for every model in the language
        unitTypes.set(editorEnvironment.unitNames);
    }

    // called from the editor area
    // getEditor(): ProjectionalEditor {
    //     const currentUnit = editorEnvironment.editor.rootElement;
    //     if (!!currentUnit) {
    //         return editorEnvironment.projectionalEditorComponent;
    //     } else {
    //         return null;
    //     }
    // }

    // used from the menubar and as initialization
    newModel(newName: string) {
        LOGGER.log("new model called: " + newName);
        this.currentModel = editorEnvironment.newModel(newName);
        this.currentUnit = this.currentModel.getUnits()[0];
        currentModelName.set(newName);
        if ( !!this.currentUnit && !!this.currentUnit.name) {
            currentUnitName.set(this.currentUnit.name);
        } else {
            currentUnitName.set("unnamed");
        }
        this.hasChanges = false;
        this.showUnitAndErrors(this.currentUnit);
    }

    newUnit(newName: string, unitType: string) {
        LOGGER.log("new unit called, unitType: " + unitType + ", name: " + newName);
        console.log("new unit called, unitType: " + unitType + ", name: " + newName);
        // replace the current unit by its interface
        // and create a new unit named 'newName'

        const oldName : string = get(currentUnitName);
        if (!!oldName && oldName !== "" && oldName !== "<unnamed>") {
            // get the interface of the current unit from the server
            ServerCommunication.getInstance().loadModelUnitInterface(
                get(currentModelName),
                get(currentUnitName),
                (oldUnitInterface: PiNamedElement) => {
                    console.log("loadCallback")
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                    }
                    this.createNewUnit(newName, unitType);
                });
        } else {
            console.log("GOING TO ELSE");
            this.createNewUnit(newName, unitType);
        }
    }

    private createNewUnit(newName: string, unitType: string) {
        console.log("private createNewUnit called, unitType: " + unitType);
        // create a new unit and add it to the current model
        let newUnit = EditorCommunication.getInstance().currentModel.newUnit(unitType);
        // TODO check whether the next statement is valid in all cases: units should have a name attribute called 'name'
        newUnit.name = newName;
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            // TODO error message
            console.log(`Model unit of type '${unitType}' could not be created.`);
            // PiToolbar.instance.alertContent = `Model unit of type '${unitType}' could not be created.`;
            // PiToolbar.instance.alertIsVisible = true;
        }
        currentUnitName.set(newName);
    }

    saveCurrentUnit() {
        LOGGER.log("save current unit called");
        console.log("EditorCommunication.saveCurrentUnit: " + get(currentUnitName));
        ServerCommunication.getInstance().putModelUnit({
                    unitName: get(currentUnitName),
                    modelName: get(currentModelName),
                    language: "languageName",
                }, null);
                this.hasChanges = false;
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().putModelUnit({
                unitName: this.currentUnit.name,
                modelName: this.currentModel.name,
                language: editorEnvironment.languageName
            }, editorEnvironment.editor.rootElement as PiNamedElement);
            this.hasChanges = false;
        } else {
            LOGGER.log("No current model unit");
        }
    }

    deleteCurrentUnit() {
        LOGGER.log("delete called, current unit: CCCC" + get(currentUnitName));

        ServerCommunication.getInstance().deleteModelUnit({
            unitName: get(currentUnitName),
            modelName: get(currentModelName),
            language: "languageName",
        });
        this.hasChanges = false;
        currentUnitName.set(unnamed);
        if (!!editorEnvironment.editor.rootElement) {
            ServerCommunication.getInstance().deleteModelUnit({language: editorEnvironment.languageName, unitName: this.currentUnit.name, modelName: this.currentModel.name});
            // get rid of old model unit from memory
            this.currentModel.removeUnit(this.currentUnit);
            // show nothing in the editor and error list
            this.showUnitAndErrors(null);
        } else {
            LOGGER.log("No current model unit");
        }
    }

    async openModel(modelName: string) {
        LOGGER.log("openModel called, modelName: " + modelName);
        console.log("EditorCommunication.openmodel("+ modelName + ")");
        // TODO this method should take care of storing any changes in the previous model
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
        currentModelName.set(modelName);
    }

    async openModelUnit(newUnitName: string) {
        LOGGER.log("openModelUnit called, unitName: " + newUnitName);
        console.log("openModelUnit called, unitName: " + newUnitName);
        if (!!this.currentUnit && newUnitName == this.currentUnit.name ) {
            LOGGER.log("openModelUnit doing NOTHING");
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
        currentUnitName.set(newUnitName);
    }

    private showUnitAndErrors(newUnit: PiNamedElement) {
        console.log("showUnitAndErrors called, unitName: " + newUnit.name);
        editorEnvironment.editor.rootElement = newUnit;
        EditorCommunication.getInstance().currentUnit = newUnit;
        if (!!newUnit) {
            EditorCommunication.getInstance().hasChanges = true;
            EditorCommunication.getInstance().getErrors();
        } else {
            EditorCommunication.getInstance().hasChanges = false;
            // this.editorArea.errorlist.allItems = [];
        }
    }

    // END OF: for the communication with the navigator

    // for the communication with the error list:
    // errorSelected(error: PiError) {
    //     LOGGER.log("Error selected: '" + error.message + "', location:  '" + error.reportedOn + "'");
    //     if (Array.isArray(error.reportedOn)) {
    //         editorEnvironment.editor.selectElement(error.reportedOn[0]);
    //     } else {
    //         editorEnvironment.editor.selectElement(error.reportedOn);
    //     }
    // }

    getErrors() {
        // if (!!this.currentUnit) {
        //     LOGGER.log("EditorCommunication.getErrors() for " + this.currentUnit.name);
        //     this.editorArea.errorlist.allItems = editorEnvironment.validator.validate(this.currentUnit);
        // }
    }
    // END OF: for the communication with the error list

    getProjectionNames(): string[] {
        // const proj = editorEnvironment.editor.projection;
        // return (proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name]);
        return [ "default", "projectionA", "projectionB"];
    }

    setProjection(name: string): void {
        LOGGER.log("setting Projection " + name);
        // const proj = editorEnvironment.editor.projection;
        // if (proj instanceof PiCompositeProjection) {
        //     proj.projectiontoFront(name);
        // }
    }

    unsetProjection(name: string): void {
        LOGGER.log("unsetting Projection " + name);
        // const proj = editorEnvironment.editor.projection;
        // if (proj instanceof PiCompositeProjection) {
        //     proj.projectiontoFront(name);
        // }
    }

    redo() {
        // TODO implement redo()
        LOGGER.log("redo called");
        return undefined;
    }

    undo() {
        // TODO implement undo()
        LOGGER.log("undo called");
        return undefined;
    }

    replace() {
        // TODO implement replace()
        LOGGER.log("replace called");
        return undefined;
    }

    findText() {
        // TODO implement replace()
        LOGGER.log("findText called");
        return undefined;
    }

    findElement() {
        // TODO implement replace()
        LOGGER.log("findElement called");
        return undefined;
    }

}

