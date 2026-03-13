import type { AddPartitionCommand, DeleteRepositoryAdminRequest, ListPartitionsRequest } from "@lionweb/server-delta-shared"
import { runInAction } from "mobx"
import type { FreModel, FreModelUnit } from "../ast/index.js"
import { FREON } from "../environment/CoreConfig.js"
import { FreLogger } from "../logging/index.js"
import { notNullOrUndefined } from "../util/index.js"
import { newSignOnRequest } from "./lionweb-delta/commands.js"
import { ModelManagementError } from "./IModelManager.js"
import { ModelManager } from "./ModelManager.js"
import { FreLionwebSerializer } from "./serializer/index.js"
import { type FreUnitIdentifier, LionwebDeltaIdProvider } from "./server/index.js"

const LOGGER: FreLogger = new FreLogger("DeltaModelManager")

export class DeltaModelManager extends ModelManager {
    subscribe(): void {}
    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel | ModelManagementError> {
        const result = await super.createModel(name)
        const date = new Date()
        FREON.deltaClient.deltaApiClient.sendRequest(newSignOnRequest(name, "FreonEditor-" + date.getHours() + ":" + date.getSeconds()));
        ((FREON.idProvider) as LionwebDeltaIdProvider).sendIdRequest()
        return result
        //     LOGGER.log(`createModel ${name}`)
        //     const createRepository: CreateRepositoryAdminRequest = {
        //         messageKind: "CreateRepositoryAdminRequest",
        //         queryId: "query-id",
        //         repositoryName: "AppDelta",
        //         additionalInfos: []
        //     }
        //     if (notNullOrUndefined(FREON.deltaClient)) {
        //         await FREON.deltaClient.connect()
        //         await FREON.deltaClient.deltaApiClient.sendAdminRequest(createRepository)
        //     }
        //     // TODO What to return?
        //     return this.model
    }

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     */
    async deleteModel(): Promise<void | ModelManagementError> {
        const request: DeleteRepositoryAdminRequest = {
            messageKind: "DeleteRepositoryAdminRequest",
            queryId: "DeleteModel-query",
            repositoryName: this.model.name,
            additionalInfos: [],
        }
        FREON.deltaClient.deltaApiClient.sendAdminRequest(request)
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
        LOGGER.log(`openModel ${name}`)
        const listPartitions: ListPartitionsRequest = {
            messageKind: "ListPartitionsRequest",
            queryId: "query-id",
            additionalInfos: [],
        }
        FREON.astChanger.change(() => {
            this.model = FREON.environment.newModel(name)
        })
        FREON.astChanger.cleanUndoRedo()
        // await FREON.deltaClient.connect()
        const date = new Date()
        FREON.deltaClient.deltaApiClient.sendRequest(newSignOnRequest(name, "FreonEditor-" + date.getHours() + ":" + date.getSeconds()));
        (FREON.idProvider as LionwebDeltaIdProvider).sendIdRequest();
        FREON.deltaClient.deltaApiClient.sendRequest(listPartitions)
        return this.model
    }

    async saveModel(): Promise<void | ModelManagementError> {
        LOGGER.log("saveModel(): no-op in delta protocol")
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
    // async getModels(): Promise<string[] | InMemoryError> {
    //     LOGGER.log(`getModels`)
    //     const listModel: ListRepositoriesAdminRequest = {
    //         messageKind: "ListRepositoriesAdminRequest",
    //         queryId: "admin-query-000",
    //         additionalInfos: []
    //     }
    //     FREON.deltaClient.deltaApiClient.sendAdminRequest(listModel)
    //     return new InMemoryError("Fetching models ...")
    // }
    //

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    async createUnit(name: string, unitConcept: string): Promise<FreModelUnit | ModelManagementError> {
        LOGGER.log(`createUnit ${name} of concept ${unitConcept}`)
        let newUnit
        FREON.astChanger.changeNamed(`create unit '${name}'`, () => {
            newUnit = this.model.newUnit(unitConcept)
        })
        if (notNullOrUndefined(newUnit)) {
            FREON.astChanger.changeNamed("create unit with name", () => {
                newUnit.name = name
            })
            console.log("NEW UNIT: " + JSON.stringify(FreLionwebSerializer.getInstance().convertToJSON(newUnit)))
            // const command: AddPartitionCommand = {
            //     messageKind: "AddPartition",
            //     commandId: "any",
            //     newPartition: { nodes: FreLionwebSerializer.getInstance().convertToJSON(newUnit) },
            //     additionalInfos: []
            // }
            // FREON.deltaClient.deltaApiClient.sendCommand(command)
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
        FREON.astChanger.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param unitId
     */
    async deleteUnitById(unitId: FreUnitIdentifier): Promise<void | ModelManagementError> {
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
        FREON.astChanger.changeNamed(`Rename unit '${oldName}' to '${newName}'`, () => {
            unit.name = newName
        })
    }

    /**
     * Add NEW _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    async addUnit(unit: FreModelUnit): Promise<void> {
        FREON.astChanger.change(() => {
            this.model.addUnit(unit)
        })
        const addPartition: AddPartitionCommand = {
            messageKind: "AddPartition",
            commandId: "111",
            newPartition: { nodes: FreLionwebSerializer.getInstance().convertToJSON(unit) },
            additionalInfos: [],
        }
        FREON.deltaClient.deltaApiClient.sendCommand(addPartition)
    }

    /**
     * Save _unit_ to server.
     * This is done only when there are unsaved changes.
     * @param unit
     */
    async saveUnit(_unit: FreModelUnit): Promise<void | ModelManagementError> {
        LOGGER.log(`saveModelUnit`)
    }

    // primChanged = (_delta: FrePrimDelta) => {}
    // partChanged = (_delta: FrePartDelta) => {}
    // listElementChanged = (_delta: FrePartDelta | FrePrimDelta) => {}
    // listChanged = (_delta: FrePartListDelta | FrePrimListDelta) => {}
}
