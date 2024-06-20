import { FreNamedNode, FreNode } from "../ast/index";
import { FreErrorSeverity } from "../validator/index";

export type OnError = (errorMsg: string, severity: FreErrorSeverity) => void;
/**
 * ModelUnit identity for communication with server.
 * Needs both name and id, as the Freon server uses thge name, and the LionWeb server uses the id.
 */
export type ModelUnitIdentifier = {
    name: string
    id: string
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
    generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]>;

    /**
     * Takes 'unit' and stores it according to the data in 'modelInfo'
     * @param modelName
     * @param unitName
     * @param unit
     */
    putModelUnit(modelName: string, unitId: ModelUnitIdentifier, unit: FreNode);

    /**
     * Deletes the unit according to the data in 'modelInfo' from the server
     * @param modelName
     * @param unitName
     */
    deleteModelUnit(modelName: string, unit: ModelUnitIdentifier);

    /**
     * Renames 'unit' in model with name 'modelName' to 'newName'.
     * @param modelName
     * @param oldName
     * @param newName
     * @param unit
     */
    renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode) ;

    /**
     * Create a new model with name _modelName_.
     * @param modelName
     */
    createModel(modelName: string): any;
    
    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param modelName
     */
    deleteModel(modelName: string);

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    loadModelList(modelListCallback: (names: string[]) => void);

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    loadUnitList(modelName: string): Promise<ModelUnitIdentifier[]>

    /**
     * Reads the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    loadModelUnit(modelName: string, unit: ModelUnitIdentifier): Promise<FreNode>;

    /**
     * Reads the public interface of the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    loadModelUnitInterface(modelName: string, unit: ModelUnitIdentifier, loadCallback: (unit: FreNode) => void);

    /**
     * Reads all interfaces for all available units of model 'modelName' and calls loadCallback for each.
     * @param languageName
     * @param modelName
     * @param loadCallback
     */
    // getInterfacesForModel(languageName: string, modelName: string, loadCallback: (model: FreNode) => void);
}
