// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import {
    PiError,
    PiErrorSeverity,
    PiLogger
} from "@projectit/core";
import type {
    PiElement,
    PiModel,
    PiModelUnit,
    PiNamedElement
} from "@projectit/core";
import { get } from "svelte/store";
import {
    currentModelName,
    currentUnitName,
    noUnitAvailable,
    units,
    editorProgressShown, unitNames
} from "../components/stores/ModelStore";
import { setUserMessage, SeverityType } from "../components/stores/UserMessageStore";
import { editorEnvironment, serverCommunication } from "../config/WebappConfiguration";
import {
    modelErrors,
} from "../components/stores/InfoPanelStore";

const LOGGER = new PiLogger("EditorCommunication"); // .mute();

export class EditorState {
    private static instance: EditorState = null;
    static getInstance(): EditorState {
        if (EditorState.instance === null) {
            EditorState.instance = new EditorState();
        }
        return EditorState.instance;
    }

    currentUnit: PiModelUnit = null;
    currentModel: PiModel = null;
    hasChanges: boolean = false; // TODO get the value from the editor

    /**
     * Creates a new model
     * @param modelName
     */
    newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        editorProgressShown.set(true);
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        // reset all visible information on the model and unit
        this.resetGlobalVariables();
        // create a new model
        this.currentModel = editorEnvironment.newModel(modelName);
        currentModelName.set(this.currentModel.name);
        editorProgressShown.set(false);
    }

    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * @param modelName
     */
    async openModel(modelName: string) {
        LOGGER.log("EditorCommunication.openmodel(" + modelName + ")");
        editorProgressShown.set(true);
        this.resetGlobalVariables();

        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // create new model instance in memory and set its name
        this.currentModel = editorEnvironment.newModel(modelName);
        currentModelName.set(modelName);
        // fill the new model with the units loaded from the server
        serverCommunication.loadUnitList(modelName, (localUnitNames: string[]) => {
            // console.log(`callback unitNames: ${unitNames}`);
            unitNames.set(localUnitNames);
            if (localUnitNames && localUnitNames.length > 0) {
                // load the first unit completely and show it
                // load all others units as interfaces
                let first: boolean = true;
                for (const unitName of localUnitNames) {
                    if (first) {
                        serverCommunication.loadModelUnit( modelName, unitName, (unit: PiModelUnit) => {
                            this.currentModel.addUnit(unit);
                            this.currentUnit = unit;
                            currentUnitName.set(this.currentUnit.name);
                            EditorState.getInstance().showUnitAndErrors(this.currentUnit);
                        });
                        first = false;
                    } else {
                        serverCommunication.loadModelUnitInterface(modelName, unitName, (unit: PiModelUnit) => {
                            this.currentModel.addUnit(unit);
                            this.setUnitLists();
                        });
                    }
                }
            }
        });
    }

    /**
     * When another model is shown in the editor this function is called.
     * It resets a series of global variables.
     * @private
     */
    private resetGlobalVariables() {
        noUnitAvailable.set(true);
        units.set([]);
        modelErrors.set([]);
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    async newUnit(newName: string, unitType: string) {
        LOGGER.log("EditorCommuncation.newUnit: unitType: " + unitType + ", name: " + newName);
        editorProgressShown.set(true);

        // save the old current unit, if there is one
        await this.saveCurrentUnit();

        // replace the current unit by its interface
        // and create a new unit named 'newName'
        const oldName: string = get(currentUnitName);
        if (!!oldName && oldName !== "") {
            // get the interface of the current unit from the server
            serverCommunication.loadModelUnitInterface(
                get(currentModelName),
                get(currentUnitName),
                (oldUnitInterface: PiModelUnit) => {
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        EditorState.getInstance().currentModel.replaceUnit(EditorState.getInstance().currentUnit, oldUnitInterface);
                    }
                    this.createNewUnit(newName, unitType);
                });
        } else {
            this.createNewUnit(newName, unitType);
        }
    }

    /**
     * Because of the asynchronicity the true work of creating a new unit is done by this function
     * which is called at various points in the code.
     * @param newName
     * @param unitType
     * @private
     */
    private createNewUnit(newName: string, unitType: string) {
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: "+ newName);
        // create a new unit and add it to the current model
        const newUnit = EditorState.getInstance().currentModel.newUnit(unitType);
        if (!!newUnit) {
            newUnit.name = newName;
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            setUserMessage(`Model unit of type '${unitType}' could not be created.`);
        }
    }

    /**
     * Pushes the current unit to the server
     */
    async saveCurrentUnit() {
        LOGGER.log("EditorCommunication.saveCurrentUnit: " + get(currentUnitName));
        const unit: PiNamedElement = editorEnvironment.editor.rootElement as PiNamedElement;
        if (!!unit) {
            if (!!this.currentModel?.name && this.currentModel?.name.length) {
                if (!!unit.name && unit.name.length > 0) {
                    await serverCommunication.putModelUnit(this.currentModel.name, unit.name, unit);
                    currentUnitName.set(unit.name); //just in case the user has changed the name in the editor
                    EditorState.getInstance().setUnitLists();
                    this.hasChanges = false;
                } else {
                    setUserMessage(`Unit without name cannot be saved. Please, name it and try again.`);
                }
            } else {
                LOGGER.log("Internal error: cannot save unit because current model is unknown.");
            }
        } else {
            LOGGER.log("No current model unit");
        }
    }

    /**
     * Deletes the unit 'unit', from the server and from the current in-memory model
     * @param unit
     */
    async deleteModelUnit(unit: PiModelUnit) {
        LOGGER.log("delete called for unit: " + unit.name);

        // get rid of the unit on the server
        await serverCommunication.deleteModelUnit(get(currentModelName), unit.name);
        // get rid of old model unit from memory
        this.currentModel.removeUnit(unit);
        // if the unit is shown in the editor, get rid of that one, as well
        if (this.currentUnit === unit) {
            editorEnvironment.editor.rootElement = null;
            noUnitAvailable.set(true);
            modelErrors.set([]);
        }
        // get rid of the name in the navigator
        currentUnitName.set('');
        this.setUnitLists();
    }

    /**
     * Whenever there is a change in the units of the current model,
     * this function is called. It sets the store varible 'units' to the
     * right value.
     * @private
     */
    private setUnitLists() {
        LOGGER.log("setUnitLists");
        units.set(this.currentModel.getUnits());
    }

    /**
     * Reads the unit called 'newUnit' from the server and shows it in the editor
     * @param newUnit
     */
    async openModelUnit(newUnit: PiModelUnit) {
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name);
        // TODO currentUnitName is not updated properly
        if (!!this.currentUnit && newUnit.name === this.currentUnit.name ) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING");
            return;
        }
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // newUnit is stored in the in-memory model as an interface only
        // we must get the full unit from the server and make a swap
        await serverCommunication.loadModelUnit(this.currentModel.name, newUnit.name, (newCompleteUnit: PiModelUnit) => {
            this.swapInterfaceAndUnits(newCompleteUnit, newUnit);
        });
    }

    /**
     * Swaps 'newUnitInterface', which is part of the in-memory current model, for the complete unit 'newCompleteUnit'.
     * Next, the current -complete- unit is swapped with its interface from the server.
     * This makes sure that the state of in-memory model is such that only the unit that is shown in the editor
     * is fully present, all other units are interfaces only.
     * @param newCompleteUnit
     * @param newUnitInterface
     * @private
     */
    private swapInterfaceAndUnits(newCompleteUnit: PiModelUnit, newUnitInterface: PiModelUnit) {
        if (!!EditorState.getInstance().currentUnit) {
            // get the interface of the current unit from the server
            serverCommunication.loadModelUnitInterface(
                EditorState.getInstance().currentModel.name,
                EditorState.getInstance().currentUnit.name,
                (oldUnitInterface: PiModelUnit) => {
                    if (!!newCompleteUnit) { // the new unit which has been retrieved from the server
                        if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
                            // swap old unit with its interface in the in-memory model
                            EditorState.getInstance().currentModel.replaceUnit(EditorState.getInstance().currentUnit, oldUnitInterface);
                        }
                        // swap the new unit interface with the full unit in the in-memory model
                        EditorState.getInstance().currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
                        // show the new unit in the editor
                        this.showUnitAndErrors(newCompleteUnit);
                    }
                });
        } else {
            // swap the new unit interface with the full unit in the in-memory model
            EditorState.getInstance().currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
            // show the new unit in the editor
            this.showUnitAndErrors(newCompleteUnit);
        }
    }

    /**
     * Parses the string 'content' to create a model unit. If the parsing is ok,
     * then the unit is added to the current model.
     * @param content
     * @param metaType
     */
    unitFromFile(fileName: string, content: string, metaType: string) {
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        let unit: PiModelUnit = null;
        try {
            // the following also adds the new unit to the model
            unit = editorEnvironment.reader.readFromString(content, metaType, this.currentModel) as PiModelUnit;
            if (!!unit) {
                // if the element does not yet have a name use the file name
                if (!unit.name || unit.name.length === 0) {
                    unit.name = fileName;
                }
                // set elem in editor
                this.showUnitAndErrors(unit);
            }
        } catch (e) {
            setUserMessage(e.message, SeverityType.error);
        }
        // if (elem) {
        //     if (this.currentModel.getUnits().filter(unit => unit.name === elem.name).length > 0) {
        //         setUserMessage(`Unit named '${elem.name}' already exists.`, severityType.error);
        //         return;
        //     }

            // TODO find way to get interface without use of the server, because of concurrency error
            // swap old unit with its interface in the in-memory model
            // serverCommunication.loadModelUnitInterface(
            //     EditorCommunication.getInstance().currentModel.name,
            //     EditorCommunication.getInstance().currentUnit.name,
            //     (oldUnitInterface: PiNamedElement) => {
            //         if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
            //             // swap old unit with its interface in the in-memory model
            //             EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
            //         }
            //     });

            // add the new unit to the current model
            // this.currentModel.addUnit(elem);

        // }

    }

    /**
     * This function takes care of actually showing the new unit in the editor
     * and getting the validation errors, if any, and show them in the error list.
     * @param newUnit
     * @private
     */
    private showUnitAndErrors(newUnit: PiModelUnit) {
        LOGGER.log("showUnitAndErrors called, unitName: " + newUnit.name);
        if (!!newUnit) {
            noUnitAvailable.set(false);
            editorEnvironment.editor.rootElement = newUnit;
            this.currentUnit = newUnit;
            currentUnitName.set(newUnit.name);
            this.setUnitLists();
            this.hasChanges = true;
            this.getErrors();
        } else {
            noUnitAvailable.set(true);
            editorEnvironment.editor.rootElement = null;
            this.currentUnit = null;
            currentUnitName.set("<noUnit>");
            this.setUnitLists();
            this.hasChanges = false;
        }
        editorProgressShown.set(false);
    }

    /**
     * When an error in the errorlist is selected, or a search result is selected, the editor jumps to the faulty element.
     * @param item
     */
    selectElement(item: PiElement) {
        LOGGER.log("Item selected");
        editorEnvironment.editor.selectElement(item);
    }

    /**
     * Runs the validator for the current unit
     */
    getErrors() {
        LOGGER.log("EditorCommunication.getErrors() for " + this.currentUnit.name);
        if (!!this.currentUnit) {
            try {
                const list = editorEnvironment.validator.validate(this.currentUnit);
                modelErrors.set(list);
            } catch (e) { // catch any errors regarding erroneously stored model units
                LOGGER.log(e.message);
                modelErrors.set([new PiError("Problem reading model unit: '" + e.message + "'", this.currentUnit, this.currentUnit.name, PiErrorSeverity.Error)]);
            }
        }
    }
}
