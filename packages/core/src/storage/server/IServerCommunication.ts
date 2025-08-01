import type { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js";
import type { FreErrorSeverity } from "../../validator/index.js";

export type OnError = (errorMsg: string, severity: FreErrorSeverity) => void;
/**
 * ModelUnit identity for communication with server.
 * Needs both name and id, as the Freon server uses the name, and the LionWeb server uses the id.
 */
export type FreUnitIdentifier = {
    id: string;
    name: string;
    type: string;
};

export type ServerResponse<T> = {
    result: T
    errors: string[]
}

export type VoidServerResponse = {
    errors: string[]
}

/**
 *  Takes care of the communication with the server at SERVER_URL from WebappConfiguration.
 */
export interface IServerCommunication {
    onError: OnError;

    /**
     * return a set of unused Id's
     * @param quantity
     * @param callback
     */
    generateIds(quantity: number, callback: (strings: string[]) => void): Promise<ServerResponse<string[]>>;

    /**
     * Takes 'unit' and stores it according to the data in 'modelInfo'
     * This assumes that the unit already exists on the server, if the _unit_
     * does not exist on the server use _createModelUnit_.
     * @see createModelUnit
     * @param modelName
     * @param unitId
     * @param unit
     */
    saveModelUnit(modelName: string, unitId: FreUnitIdentifier, unit: FreNode): Promise<VoidServerResponse>;

    /**
     * Deletes the unit according to the data in 'modelInfo' from the server
     * @param modelName
     * @param unit
     */
    deleteModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<VoidServerResponse>;

    /**
     * Renames 'unit' in model with name 'modelName' to 'newName'.
     * @param modelName
     * @param oldName
     * @param newName
     * @param unit
     */
    renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode): Promise<VoidServerResponse>;

    /**
     * Create a new model with name _modelName_.
     * @param modelName
     */
    createModel(modelName: string): Promise<VoidServerResponse>;

    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param modelName
     */
    deleteModel(modelName: string): Promise<VoidServerResponse>;

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    loadModelList(): Promise<ServerResponse<string[]>>;

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     */
    loadUnitList(modelName: string): Promise<ServerResponse<FreUnitIdentifier[]>>;

    /**
     * Reads the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unit
     */
    loadModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<ServerResponse<FreNode>>;

    /**
     * Create a new modelunit on the server.
     * The _unit_ may not have children.
     * @param modelName
     * @param unit
     */
    createModelUnit(modelName: string, unit: FreModelUnit): Promise<VoidServerResponse>;
}
