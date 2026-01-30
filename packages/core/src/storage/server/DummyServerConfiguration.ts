import type { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js"
import type { FreUnitIdentifier, IServerCommunication, OnError, ServerResponse, VoidServerResponse } from "./IServerCommunication.js"

/**
 *  Takes care of the communication with the server at SERVER_URL from WebappConfiguration.
 */
export class DummyServerConfiguration implements IServerCommunication {
    onError: OnError;

    /**
     * return a set of unused Id's
     * @param quantity
     * @param callback
     */
    generateIds(_quantity: number, _callback: (strings: string[]) => void): Promise<ServerResponse<string[]>> {
        throw new Error("DummyServerConfiguration.generateIds: no server configured.")
    }

    /**
     * Takes 'unit' and stores it according to the data in 'modelInfo'
     * This assumes that the unit already exists on the server, if the _unit_
     * does not exist on the server use _createModelUnit_.
     * @see createModelUnit
     * @param modelName
     * @param unitId
     * @param unit
     */
    saveModelUnit(_modelName: string, _unitId: FreUnitIdentifier, _unit: FreNode): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.saveModelUnit: no server configured.")
    }

    /**
     * Deletes the unit according to the data in 'modelInfo' from the server
     * @param modelName
     * @param unit
     */
    deleteModelUnit(_modelName: string, _unit: FreUnitIdentifier): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.deleteModelUnit: no server configured.")
    }

    /**
     * Renames 'unit' in model with name 'modelName' to 'newName'.
     * @param modelName
     * @param oldName
     * @param newName
     * @param unit
     */
    renameModelUnit(_modelName: string, _oldName: string, _newName: string, _unit: FreNamedNode): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.renameModelUnit: no server configured.")
    }

    /**
     * Create a new model with name _modelName_.
     * @param modelName
     */
    createModel(_modelName: string): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.createModel: no server configured.")
    }

    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param modelName
     */
    deleteModel(_modelName: string): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.deleteModel: no server configured.")
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    loadModelList(): Promise<ServerResponse<string[]>> {
        throw new Error("DummyServerConfiguration.loadModelList: no server configured.")
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     */
    loadUnitList(_modelName: string): Promise<ServerResponse<FreUnitIdentifier[]>> {
        throw new Error("DummyServerConfiguration.loadUnitList: no server configured.")
    }

    /**
     * Reads the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unit
     */
    loadModelUnit(_modelName: string, _unit: FreUnitIdentifier): Promise<ServerResponse<FreNode>> {
        throw new Error("DummyServerConfiguration.loadModelUnit: no server configured.")
    }

    /**
     * Create a new modelunit on the server.
     * The _unit_ may not have children.
     * @param modelName
     * @param unit
     */
    createModelUnit(_modelName: string, _unit: FreModelUnit): Promise<VoidServerResponse> {
        throw new Error("DummyServerConfiguration.createModelUnit: no server configured.")
    }

    renameModel(_oldName: string, _newName: string): void {
        throw new Error("DummyServerConfiguration.renameModel: no server configured.")
    }
} 
