// This file contains all methods to connect the webapp to the Freon generated language editorEnvironment and to the server that stores the models
import {
    FreError,
    FreErrorSeverity,
    FreLogger,
    FreOwnerDescriptor,
    SeverityType
} from "@freon4dsl/core";
import type {
    FreNode,
    FreModel,
    FreModelUnit,
    FreNamedNode
} from "@freon4dsl/core";
import { get } from "svelte/store";
import {
    currentModelName,
    currentUnitName,
    editorProgressShown,
    noUnitAvailable,
    units,
    unitNames
} from "../components/stores/ModelStore";
import { setUserMessage  } from "../components/stores/UserMessageStore";
import { editorEnvironment, serverCommunication } from "../config/WebappConfiguration";
import { modelErrors } from "../components/stores/InfoPanelStore";
import { ServerCommunication } from "../server/ServerCommunication";
import { runInAction } from "mobx";

const LOGGER = new FreLogger("EditorState"); // .mute();

export class EditorState {
    private static instance: EditorState = null;

    static getInstance(): EditorState {
        if (EditorState.instance === null) {
            EditorState.instance = new EditorState();
        }
        return EditorState.instance;
    }

    currentUnit: FreModelUnit = null;
    currentModel: FreModel = null;
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
        LOGGER.log("EditorState.openmodel(" + modelName + ")");
        editorProgressShown.set(true);
        this.resetGlobalVariables();

        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // create new model instance in memory and set its name
        this.currentModel = editorEnvironment.newModel(modelName);
        currentModelName.set(modelName);
        // fill the new model with the units loaded from the server
        serverCommunication.loadUnitList(modelName, (localUnitNames: string[]) => {
            unitNames.set(localUnitNames);
            if (localUnitNames && localUnitNames.length > 0) {
                // load the first unit completely and show it
                // load all others units as interfaces
                let first: boolean = true;
                for (const unitName of localUnitNames) {
                    if (first) {
                        serverCommunication.loadModelUnit(modelName, unitName, (unit: FreModelUnit) => {
                            this.currentModel.addUnit(unit);
                            this.currentUnit = unit;
                            currentUnitName.set(this.currentUnit.name);
                            EditorState.getInstance().showUnitAndErrors(this.currentUnit);
                        });
                        first = false;
                    } else {
                        serverCommunication.loadModelUnitInterface(modelName, unitName, (unit: FreModelUnit) => {
                            this.currentModel.addUnit(unit);
                            this.setUnitLists();
                        });
                    }
                }
            } else {
                editorProgressShown.set(false);
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
                (oldUnitInterface: FreModelUnit) => {
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
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: " + newName);
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
        LOGGER.log("EditorState.saveCurrentUnit: " + get(currentUnitName));
        const unit: FreNamedNode = editorEnvironment.editor.rootElement as FreNamedNode;
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

    async renameModelUnit(unit: FreModelUnit, newName: string) {
        console.log("Units before: " + this.currentModel.getUnits().map(u => u.name));
        const oldName: string = unit.name;
        // if (unit === this.currentUnit) {
        //     await this.saveCurrentUnit();
        // }
        unit.name = newName;
        ServerCommunication.getInstance().renameModelUnit(this.currentModel.name, oldName, newName, unit);
        this.setUnitLists();
        console.log("Units after: " + this.currentModel.getUnits().map(u => u.name));
    }

    /**
     * Deletes the unit 'unit', from the server and from the current in-memory model
     * @param unit
     */
    async deleteModelUnit(unit: FreModelUnit) {
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
        currentUnitName.set("");
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
        const unitsInModel = this.currentModel.getUnits();
        unitNames.set(unitsInModel.map(u => u.name));
        units.set(unitsInModel);
    }

    /**
     * Reads the unit called 'newUnit' from the server and shows it in the editor
     * @param newUnit
     */
    async openModelUnit(newUnit: FreModelUnit) {
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name);
        // TODO currentUnitName is not updated properly
        if (!!this.currentUnit && newUnit.name === this.currentUnit.name) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING");
            return;
        }
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // newUnit is stored in the in-memory model as an interface only
        // we must get the full unit from the server and make a swap
        await serverCommunication.loadModelUnit(this.currentModel.name, newUnit.name, (newCompleteUnit: FreModelUnit) => {
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
    private swapInterfaceAndUnits(newCompleteUnit: FreModelUnit, newUnitInterface: FreModelUnit) {
        LOGGER.log("swapInterfaceAndUnits called");
        if (!!EditorState.getInstance().currentUnit) {
            // get the interface of the current unit from the server
            serverCommunication.loadModelUnitInterface(
                EditorState.getInstance().currentModel.name,
                EditorState.getInstance().currentUnit.name,
                (oldUnitInterface: FreModelUnit) => {
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
    unitFromFile(fileName: string, content: string, metaType: string, showIt: boolean) {
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        let unit: FreModelUnit = null;
        try {
            // the following also adds the new unit to the model
            unit = editorEnvironment.reader.readFromString(content, metaType, this.currentModel, fileName) as FreModelUnit;
            if (!!unit) {
                // if the element does not yet have a name, try to use the file name
                if (!unit.name || unit.name.length === 0) {
                    unit.name = this.makeUnitName(fileName);
                }
                if (showIt) {
                    // set elem in editor
                    this.showUnitAndErrors(unit);
                }
                serverCommunication.putModelUnit(this.currentModel.name, unit.name, unit);
            }
        } catch (e) {
            setUserMessage(e.message, SeverityType.error);
        }
        // if (elem) {
        // TODO find way to get interface without use of the server, because of concurrency error
        // swap old unit with its interface in the in-memory model
        // serverCommunication.loadModelUnitInterface(
        //     EditorState.getInstance().currentModel.name,
        //     EditorState.getInstance().currentUnit.name,
        //     (oldUnitInterface: FreNamedNode) => {
        //         if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
        //             // swap old unit with its interface in the in-memory model
        //             EditorState.getInstance().currentModel.replaceUnit(EditorState.getInstance().currentUnit, oldUnitInterface);
        //         }
        //     });

        // add the new unit to the current model
        // this.currentModel.addUnit(elem);
        // }
    }

    private makeUnitName(fileName: string): string {
        const nameExist: boolean = !!this.currentModel.getUnits().find(existing => existing.name === fileName);
        if (nameExist) {
            setUserMessage(`Unit named '${fileName}' already exists, adding number.`, SeverityType.error);
            // find the existing names that start with the file name
            const unitsWithSimiliarName = this.currentModel.getUnits().filter(existing => existing.name.startsWith(fileName));
            if (unitsWithSimiliarName.length > 1) { // there are already numbered units
                // find the biggest number that is in use after the filename, e.g. Home12, Home3 => 12
                let biggestNr: number = 1;
                // find the characters in each of the existing names that come after the file name
                const trailingParts: string[] = unitsWithSimiliarName.map(existing => existing.name.slice(fileName.length));
                trailingParts.forEach(trailing => {
                    const nextNumber: number = Number.parseInt(trailing);
                    if (!isNaN(nextNumber) && nextNumber >= biggestNr) {
                        biggestNr = nextNumber + 1;
                    }
                });
                return fileName + biggestNr;
            } else {
                return fileName + "1";
            }
        } else {
            return fileName;
        }
    }

    /**
     * This function takes care of actually showing the new unit in the editor
     * and getting the validation errors, if any, and show them in the error list.
     * @param newUnit
     * @private
     */
    private showUnitAndErrors(newUnit: FreModelUnit) {
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
    selectElement(item: FreNode, propertyName?: string) {
        LOGGER.log("Item selected");
        editorEnvironment.editor.selectElement(item, propertyName);
    }

    /**
     * Runs the validator for the current unit
     */
    getErrors() {
        LOGGER.log("EditorState.getErrors() for " + this.currentUnit.name);
        if (!!this.currentUnit) {
            try {
                const list = editorEnvironment.validator.validate(this.currentUnit);
                modelErrors.set(list);
            } catch (e) { // catch any errors regarding erroneously stored model units
                LOGGER.log(e.message);
                modelErrors.set([new FreError("Problem reading model unit: '" + e.message + "'", this.currentUnit, this.currentUnit.name, FreErrorSeverity.Error)]);
            }
        }
    }

    deleteElement(tobeDeleted: FreNode) {
        if (!!tobeDeleted) {
            // find the owner of the element to be deleted and remove the element there
            const owner: FreNode = tobeDeleted.freOwner();
            const desc: FreOwnerDescriptor = tobeDeleted.freOwnerDescriptor();
            if (!!desc) {
                // console.log("deleting " + desc.propertyName + "[" + desc.propertyIndex + "]");
                if (desc.propertyIndex !== null && desc.propertyIndex !== undefined && desc.propertyIndex >= 0) {
                    const propList = owner[desc.propertyName];
                    if (Array.isArray(propList) && propList.length > desc.propertyIndex) {
                        runInAction(() =>
                            propList.splice(desc.propertyIndex, 1)
                        );
                    }
                } else {
                    runInAction(() =>
                        owner[desc.propertyName] = null
                    );
                }
            } else {
                console.error("deleting of " + tobeDeleted.freId() + " not succeeded, because owner descriptor is empty.");
            }
        }
    }

    pasteInElement(element: FreNode, propertyName: string, index?: number) {
        const property = element[propertyName];
        // todo make new copy to keep in 'editorEnvironment.editor.copiedElement'
        if (Array.isArray(property)) {
            // console.log('List before: [' + property.map(x => x.freId()).join(', ') + ']');
            runInAction(() => {
                    if (index !== null && index !== undefined && index > 0) {
                        property.splice(index, 0, editorEnvironment.editor.copiedElement);
                    } else {
                        property.push(editorEnvironment.editor.copiedElement);
                    }
                }
            );
            // console.log('List after: [' + property.map(x => x.freId()).join(', ') + ']');
        } else {
            // console.log('property ' + propertyName + ' is no list');
            runInAction(() =>
                element[propertyName] = editorEnvironment.editor.copiedElement
            );
        }
    }
}
