import type {
    // CreateRepositoryAdminRequest,
    // ListRepositoriesAdminRequest,
    SubscribeToPartitionContentsRequest,
} from "@lionweb/server-delta-shared"
import { runInAction } from "mobx"
import type { FreModel, FreModelUnit } from "../ast/index.js"
import { FREON } from "../environment/CoreConfig.js"
import { FreLogger } from "../logging/index.js"
import { newSignOnRequest } from "./lionweb-delta/commands.js"
// import { notNullOrUndefined } from "../util/index.js"
import { InMemoryError, ModelManager } from "./ModelManager.js"
import type { FreUnitIdentifier } from "./server/index.js"

const LOGGER: FreLogger = new FreLogger("DeltaModelManager")

export class DeltaModelManager extends ModelManager {

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel | InMemoryError> {
        const result = await super.createModel(name)
        FREON.deltaClient.deltaApiClient.sendRequest(newSignOnRequest(name, "FreonEditor"))
        return result
    //     LOGGER.log(`createModel ${name}`)
    //     const createRepository: CreateRepositoryAdminRequest = {
    //         messageKind: "CreateRepositoryAdminRequest",
    //         queryId: "query-id",
    //         repositoryName: "AppDelta",
    //         additionalInfo: []
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
    async deleteModel(): Promise<void | InMemoryError> {
        const response = await FREON.server.deleteModel(this.model.name)
        if (response.errors.length > 0) {
            return new InMemoryError(response.errors[0])
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
    async openModel(name: string): Promise<FreModel | InMemoryError> {
        LOGGER.log(`openModel ${name}`)
        // const listPartitions: ListPartitionsRequest = {
        //     messageKind: "ListPartitionsRequest",
        //     queryId: "query-id",
        //     additionalInfo: []
        // }
        await FREON.deltaClient.connect()
        FREON.deltaClient.deltaApiClient.sendRequest(newSignOnRequest(name, "FreonEditor"))
        // FREON.deltaClient.deltaApiClient.sendRequest(listPartitions)
        FREON.astChanger.change(() => {
            this.model = FREON.environment.newModel(name)
        })
        const response = await FREON.server.loadUnitList(name)
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
        for (const unitId of response.result) {
            LOGGER.log("openModel: delta subscriber to partition: " + unitId.name)
            const subscribe: SubscribeToPartitionContentsRequest = {
                messageKind: "SubscribeToPartitionContentsRequest",
                queryId: "111",
                partition: unitId.id,
                additionalInfo: []
            }
            FREON.deltaClient.deltaApiClient.sendRequest(subscribe)
        }
        FREON.astChanger.cleanUndoRedo()
        return this.model

        return this.model

    }

    async saveModel(): Promise<void | InMemoryError> {
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
    //         additionalInfo: []
    //     }
    //     FREON.deltaClient.deltaApiClient.sendAdminRequest(listModel)
    //     return new InMemoryError("Fetching models ...")
    // }
    //

    /**
     * Delete _unit_ from the model.
     * @param unit
     */
    async deleteUnit(unit: FreModelUnit): Promise<void | InMemoryError> {
        const response = await FREON.server.deleteModelUnit(this.model.name, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() })
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
        FREON.astChanger.change(() => {
            this.model.removeUnit(unit)
        })
    }

    /**
     * Delete _unit_ from the model.
     * @param unitId
     */
    async deleteUnitById(_unitId: FreUnitIdentifier): Promise<void | InMemoryError> {
        // const deletePartition: DeletePartitionCommand = {
        //     messageKind: "DeletePartition",
        //     commandId: "dummy",
        //     deletedPartition: unitId.id,
        //     additionalInfo: []
        // }         
        // const unit: FreModelUnit = this.getUnitById(unitId)
        // FREON.astChanger.change(() => {
        //     this.model.removeUnit(unit)
        // })
    }

    /**
     *
     * @param oldName
     * @param newName
     * @param unit
     */
    async renameUnit(oldName: string, newName: string, unit: FreModelUnit): Promise<void | InMemoryError> {
        // If oldName and newName are the same, no rename is needed
        if (oldName === newName) {
            LOGGER.log(`renameUnit skipped: oldName and newName are the same (${oldName})`)
            return
        }
        LOGGER.log(`renameUnit from ${oldName} to ${newName}`)
        const response = await FREON.server.renameModelUnit(this.model.name, oldName, newName, unit)
        if (response.errors.length > 0) {
            this.onInMemoryError(response.errors[0])
            return new InMemoryError(response.errors[0])
        }
    }

    /**
     * Add _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    async addUnit(unit: FreModelUnit): Promise<void> {
        const result = await super.addUnit(unit)
        const subscribe: SubscribeToPartitionContentsRequest = {
            messageKind: "SubscribeToPartitionContentsRequest",
            queryId: "111",
            partition: unit.freId(),
            additionalInfo: []
        }
        FREON.deltaClient.deltaApiClient.sendRequest(subscribe)
        return result
    }

    /**
     * Save _unit_ to server.
     * This is done only when there are unsaved changes.
     * @param unit
     */
    async saveUnit(_unit: FreModelUnit): Promise<void | InMemoryError> {
        LOGGER.log(`saveModelUnit`)
    }
}
