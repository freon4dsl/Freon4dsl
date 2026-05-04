import { autorun, makeObservable, observable, runInAction } from "mobx"
import type { FreModel, FreModelUnit } from "../ast/index.js"
import { type FrePartDelta, type FrePartListDelta, type FrePrimDelta, type FrePrimListDelta } from "../change-manager/index.js"
import { FREON } from "../environment/CoreConfig.js"
import { FreLogger } from "../logging/index.js"
import { isNullOrUndefined, notNullOrUndefined } from "../util/index.js"
import { FreErrorSeverity } from "../validator/index.js"
import { type IModelManager, ModelManagementError, type ModelChangedCallbackFunction, isModelManagementError } from "./IModelManager.js"
import type { FreUnitIdentifier } from "./server/index.js"

const LOGGER: FreLogger = new FreLogger("ModelManager")

export class ModelManager implements IModelManager {
    model: FreModel | undefined = undefined
    // units that have been changed but not saved
    dirtyUnits: Set<FreModelUnit> = new Set()

    constructor() {
        makeObservable(this, { model: observable })
        autorun(() => {
            if (notNullOrUndefined(this.model)) {
                this.model.getUnits()
                this.currentModelChanged()
            }
        })
        this.subscribe()
    }

    subscribe(): void {
        FREON.astObserver.subscribeToPart(this.partChanged)
        FREON.astObserver.subscribeToPrimitive(this.primChanged)
        FREON.astObserver.subscribeToList(this.listChanged)
        FREON.astObserver.subscribeToListElement(this.listElementChanged)
    }
    
    onError = (msg: string, severity?: FreErrorSeverity): void => {
        console.error("ModelManager.onError: " + msg + severity?.toString())
        FREON.environment?.editor.setUserMessage(msg, severity)
    }

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel | ModelManagementError> {
        LOGGER.log(`createModel ${name}`)
        runInAction(() => {
            this.model = FREON.environment.newModel(name)
        })
        const response = await FREON.server.createModel(name)
        FREON.astChanger.cleanUndoRedo()
        if (response.errors.length !== 0) {
            this.onError(response.errors[0], FreErrorSeverity.Info)
            return new ModelManagementError(response.errors[0])
        }
        return this.model
    }

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     */
    async deleteModel(): Promise<void | ModelManagementError> {
        const response = await FREON.server.deleteModel(this.model.name)
        if (response.errors.length > 0) {
            return new ModelManagementError(response.errors[0])
        }
        runInAction(() => {
            this.model = undefined
        })
        FREON.astChanger.cleanUndoRedo()
    }

    /**
     * Open an existing model on the server as the in memory model.
     * After this call the newly opened model can be retrieved using _getModel_.
     * * @param name
     */
    async openModel(name: string): Promise<FreModel | ModelManagementError> {
        LOGGER.log("openModel(" + name + ")")
        FREON.astChanger.change(() => {
            this.model = FREON.environment.newModel(name)
        })
        const response = await FREON.server.loadUnitList(name)
        if (response.errors.length > 0) {
            this.onError(response.errors[0])
            return new ModelManagementError(response.errors[0])
        }
        for (const unitId of response.result) {
            LOGGER.log("openModel: load model-unit: " + unitId.name)
            const unit = await FREON.server.loadModelUnit(this.model.name, unitId)
            FREON.astChanger.change(() => {
                this.model.addUnit(unit.result as FreModelUnit)
            })
        }
        FREON.astChanger.cleanUndoRedo()
        return this.model
    }

    async saveModel(): Promise<void | ModelManagementError> {
        LOGGER.log("ModelManager.saveModel()")
        // save all units that are 'dirty', i.e. that have been changed after the previous save
        const savedUnits = []
        for (const unit of this.dirtyUnits) {
            const response = await this.saveUnit(unit)
            if (isModelManagementError(response)) {
                // Clean dirty for units saved so far
                savedUnits.forEach((saved) => this.dirtyUnits.delete(saved))
                return response
            } else {
                savedUnits.push(unit)
            }
        }
        // when done, clean 'dirtyUnits' prop
        this.dirtyUnits.clear()
    }

    async renameModel(newName: string) {
        LOGGER.log(`renameModel to ${newName}`)
        await FREON.server.renameModel(this.model.name, newName)
        this.model.name = newName
        this.currentModelChanged()
    }

    /**
     * Get a list of all model names that are available on the server.
     */
    async getModels(): Promise<string[] | ModelManagementError> {
        LOGGER.log(`getModels`)
        const response = await FREON.server.loadModelList()
        if (response.errors.length > 0) {
            this.onError(response.errors[0], FreErrorSeverity.Info)
            return new ModelManagementError(response.errors[0])
        }
        return response.result
    }

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    async createUnit(name: string, unitConcept: string): Promise<FreModelUnit | ModelManagementError> {
        LOGGER.log(`createUnit ${name} of concept ${unitConcept}`)
        const newUnit = this.model.newUnit(unitConcept)
        if (notNullOrUndefined(newUnit)) {
            runInAction(() => {
                newUnit.name = name
            })
            const response = await FREON.server.createModelUnit(this.model.name, newUnit)
            if (response.errors.length > 0) {
                return new ModelManagementError(response.errors[0])
            }
            return newUnit
        } else {
            return new ModelManagementError(`Cannot create unit of type '${name}'`)
        }
    }

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    async deleteUnit(unit: FreModelUnit): Promise<void | ModelManagementError> {
        const response = await FREON.server.deleteModelUnit(this.model.name, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() })
        if (response.errors.length > 0) {
            this.onError(response.errors[0])
            return new ModelManagementError(response.errors[0])
        }
        FREON.astChanger.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param unitId
     */
    async deleteUnitById(unitId: FreUnitIdentifier): Promise<void | ModelManagementError> {
        const response = await FREON.server.deleteModelUnit(this.model.name, unitId)
        if (response.errors.length > 0) {
            this.onError(response.errors[0])
            return new ModelManagementError(response.errors[0])
        }
        const unit: FreModelUnit = this.getUnitById(unitId)
        FREON.astChanger.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     *
     * @param oldName
     * @param newName
     * @param unit
     */
    async renameUnit(oldName: string, newName: string, unit: FreModelUnit): Promise<void | ModelManagementError> {
        // If oldName and newName are the same, no rename is needed
        if (oldName === newName) {
            LOGGER.log(`renameUnit skipped: oldName and newName are the same (${oldName})`)
            return
        }
        LOGGER.log(`renameUnit from ${oldName} to ${newName}`)
        const response = await FREON.server.renameModelUnit(this.model.name, oldName, newName, unit)
        if (response.errors.length > 0) {
            this.onError(response.errors[0])
            return new ModelManagementError(response.errors[0])
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
        FREON.astChanger.change(() => {
            this.model.addUnit(unit)
        })
        LOGGER.log(`addUnit added ${unit?.name}`)
        await FREON.server.createModelUnit(this.model.name, unit)
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
    async saveUnit(unit: FreModelUnit): Promise<void | ModelManagementError> {
        LOGGER.log(`saveModelUnit`)
        if (this.dirtyUnits.has(unit)) {
            LOGGER.log(`Saving unit`)
            const serverResponse = await FREON.server.saveModelUnit(
                this.model.name,
                {
                    name: unit.name,
                    id: unit.freId(),
                    type: unit.freLanguageConcept(),
                },
                unit,
            )
            LOGGER.log(`server response: ${JSON.stringify(serverResponse)}`)
            if (serverResponse.errors.length === 0) {
                this.dirtyUnits.delete(unit)
            } else {
                this.onError(serverResponse.errors[0])
                return new ModelManagementError(`${serverResponse.errors[0]})`)
            }
        } else {
            LOGGER.log(`NOT Saving unit, not dirty`)
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
        LOGGER.log(`primChanged ${delta.propertyName}`)
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
            if (delta.owner.freIsUnit() && delta.propertyName === "name" && typeof (delta.oldValue === "string")) {
                // Unit name changed !
                this.renameUnit(delta.oldValue as string, delta.newValue as string, delta.unit)
                this.currentModelChanged()
            }
        }
    }
    partChanged = (delta: FrePartDelta) => {
        LOGGER.log(`primChanged ${delta.propertyName}`)
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
        }
    }
    listElementChanged = (delta: FrePartDelta | FrePrimDelta) => {
        LOGGER.log(`primChanged ${delta.propertyName}`)
        if (this.getUnits().includes(delta.unit)) {
            this.dirtyUnits.add(delta.unit)
        }
    }
    listChanged = (delta: FrePartListDelta | FrePrimListDelta) => {
        LOGGER.log(`primChanged ${delta.propertyName}`)
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
     * Callbacks to inform listeners that the current model/current unit has changed.
     */
    private currentModelListeners: ModelChangedCallbackFunction[] = []
    addCurrentModelListener(l: ModelChangedCallbackFunction): void {
        this.currentModelListeners.push(l)
    }
    currentModelChanged(): void {
        this.currentModelListeners.forEach((l) => l(this))
    }
}
