// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiNamedElement, PiModel, PiLogger, PiCompositeProjection, PiError, PiElement } from "@projectit/core";
import { ServerCommunication } from "../server/ServerCommunication";
import { get } from "svelte/store";
import {
    currentModelName,
    currentUnitName,
    errorMessage,
    fileExtensions,
    languageName,
    severity,
    severityType,
    showError,
    unitTypes
} from "../WebappStore";
import { modelErrors } from "../main-ts-files/ModelErrorsStore";
import { editorEnvironment } from "../WebappConfiguration";

const LOGGER = new PiLogger("EditorCommunication"); //.mute();

export class EditorCommunication {
    currentUnit: PiNamedElement = null;
    currentModel: PiModel = null;
    hasChanges: boolean = false; // TODO get the value from the editor
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
        // currentModelName.set(unnamed);
        // currentUnitName.set(unnamed);
        languageName.set(editorEnvironment.languageName);
        // unitTypes are the same for every model in the language
        unitTypes.set(editorEnvironment.unitNames);
        let tmp: string[] = [];
        for (const val of editorEnvironment.fileExtensions.values()){
            tmp.push(val);
        }
        fileExtensions.set(tmp);
    }

    /* returns true if the model has a name,
     * as side effect a check is done whether currentModelName is equal to that name.
        */
    isModelNamed(): boolean {
        LOGGER.log("EditorCommunication.isModelNamed: " + get(currentModelName));
        this.checkGlobalsAgainstEditor();
        const name = this.currentModel.name;
        if (!name || name.length <= 0) {
            return false;
        }
        currentModelName.set(name);
        return true;
    }

    setModelName(name: string) {
        this.checkGlobalsAgainstEditor();
        this.currentModel = this.currentUnit.piContainer().container as PiModel;
        this.currentModel.name = name;
        currentModelName.set(this.currentModel.name);
    }

    setUnitName(name: string) {
        this.checkGlobalsAgainstEditor();
        this.currentUnit.name = name;
        currentUnitName.set(name);
        // TODO set name in editor as well
        // const inEditor = editorEnvironment.editor.rootElement;
        // (inEditor as PiNamedElement).name = name;
    }

    private checkGlobalsAgainstEditor() {
        const inEditor = editorEnvironment.editor.rootElement;
        if (inEditor !== this.currentUnit) {
            LOGGER.log("ERROR: inEditor !== this.currentUnit");
            this.currentUnit = inEditor as PiNamedElement;
            currentUnitName.set(this.currentUnit.name);
            this.currentModel = this.currentUnit.piContainer().container as PiModel;
            currentModelName.set(this.currentModel.name);
        }
    }

    /* returns true if the unit has a name,
     * as side effect a check is done whether currentUnitName is equal to that name.
     */
    isUnitNamed(): boolean {
        LOGGER.log("EditorCommunication.isUnitNamed: " + get(currentUnitName));
        this.checkGlobalsAgainstEditor();
        const name = this.currentUnit.name;
        if (!name || name.length <= 0) {
            return false;
        }
        currentUnitName.set(name);
        return true;
    }

    // used from the menubar and as initialization
    newModel(modelName: string, unitName?: string) {
        LOGGER.log("new model called: " + modelName);
        if (!unitName) {
            // TODO show message in editor view
        } else {
            this.currentModel = editorEnvironment.newModel(modelName, unitName);
        }
        currentModelName.set(this.currentModel.name);
        this.currentUnit = this.findFirstUnit();
        currentUnitName.set(this.currentUnit.name);
        this.hasChanges = false;
        this.showUnitAndErrors(this.currentUnit);
    }

    newUnit(newName: string, unitType: string) {
        LOGGER.log("new unit called, unitType: " + unitType + ", name: " + newName);
        // replace the current unit by its interface
        // and create a new unit named 'newName'

        const oldName : string = get(currentUnitName);
        if (!!oldName && oldName !== "") {
            // get the interface of the current unit from the server
            ServerCommunication.getInstance().loadModelUnitInterface(
                get(currentModelName),
                get(currentUnitName),
                (oldUnitInterface: PiNamedElement) => {
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                    }
                    this.createNewUnit(newName, unitType);
                });
        } else {
            this.createNewUnit(newName, unitType);
        }
    }

    private createNewUnit(newName: string, unitType: string) {
        LOGGER.log("private createNewUnit called, unitType: " + unitType);
        // create a new unit and add it to the current model
        let newUnit = EditorCommunication.getInstance().currentModel.newUnit(unitType);
        // TODO check whether the next statement is valid in all cases: units should have a name attribute called 'name'
        newUnit.name = newName;
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            errorMessage.set(`Model unit of type '${unitType}' could not be created.`);
            severity.set(severityType.error);
            showError.set(true);
        }
        currentUnitName.set(newName);
    }

    saveCurrentUnit() {
        LOGGER.log("save current unit called");
        LOGGER.log("EditorCommunication.saveCurrentUnit: " + get(currentUnitName));
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
        LOGGER.log("delete called, current unit: " + get(currentUnitName));
        this.hasChanges = false;
        if (!!editorEnvironment.editor.rootElement ) {
            ServerCommunication.getInstance().deleteModelUnit({
                unitName: get(currentUnitName),
                modelName: get(currentModelName),
                language: "languageName",
            });
            // get rid of old model unit from memory
            this.currentModel.removeUnit(this.currentUnit);
            // find a new unit to show
            let newUnit = this.findFirstUnit();
            // show new unit in the editor and error list
            this.showUnitAndErrors(newUnit);
        } else {
            LOGGER.log("No current model unit");
        }
    }

    private findFirstUnit()  {
        let newUnit = this.currentModel.getUnits()[0];
        // if (!newUnit) {
        //     this.currentModel.newUnit(get(unitTypes)[0]);
        //     newUnit = this.currentModel.getUnits()[0];
        //     newUnit.name = unnamed;
        // }
        return newUnit;
    }

    async openModel(modelName: string) {
        LOGGER.log("EditorCommunication.openmodel("+ modelName + ")");
        // TODO this method should take care of storing any changes in the previous model
        // create new model instance in memory and set its name
        let model: PiModel = editorEnvironment.newModel(modelName);
        this.currentModel = model;
        currentModelName.set(modelName);
        // fill the new model with the units loaded from the server
        ServerCommunication.getInstance().loadUnitList(modelName, (unitNames: string[]) => {
            if (!unitNames || unitNames.length == 0) {
                // set the defaults, no units are stored for this model
                this.currentUnit = this.findFirstUnit();
                currentUnitName.set(this.currentUnit.name);
                EditorCommunication.getInstance().showUnitAndErrors(this.currentUnit);
            } else {
                // load the first unit completely and show it
                // load all others units as interfaces
                let first: boolean = true;
                for (const unitName of unitNames) {
                    if (first) {
                        ServerCommunication.getInstance().loadModelUnit( modelName, unitName, (unit: PiNamedElement) => {
                            model.addUnit(unit);
                            this.currentUnit = unit;
                            currentUnitName.set(this.currentUnit.name);
                            EditorCommunication.getInstance().showUnitAndErrors(this.currentUnit);
                        });
                        first = false;
                    } else {
                        ServerCommunication.getInstance().loadModelUnitInterface(modelName, unitName, (unit: PiNamedElement) => {
                            model.addUnit(unit);
                        });
                    }
                }
            }
        });
    }

    async openModelUnit(newUnitName: string) {
        LOGGER.log("openModelUnit called, unitName: " + newUnitName);
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
                        if (!!newUnit) { // the new unit has been retrieved from the server
                            if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
                                // swap old unit with its interface in the in-memory model
                                EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                            }
                            // swap the new unit interface with the full unit in the in-memory model
                            EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newUnit);
                            // show the new unit in the editor
                            this.showUnitAndErrors(newUnit);
                        }
                    });
            } else {
                // swap the new unit interface with the full unit in the in-memory model
                EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newUnit);
                // show the new unit in the editor
                this.showUnitAndErrors(newUnit);
            }
        });
    }

    unitFromFile(content: string, metaType: string) {
        let elem: PiElement = null;
        elem = editorEnvironment.reader.readFromString(content, metaType);
        if (elem && this.isModelNamed()) {
            console.log(`${(elem as PiNamedElement).name}`)
            // TODO save old currentUnit
            // TODO swap old unit with its interface in the in-memory model
            // set elem in editor
            this.showUnitAndErrors(elem as PiNamedElement);
        }
    }

    unitAsText() : string {
        return editorEnvironment.writer.writeToString(this.currentUnit, 0, false);
    }

    unitFileExtension() : string {
        const unitType = this.currentUnit.piLanguageConcept();
        return editorEnvironment.fileExtensions.get(unitType);
    }

    private showUnitAndErrors(newUnit: PiNamedElement) {
        LOGGER.log("showUnitAndErrors called, unitName: " + newUnit.name);
        editorEnvironment.editor.rootElement = newUnit;
        EditorCommunication.getInstance().currentUnit = newUnit;
        currentUnitName.set(newUnit.name);
        if (!!newUnit) {
            EditorCommunication.getInstance().hasChanges = true;
            EditorCommunication.getInstance().getErrors();
        } else {
            EditorCommunication.getInstance().hasChanges = false;
        }
    }

    // for the communication with the error list:
    errorSelected(error: PiError) {
        LOGGER.log("Error selected: '" + error.message + "', location:  '" + error.locationdescription + "'");
        // TODO test this when editor setFocus is fully implemented
        if (Array.isArray(error.reportedOn)) {
            editorEnvironment.editor.selectElement(error.reportedOn[0]);
        } else {
            editorEnvironment.editor.selectElement(error.reportedOn);
        }
    }

    getErrors() {
        LOGGER.log("EditorCommunication.getErrors() for " + this.currentUnit.name);
        if (!!this.currentUnit) {
            let list = editorEnvironment.validator.validate(this.currentUnit);
            modelErrors.set(list);
        }
    }
    // END OF: for the communication with the error list

    getProjectionNames(): string[] {
        const proj = editorEnvironment.editor.projection;
        let nameList: string[] = proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name];
        // make sure 'default' is always the first name in the list
        // to do this, first reverse the order of the names
        nameList = nameList.reverse();
        // next, check whether the first is 'default'
        if (nameList[0] !== 'default') {
            // find index
            let i = nameList.indexOf('default');
            // if already at start, nothing to do
            // else remove old occurrency, if existing
            if (i > 0) {
                nameList.splice( i, 1 );
            }
            // add 'default' as first
            nameList.unshift( 'default' );
        }
        return nameList;
    }

    setProjection(name: string): void {
        LOGGER.log("setting Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectiontoFront(name);
        }
    }

    unsetProjection(name: string): void {
        LOGGER.log("unsetting Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectionToBack(name);
        }
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

    validate() {
        // TODO implement validate()
        LOGGER.log("validate called");
        EditorCommunication.getInstance().getErrors();
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

