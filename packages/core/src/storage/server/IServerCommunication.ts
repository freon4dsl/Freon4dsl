import { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js";
import { FreErrorSeverity } from "../../validator/index.js";

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
    generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]>;

    /**
     * Takes 'unit' and stores it according to the data in 'modelInfo'
     * This assumes that the unit already exists on the server, if the _unit_
     * does not exist on the server use _createModelUnit_.
     * @see createModelUnit
     * @param modelName
     * @param unitId
     * @param unit
     */
    putModelUnit(modelName: string, unitId: FreUnitIdentifier, unit: FreNode): void;

    /**
     * Deletes the unit according to the data in 'modelInfo' from the server
     * @param modelName
     * @param unit
     */
    deleteModelUnit(modelName: string, unit: FreUnitIdentifier): void;

    /**
     * Renames 'unit' in model with name 'modelName' to 'newName'.
     * @param modelName
     * @param oldName
     * @param newName
     * @param unit
     */
    renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode): void;

    /**
     * Create a new model with name _modelName_.
     * @param modelName
     */
    createModel(modelName: string): any;

    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param modelName
     */
    deleteModel(modelName: string): void;

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    loadModelList(): Promise<string[]>;

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     */
    loadUnitList(modelName: string): Promise<FreUnitIdentifier[]>;

    /**
     * Reads the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unit
     */
    loadModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<FreNode>;

    /**
     * Create a new modelunit on the server.
     * The _unit_ may not have children.
     * @param modelName
     * @param unit
     */
    createModelUnit(modelName: string, unit: FreModelUnit): void;
}
