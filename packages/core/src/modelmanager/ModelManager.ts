import { FreModelUnit, FreModel, FreNamedNode } from "../ast/index";
import { FreLanguage } from "../language/index";
import { FreLogger } from "../logging/index";
import { IServerCommunication, ModelUnitIdentifier } from "../server/IServerCommunication";
import { FreErrorSeverity } from "../validator/index";

const LOGGER = new FreLogger("ModelManager");

export type CallbackFunction = (m: ModelManager) => void;

export type CurrentUnitChanged = (m: ModelManager) => void;
/**
 * ModelManager keeps im memory track of the current model, the modelunits in memory and the current model unit.
 * Performs all communication with the server.
 *
 * By providing callback functions one can subscribe to changes in the model or modelunit(s).
 * This is _not_ meant for subscribing to changes inside nodes of a model unit.
 */
export class ModelManager {
    private static instance: ModelManager = null;

    /**
     * Sets the servercommunication to be used by the model manager.
     * @param serverCommunication
     */
    static setServerCommunication(serverCommunication: IServerCommunication): void {
        ModelManager.getInstance().serverCommunication = serverCommunication;
    }

    /**
     * Therte is one and only one model manager
     */
    static getInstance(): ModelManager {
        if (ModelManager.instance === null) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    private constructor() {
    }

    /**
     * Callbacks to inform listeners that the currentmodel/currentunit has changed.
     */
    private currentUnitListeners: CallbackFunction[] = [];
    addCurrentUnitListener(l: CallbackFunction): void {
        this.currentUnitListeners.push(l);
    }
    currentUnitChanged(): void {
        this.currentUnitListeners.forEach(l => l(this));
    }

    private currentModelListeners: CallbackFunction[] = [];
    addCurrentModelListener(l: CallbackFunction): void {
        this.currentModelListeners.push(l);
    }
    currentModelChanged(): void {
        this.currentModelListeners.forEach(l => l(this));
    }

    private _onError: (errorMsg: string, severity: FreErrorSeverity) => void;
    get onError(): (errorMsg: string, severity: FreErrorSeverity) => void {
        return this._onError;
    }

    /**
     * Set onError callkback function
     * @param value
     */
    set onError(value: (errorMsg: string, severity: FreErrorSeverity) => void) {
        this._onError = value;
        this.serverCommunication.onError = value;
    }

    /**
     * Callbacks to inform listeners that the currentmodel/currentunit has changed.
     */
    allModelsChanged: CallbackFunction;

    serverCommunication: IServerCommunication;

    private _allModels: string[] = undefined;
    private _currentModel: FreModel;
    private _currentUnit: FreModelUnit;

    get allModels(): string[] {
        if (this._allModels === undefined) {
            this.loadModelList();
        }
        return this._allModels;
    }

    set allModels(value: string[]) {
        this._allModels = value;
    }
    get currentUnit(): FreModelUnit {
        LOGGER.log("Get current unit " + this._currentUnit?.name);
        return this._currentUnit;
    }

    set currentUnit(value: FreModelUnit) {
        LOGGER.log("Set current unit " + value?.name);
        this._currentUnit = value;
        this.currentUnitChanged()
    }
    get currentModel(): FreModel {
        return this._currentModel;
    }

    set currentModel(value: FreModel) {
        this._currentModel = value;
        this.currentModelChanged();
    }

    /**
     * Load the list of existing models from the server.
     */
    async loadModelList() {
        await this.serverCommunication.loadModelList((names: string[]) => {
            if (names.length > 0) {
                this._allModels = names;
            } else {
                this._allModels = [];
            }
            this.allModelsChanged(this)
        });
    }

    /**
     * Creates a new model
     * @param modelName
     */
    async newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        // save the old current unit, if there is one
        // await this.saveCurrentUnit();
        // create a new model on the server
        await this.serverCommunication.createModel(modelName)
        // create a new model in memory
        await this.openModel(modelName)
        // this.currentModel = FreLanguage.getInstance().createModel();
        // this._currentModel.name = modelName;
        // this.currentUnit = null;
        // this.currentModelChanged();
        // this.currentUnitChanged();
    }

    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * For all other units the model unit interface is loaded.
     * @param modelName
     */
    async openModel(modelName: string) {
        LOGGER.log("openModel(" + modelName + ")");
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // create new model instance in memory and set its name
        // this._currentModel = this.environment.newModel(modelName);
        this._currentModel = FreLanguage.getInstance().createModel();
        this._currentModel.name = modelName;
        LOGGER.log("2")
        // fill the new model with the units loaded from the server
        const unitIdentifiers: ModelUnitIdentifier[] = await this.serverCommunication.loadUnitList(modelName)
        LOGGER.log("loadUnitList callback with " + unitIdentifiers);
        if (unitIdentifiers && unitIdentifiers.length > 0) {
            // load the first unit completely and show it, load all others units as interfaces
            let first: boolean = true;
            for (const unitIdentifier of unitIdentifiers) {
                if (first) {
                    const unit = await this.serverCommunication.loadModelUnit(modelName, unitIdentifier) as FreModelUnit
                    // await this.serverCommunication.loadModelUnit(modelName, unitName.id, (unit: FreModelUnit) => {
                        this._currentModel.addUnit(unit);
                        LOGGER.log("First: Current model / unit is " + this?._currentModel?.name + "/" + unit?.name);
                        this.currentUnit = unit;
                        this?.currentUnitChanged();
                        this?.currentModelChanged();
                    // });
                    first = false;
                } else {
                    await this.serverCommunication.loadModelUnitInterface(modelName, unitIdentifier, (unit: FreModelUnit) => {
                        LOGGER.log("Not first: Current model / unit is " + this?._currentModel?.name + "/" + unit?.name);
                        this._currentModel.addUnit(unit);
                        this?.currentModelChanged();
                    });
                }
            }

        }
    }

    /**
     * Pushes the current unit to the server
     */
    async saveCurrentUnit(): Promise<void> {
        LOGGER.log("saveCurrentUnit: " + this._currentUnit?.name);
        const unit: FreNamedNode = this._currentUnit;
        if (!!unit) {
            if (!!this._currentModel.name && this._currentModel?.name.length) {
                if (!!unit.name && unit.name.length > 0) {
                    await this.serverCommunication.putModelUnit(this._currentModel.name, {name: unit.name, id: unit.freId()}, unit);
                } else {
                    // TODO How to report an error back?
                    this._onError(`Unit without name cannot be saved. Please, name it and try again.`, FreErrorSeverity.Warning);
                }
            } else {
                LOGGER.log("Internal error: cannot save unit because current model is unknown.");
            }
        } else {
            LOGGER.log("No current model unit");
        }
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    async newUnit(newName: string, unitType: string) {
        LOGGER.log("newUnit: unitType: " + unitType + ", name: " + newName);
        // save the old current unit, if there is one
        await this.saveCurrentUnit();

        // replace the current unit by its interface
        // and create a new unit named 'newName'
        const oldName: string = this?.currentUnit?.name;
        if (!!oldName && oldName !== "") {
            // get the interface of the current unit from the server
            await this.serverCommunication.loadModelUnitInterface(
                this.currentModel.name,
                {name: this.currentUnit.name, id: this.currentUnit.freId()},
                (oldUnitInterface: FreModelUnit) => {
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        this.currentModel.replaceUnit(this.currentUnit, oldUnitInterface);
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
        const newUnit = this.currentModel.newUnit(unitType);
        if (!!newUnit) {
            newUnit.name = newName;
            this.currentUnit = newUnit;
            this.currentUnitChanged()
        } else {
            this._onError( `Model unit of type '${unitType}' could not be created.`, FreErrorSeverity.Error);
        }
    }


    /**
     * Deletes the unit 'unit', from the server and from the current in-memory model
     * @param unit
     */
    async deleteModelUnit(unit: FreModelUnit) {
        LOGGER.log("delete called for unit: " + unit.name);

        // get rid of the unit on the server
        await this.serverCommunication.deleteModelUnit(this.currentModel.name, { name: unit.name, id: unit.freId()});
        // get rid of old model unit from memory
        this.currentModel.removeUnit(unit);
        // if the unit is shown in the editor, get rid of that one, as well
        if (this.currentUnit === unit) {
            this.currentUnit = null;
            this.currentUnitChanged();
        }
        this.currentModelChanged();
    }

    /**
     * Reads the unit called 'newUnit' from the server and shows it in the editor
     * @param newUnit
     */
    async openModelUnit(newUnit: FreModelUnit) {
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name + " old unit " + this.currentUnit?.name);
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
        const newCompleteUnit = await this.serverCommunication.loadModelUnit(this.currentModel.name, {name: newUnit.name, id: newUnit.freId()}) as FreModelUnit
            this.swapInterfaceAndUnits(newCompleteUnit, newUnit);
        // });
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
        if (!!this.currentUnit) {
            // get the interface of the current unit from the server
            this.serverCommunication.loadModelUnitInterface(
                this.currentModel.name,
                {name: this.currentUnit.name, id: this.currentUnit.freId()},
                (oldUnitInterface: FreModelUnit) => {
                    if (!!newCompleteUnit) { // the new unit which has been retrieved from the server
                        if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
                            // swap old unit with its interface in the in-memory model
                            this.currentModel.replaceUnit(this.currentUnit, oldUnitInterface);
                        }
                        // swap the new unit interface with the full unit in the in-memory model
                        this.currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
                        this.currentUnit = newCompleteUnit;
                        // notify observers
                        this.currentUnitChanged();
                    }
                });
        } else {
            // swap the new unit interface with the full unit in the in-memory model
            this.currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
            // notify observers
            this.currentUnit = newCompleteUnit;
            this.currentUnitChanged();
        }
    }
}
