import { autorun, makeObservable, observable, runInAction } from 'mobx';
import type {FreModel, FreModelUnit} from "../ast/index.js";
import {
    AST,
    FreChangeManager,
    FrePartDelta,
    FrePartListDelta,
    FrePrimDelta,
    FrePrimListDelta
} from '../change-manager/index.js';
import type {FreEnvironment} from "../environment/index.js";
import {FreLogger} from "../logging/index.js";
import {isNullOrUndefined, notNullOrUndefined} from "../util/index.js";
import type {IServerCommunication, FreUnitIdentifier} from "./server/index.js";

export type ModelChangedCallbackFunction = (m: InMemoryModel) => void;

const LOGGER: FreLogger = new FreLogger("InMemoryModel").mute();

export class InMemoryModel {
    private languageEnvironment: FreEnvironment;
    private server: IServerCommunication;
    model: FreModel | undefined = undefined;
    // units that have been changed but not saved
    dirtyUnits: FreModelUnit[] = [];

    constructor(languageEnvironment: FreEnvironment, server: IServerCommunication) {
        this.languageEnvironment = languageEnvironment;
        this.server = server;
        makeObservable(this, { model: observable });
        autorun( () => {
            if (notNullOrUndefined(this.model)) {
                this.model.getUnits()
                this.currentModelChanged()
            }
        });
        FreChangeManager.getInstance().subscribeToPart(this.partChanged);
        FreChangeManager.getInstance().subscribeToPrimitive(this.primChanged);
        FreChangeManager.getInstance().subscribeToList(this.listChanged);
        FreChangeManager.getInstance().subscribeToListElement(this.listElementChanged);
    }

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel> {
        LOGGER.log(`createModel ${name}`)
        runInAction(() => {
            this.model = this.languageEnvironment.newModel(name);
        })
        await this.server.createModel(name);
        return this.model;
    }

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     */
    async deleteModel(): Promise<void> {
        await this.server.deleteModel(this.model.name);
        runInAction( () => {
            this.model = undefined;
        });
    }

    /**
     * Open an existing model on the server as the in memory model.
     * After this call the newly opened model can be retrieved using _getModel_.
     * * @param name
     */
    async openModel(name: string): Promise<FreModel> {
        LOGGER.log("openModel(" + name + ")");
        AST.change( () => {
            this.model = this.languageEnvironment.newModel(name);
        })
        const unitsIds = await this.server.loadUnitList(name);
        for (const unitId of unitsIds) {
            LOGGER.log("openModel: load model-unit: " + unitId.name);
            const unit = await this.server.loadModelUnit(this.model.name, unitId);
            AST.change( () => {
                this.model.addUnit(unit as FreModelUnit);
            })
        }
        return this.model;
    }

    async saveModel() {
        // save all units that are 'dirty', i.e. that have been changed after the previous save
        await this.dirtyUnits.forEach(unit => {
            this.saveUnit(unit);
        })
        // when done, clean 'dirtyUnits' prop
        this.dirtyUnits = [];
    }

    /**
     * Get a list of all model names that are available on the server.
     */
    async getModels(): Promise<string[]> {
        LOGGER.log(`getModels`);
        return await this.server.loadModelList();
    }

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    async createUnit(name: string, unitConcept: string): Promise<FreModelUnit> {
        LOGGER.log(`createUnit ${name} of concept ${unitConcept}`)
        const newUnit = this.model.newUnit(unitConcept);
        runInAction( () => {
            newUnit.name = name;
        })
        await this.server.createModelUnit(this.model.name, newUnit);
        return newUnit;
    }

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    async deleteUnit(unit: FreModelUnit) {
        await this.server.deleteModelUnit(this.model.name, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() });
        AST.change( () => {
            this.model.removeUnit(unit);
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    async deleteUnitById(unitId: FreUnitIdentifier) {
        await this.server.deleteModelUnit(this.model.name, unitId);
        const unit: FreModelUnit = this.getUnitById(unitId);
        AST.change( () => {
            this.model.removeUnit(unit);
        })
    }

    /**
     * Find a unit with name equal to _name_
     * @param name
     */
    getUnitByName(name: string) {
        LOGGER.log(`getUnitByName`);
        return this.model.findUnit(name);
    }

    /**
     * Add _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    async addUnit(unit: FreModelUnit): Promise<void> {
        LOGGER.log(`addUnit ${unit?.name}`)
        AST.change( () => {
            this.model.addUnit(unit);
        })
        await this.saveUnit(unit);
    }

    /**
     * @param id
     */
    getUnitById(id: FreUnitIdentifier): FreModelUnit {
        console.log(`getUnitById: ${id.name}`);
        return this.model.findUnit(id.name);
    }

    /**
     * Get all units of the current model.
     */
    getUnits(): FreModelUnit[] {
        LOGGER.log(`getUnits`);
        const units = this?.model?.getUnits()
        if (isNullOrUndefined(units)) {
            return []
        } else {
            return units
        }
    }

    /**
     * Get all unit identifiers of the current model.
     */
    getUnitIdentifiers(): FreUnitIdentifier[] {
        LOGGER.log(`getUnitIdentifiers`);
        const units = this.model?.getUnits()
        if (isNullOrUndefined(units)) {
            return []
        } else {
            return units.map((u) => {
                return { name: u.name, id: u.freId(), type: u.freLanguageConcept() };
            });
        }
    }

    /**
     * Save _unit_ to server.
     * The _unit_ needs to be part of the current model.
     * TODO Check whether the above is true.
     * @param unit
     */
    async saveUnit(unit: FreModelUnit): Promise<void> {
        LOGGER.log(`saveModelUnit`);
        await this.server.saveModelUnit(this.model.name, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() }, unit);
    }

    /************************************************************
     * Listening to changes in units
     ***********************************************************/

    primChanged = (delta: FrePrimDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.push(delta.unit);
        }
    }
    partChanged = (delta: FrePartDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.push(delta.unit);
        }
    }
    listElementChanged = (delta: FrePartDelta | FrePrimDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.push(delta.unit);
        }
    }
    listChanged = (delta: FrePartListDelta | FrePrimListDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.push(delta.unit);
        }
    }

    /************************************************************
     * Listeners to model state
     ***********************************************************/

    /**
     * Callbacks to inform listeners that the currentmodel/currentunit has changed.
     */
    private currentModelListeners: ModelChangedCallbackFunction[] = [];
    addCurrentModelListener(l: ModelChangedCallbackFunction): void {
        this.currentModelListeners.push(l);
    }
    currentModelChanged(): void {
        this.currentModelListeners.forEach((l) => l(this));
    }
}
