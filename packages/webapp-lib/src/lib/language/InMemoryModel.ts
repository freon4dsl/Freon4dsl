import {
    type FreEnvironment,
    FreLogger,
    type FreModel,
    type FreModelUnit,
    type IServerCommunication, ModelManager,
    type ModelUnitIdentifier
} from "@freon4dsl/core"

export type ModelChangedCallbackFunction = (m: InMemoryModel) => void;

const LOGGER = new FreLogger("InMemoryModel");

export class InMemoryModel {
    private languageEnvironment: FreEnvironment
    private server: IServerCommunication
    private models: string[] = []
    private __model : FreModel    
    
    constructor(languageEnvironment: FreEnvironment, server: IServerCommunication) {
        this.languageEnvironment = languageEnvironment
        this.server = server
    }
    
    get model(): FreModel {
        return this.__model
    }
    
    async createModel(name: string): Promise<void> {
        this.__model = this.languageEnvironment.newModel(name)
        await this.server.createModel(name)
        this.models.push(name)
        this.currentModelChanged()
    }
    
    async openModel(name: string): Promise<void> {
        LOGGER.log("openModel(" + name + ")");
        this.__model = this.languageEnvironment.newModel(name)
        const unitsIds = await this.server.loadUnitList(name)
        for (const unitId of unitsIds) {
            LOGGER.log("load model-unit: " + unitId.name);
            const unit = await this.server.loadModelUnit(this.model.name, unitId)
            this.model.addUnit(unit as FreModelUnit)
        }
        this.currentModelChanged()
    }
    
    async getModels(): Promise<string[]> {
        this.models = await this.server.loadModelList()
        return this.models
    }
    
    async newUnit(name: string, unitConcept: string): Promise<FreModelUnit> {
        const newUnit = this.model.newUnit(unitConcept); 
        await this.server.createModelUnit(this.model.name, newUnit)
        this.currentModelChanged()
        return newUnit
    }
    
    async deleteUnit(unit: FreModelUnit){
        await this.server.deleteModelUnit(this.model.name, {name: unit.name, id: unit.freId()})
        this.model.removeUnit(unit)
        this.currentModelChanged()
    }

    getUnitByName(name: string){
        return this.model.findUnit(name)
    }
    
    async addUnit(unit: FreModelUnit): Promise<void> {
        this.model.addUnit(unit)
        await this.saveUnit(unit)
        this.currentModelChanged()
    }
    
    getUnitById(id: ModelUnitIdentifier){

    }

    getUnits(): FreModelUnit[] {
        return this.model.getUnits()
    }

    getUnitIdentifiers(): ModelUnitIdentifier[] {
        return this.model.getUnits().map(u => { return {name: u.name, id: u.freId()} })
    }

    async saveUnit(unit: FreModelUnit): Promise<void> {
        await this.server.putModelUnit(this.model.name, {name: unit.name, id: unit.freId()}, unit);
        this.currentModelChanged()
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
        this.currentModelListeners.forEach(l => l(this));
    }
}
