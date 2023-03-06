// This file contains all methods to connect the webapp to the Freon generated language editorEnvironment and to the server that stores the models
import type { FreModel, FreModelUnit, FreNamedNode, FreNode } from "@freon4dsl/core";
import { FreError, FreErrorSeverity, FreLogger, FreOwnerDescriptor } from "@freon4dsl/core";
import { runInAction } from "mobx";
import { get } from "svelte/store";
import { modelErrors } from "../components/stores/InfoPanelStore";
import {
    currentModelName,
    currentUnitName,
    editorProgressShown,
    noUnitAvailable,
    unitNames,
    units
} from "../components/stores/ModelStore";
import { modelNames } from "../components/stores/ServerStore";
import { setUserMessage } from "../components/stores/UserMessageStore";
import { editorEnvironment, serverCommunication } from "../config/WebappConfiguration";
import { ModelManager } from "../manage/ModelManager";
import { ServerCommunication } from "../server/ServerCommunication";

const LOGGER = new FreLogger("EditorState"); // .mute();

export class EditorState {
    private static instance: EditorState = null;

    static getInstance(): EditorState {
        if (EditorState.instance === null) {
            EditorState.instance = new EditorState();
        }
        return EditorState.instance;
    }

    private constructor() {
        ModelManager.setServerCommunication(serverCommunication);
        this.modelMgr.currentUnitChanged = this.currentUnitChanged;
        this.modelMgr.currentModelChanged = this.currentModelChanged;
        this.modelMgr.onError = this.onError;
        this.modelMgr.allModelsChanged = this.allModelsChanged;
    }
    /**
     *
     * @param m
     */
    currentUnitChanged = (m: ModelManager): void => {
        LOGGER.log("currentUnitChanged from [" + get(currentUnitName) + "] to [" + m.currentUnit?.name + "]");
        if (m.currentUnit?.name === get(currentUnitName)) {
            return;
        }
        currentUnitName.set(!!m.currentUnit ? m.currentUnit.name : undefined);
        EditorState.getInstance().showUnitAndErrors(m.currentUnit);
    };

    currentModelChanged = (m: ModelManager): void => {
        currentModelName.set(m.currentModel.name);
        const unitsInModel = this.modelMgr.currentModel.getUnits();
        unitNames.set(unitsInModel.map(u => u.name));
        units.set(unitsInModel);
    };

    allModelsChanged = (m: ModelManager): void => {
        modelNames.set(m.allModels);
    };

    onError(errorMsg: string, severity: FreErrorSeverity) {
        setUserMessage(errorMsg, FreErrorSeverity.Error);
    }

    private modelMgr: ModelManager = ModelManager.getInstance();

    get currentUnit(): FreModelUnit {
        return this.modelMgr.currentUnit;
    }

    get currentModel(): FreModel {
        return this.modelMgr.currentModel;
    }

    async loadModelUnits() {
        await this.modelMgr.loadModelList();
    }
    /**
     * Creates a new model
     * @param modelName
     */
    async newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        editorProgressShown.set(true);
        this.resetGlobalVariables();
        // editorEnvironment.editor.rootElement = null;
        await this.modelMgr.newModel(modelName);
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
        await this.modelMgr.openModel(modelName);
        editorProgressShown.set(false);

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

        await this.modelMgr.newUnit(newName, unitType);
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
                    currentUnitName.set(unit.name); // just in case the user has changed the name in the editor
                    EditorState.getInstance().setUnitLists();
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
        await this.modelMgr.deleteModelUnit(unit);
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
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name + " old unit " + this.modelMgr?.currentUnit?.name);
        await this.modelMgr.openModelUnit(newUnit);
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
            setUserMessage(e.message, FreErrorSeverity.Error);
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
            setUserMessage(`Unit named '${fileName}' already exists, adding number.`, FreErrorSeverity.Error);
            // find the existing names that start with the file name
            const unitsWithSimiliarName = this.currentModel.getUnits().filter(existing => existing.name.startsWith(fileName));
            if (unitsWithSimiliarName.length > 1) { // there are already numbered units
                // find the biggest number that is in use after the filename, e.g. Home12, Home3 => 12
                let biggestNr: number = 1;
                // find the characters in each of the existing names that come after the file name
                const trailingParts: string[] = unitsWithSimiliarName.map(existing => existing.name.slice(fileName.length));
                trailingParts.forEach(trailing => {
                    const nextNumber: number = Number.parseInt(trailing, 10);
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
    showUnitAndErrors(newUnit: FreModelUnit) {
        LOGGER.log("showUnitAndErrors called, unitName: " + newUnit?.name);
        if (!!newUnit) {
            noUnitAvailable.set(false);
            editorEnvironment.editor.rootElement = newUnit;
            // this.currentUnit = newUnit;
            currentUnitName.set(newUnit.name);
            this.setUnitLists();
            this.getErrors();
        } else {
            noUnitAvailable.set(true);
            editorEnvironment.editor.rootElement = null;
            this.modelMgr.currentUnit = null;
            currentUnitName.set("<noUnit>");
            this.setUnitLists();
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
                modelErrors.set([new FreError("Problem reading model unit: '" + e.message + "'",
                    this.currentUnit,
                    this.currentUnit.name,
                    FreErrorSeverity.Error)
                ]);
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
