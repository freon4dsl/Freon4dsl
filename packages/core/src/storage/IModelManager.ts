import type { FreModel, FreModelUnit } from "../ast/index.js"
import { type FreErrorSeverity } from "../validator/index.js"
import type { FreUnitIdentifier } from "./server/index.js"

export type ModelChangedCallbackFunction = (m: IModelManager) => void

export class ModelManagementError {
    message: string
    constructor(msg: string) {
        this.message = msg
    }
}
export function isModelManagementError(object: unknown): object is ModelManagementError {
    return object instanceof ModelManagementError
}

export interface IModelManager {
    model: FreModel | undefined
    onError: (msg: string, severity?: FreErrorSeverity) => void

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    createModel(name: string): Promise<FreModel | ModelManagementError>

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     */
    deleteModel(): Promise<void | ModelManagementError>

    /**
     * Open an existing model on the server as the in memory model.
     * After this call the newly opened model can be retrieved using _getModel_.
     * * @param name
     */
    openModel(name: string): Promise<FreModel | ModelManagementError>

    saveModel(): Promise<void | ModelManagementError>

    renameModel(newName: string): Promise<void>

    /**
     * Get a list of all model names that are available on the server.
     */
    getModels(): Promise<string[] | ModelManagementError>

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    createUnit(name: string, unitConcept: string): Promise<FreModelUnit | ModelManagementError>

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    deleteUnit(unit: FreModelUnit): Promise<void | ModelManagementError>

    /**
     * Delete _unit_ from the model.
     * @param unitId
     */
    deleteUnitById(unitId: FreUnitIdentifier): Promise<void | ModelManagementError>

    /**
     *
     * @param oldName
     * @param newName
     * @param unit
     */
    renameUnit(oldName: string, newName: string, unit: FreModelUnit): Promise<void | ModelManagementError>

    /**
     * Find a unit with name equal to _name_
     * @param name
     */
    getUnitByName(name: string): any

    /**
     * Add _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    addUnit(unit: FreModelUnit): Promise<void>

    /**
     * @param id
     */
    getUnitById(id: FreUnitIdentifier): FreModelUnit

    /**
     * Get all units of the current model.
     */
    getUnits(): FreModelUnit[]

    /**
     * Get all unit identifiers of the current model.
     */
    getUnitIdentifiers(): FreUnitIdentifier[]

    /**
     * Save _unit_ to server.
     * This is done only when there are unsaved changes.
     * @param unit
     */
    saveUnit(unit: FreModelUnit): Promise<void | ModelManagementError>

    /**
     * Save the unit with id _unitId_ to server.
     * This is done only when there are unsaved changes.
     * @param unitId
     */
    saveUnitById(unitId: FreUnitIdentifier): Promise<void>

    addCurrentModelListener(l: ModelChangedCallbackFunction): void
    
    hasChanges(): boolean;
}
