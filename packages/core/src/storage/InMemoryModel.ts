import { autorun, makeObservable, observable, runInAction } from "mobx"
import type { FreModel, FreModelUnit } from "../ast/index.js"
import {
    AST,
    FreChangeManager,
    type FrePartDelta,
    type FrePartListDelta,
    type FrePrimDelta,
    type FrePrimListDelta,
    FreUndoManager,
} from "../change-manager/index.js"
import type { FreEnvironment } from "../environment/index.js"
import { FreLogger } from "../logging/index.js"
import { isNullOrUndefined, notNullOrUndefined } from "../util/index.js"
import { FreErrorSeverity } from "../validator/index.js"
import type { FreUnitIdentifier, IServerCommunication } from "./server/index.js"

export type ModelChangedCallbackFunction = (m: InMemoryModel) => void

export class InMemoryError {
    message: string
    constructor (msg: string) {
        this.message = msg
    }
}
export function isInMemoryError(object: unknown): object is InMemoryError {
    return object instanceof InMemoryError
}

const LOGGER: FreLogger = new FreLogger("InMemoryModel").mute()

export class InMemoryModel {
    private languageEnvironment: FreEnvironment
    private server: IServerCommunication
    model: FreModel | undefined = undefined
    // units that have been changed but not saved
    dirtyUnits: Set<FreModelUnit> = new Set()

    constructor(languageEnvironment: FreEnvironment, server: IServerCommunication) {
        if (languageEnvironment === undefined) {
            console.trace()
        }
        this.languageEnvironment = languageEnvironment
        this.server = server
        makeObservable(this, { model: observable })
        autorun(() => {
            if (notNullOrUndefined(this.model)) {
                this.model.getUnits()
                this.currentModelChanged()
            }
        })
        FreChangeManager.getInstance().subscribeToPart(this.partChanged)
        FreChangeManager.getInstance().subscribeToPrimitive(this.primChanged)
        FreChangeManager.getInstance().subscribeToList(this.listChanged)
        FreChangeManager.getInstance().subscribeToListElement(this.listElementChanged)
    }

    onInMemoryError = (msg: string, severity?: FreErrorSeverity): void => {
        console.error("onInMemoryError: " + msg + severity?.toString())
        this.languageEnvironment?.editor.setUserMessage(msg, severity)
    }

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel | InMemoryError> {
        LOGGER.log(`createModel ${name}`)
        runInAction(() => {
            this.model = this.languageEnvironment.newModel(name)
        })
        const response = await this.server.createModel(name)
        FreUndoManager.getInstance().cleanAllStacks()
        if (response.errors.length !== 0) {
            this.onInMemoryError(response.errors[0], FreErrorSeverity.Info)
            return new InMemoryError(response.errors[0])
        }
        return this.model
    }

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     */
    async deleteModel(): Promise<void | InMemoryError> {
        const response = await this.server.deleteModel(this.model.name)
        if (response.errors.length > 0) {
            return new InMemoryError(response.errors[0])
        }
        runInAction(() => {
            this.model = undefined
        })
        FreUndoManager.getInstance().cleanAllStacks()
    }

    /**
     * Open an existing model on the server as the in memory model.
     * After this call the newly opened model can be retrieved using _getModel_.
     * * @param name
     */
    async openModel(name: string): Promise<FreModel | InMemoryError> {
        LOGGER.log("openModel(" + name + ")")
        AST.change(() => {
            this.model = this.languageEnvironment.newModel(name)
        })
        const response = await this.server.loadUnitList(name)
        if  (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
        for (const unitId of response.result) {
            LOGGER.log("openModel: load model-unit: " + unitId.name)
            const unit = await this.server.loadModelUnit(this.model.name, unitId)
            AST.change(() => {
                this.model.addUnit(unit.result as FreModelUnit)
            })
        }
        FreUndoManager.getInstance().cleanAllStacks()
        return this.model
    }

    async saveModel(): Promise<void | InMemoryError> {
        LOGGER.log("InMemoryModel.saveModel()")
        // save all units that are 'dirty', i.e. that have been changed after the previous save
        const savedUnits =  []
        for (const unit of this.dirtyUnits) {
            const response = await this.saveUnit(unit)
            if (isInMemoryError(response)) {
                // Clean dirty for units saved so far
                savedUnits.forEach(saved => this.dirtyUnits.delete(saved))
                return response
            } else {
                savedUnits.push(unit)
            }
        }
        // when done, clean 'dirtyUnits' prop
        this.dirtyUnits.clear()
    }

    /**
     * Get a list of all model names that are available on the server.
     */
    async getModels(): Promise<string[] | InMemoryError> {
        LOGGER.log(`getModels`)
        const response = await this.server.loadModelList()
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0], FreErrorSeverity.Info)
            return new InMemoryError(response.errors[0])
        }
        return response.result 
    }

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    async createUnit(name: string, unitConcept: string): Promise<FreModelUnit | InMemoryError> {
        LOGGER.log(`createUnit ${name} of concept ${unitConcept}`)
        const newUnit = this.model.newUnit(unitConcept)
        if (notNullOrUndefined(newUnit)) {
            runInAction(() => {
                newUnit.name = name
            })
            const response = await this.server.createModelUnit(this.model.name, newUnit)
            if (response.errors.length > 0) {
                return new InMemoryError(response.errors[0])
            }
            return newUnit
        } else {
            return new InMemoryError(`Cannot create unit of type '${name}'`)
        }
    }

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    async deleteUnit(unit: FreModelUnit): Promise<void | InMemoryError> {
        const response = await this.server.deleteModelUnit(this.model.name, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() })
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
        AST.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param unitId
     */
    async deleteUnitById(unitId: FreUnitIdentifier): Promise<void | InMemoryError> {
        const response = await this.server.deleteModelUnit(this.model.name, unitId)
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
        const unit: FreModelUnit = this.getUnitById(unitId)
        AST.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param oldName
     * @param unit
     */
    async renameUnit(oldName: string, newName: string, unit: FreModelUnit): Promise<void | InMemoryError> {
        LOGGER.log(`renameUnit from ${oldName} to ${newName}`)
        const response = await this.server.renameModelUnit(this.model.name, oldName, newName, unit)
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
    }

    /**
     * Find a unit with name equal to _name_
     * @param name
     */
    getUnitByName(name: string) {
        LOGGER.log(`getUnitByName`)
        return this.model.findUnit(name)
    }

    /**
     * Add _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    async addUnit(unit: FreModelUnit): Promise<void> {
        LOGGER.log(`addUnit ${unit?.name}`)
        AST.change(() => {
            this.model.addUnit(unit)
        })
        await this.saveUnit(unit)
    }

    /**
     * @param id
     */
    getUnitById(id: FreUnitIdentifier): FreModelUnit {
        LOGGER.log(`getUnitById: ${id.name}`)
        return this.model.findUnit(id.name)
    }

    /**
     * Get all units of the current model.
     */
    getUnits(): FreModelUnit[] {
        LOGGER.log(`getUnits`)
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
        LOGGER.log(`getUnitIdentifiers`)
        const units = this.model?.getUnits()
        if (isNullOrUndefined(units)) {
            return []
        } else {
            return units.map((u) => {
                return { name: u.name, id: u.freId(), type: u.freLanguageConcept() }
            })
        }
    }

    /**
     * Save _unit_ to server.
     * This is done only when there are unsaved changes.
     * @param unit
     */
    async saveUnit(unit: FreModelUnit): Promise<void | InMemoryError> {
        LOGGER.log(`saveModelUnit`)
        if (this.dirtyUnits.has(unit)) {
            const serverResponse = await this.server.saveModelUnit(
                this.model.name,
                {
                    name: unit.name,
                    id: unit.freId(),
                    type: unit.freLanguageConcept(),
                },
                unit,
            )
            if (serverResponse.errors.length === 0) {
                this.dirtyUnits.delete(unit)
            } else {
                this.onInMemoryError(serverResponse.errors[0])
                return new InMemoryError(`${serverResponse.errors[0]})`)
            }
        }
    }

    /**
     * Save the unit with id _unitId_ to server.
     * This is done only when there are unsaved changes.
     * @param unitId
     */
    async saveUnitById(unitId: FreUnitIdentifier) {
        const unit: FreModelUnit = this.getUnitById(unitId)
        this.saveUnit(unit)
    }

    /************************************************************
     * Listening to changes in units
     ***********************************************************/

    primChanged = (delta: FrePrimDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
            if (delta.owner.freIsUnit() && delta.propertyName === "name" && typeof(delta.oldValue === "string")) {
                // Unit name changed !
                this.renameUnit(delta.oldValue as string, delta.newValue as string, delta.unit)
                this.currentModelChanged()
            }
        }
    }
    partChanged = (delta: FrePartDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
        }
    }
    listElementChanged = (delta: FrePartDelta | FrePrimDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
        }
    }
    listChanged = (delta: FrePartListDelta | FrePrimListDelta) => {
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
        }
    }
    hasChanges(): boolean {
        return this.dirtyUnits.size > 0
    }

    /************************************************************
     * Listeners to model state
     ***********************************************************/

    /**
     * Callbacks to inform listeners that the currentmodel/currentunit has changed.
     */
    private currentModelListeners: ModelChangedCallbackFunction[] = []
    addCurrentModelListener(l: ModelChangedCallbackFunction): void {
        this.currentModelListeners.push(l)
    }
    currentModelChanged(): void {
        this.currentModelListeners.forEach((l) => l(this))
    }
}
