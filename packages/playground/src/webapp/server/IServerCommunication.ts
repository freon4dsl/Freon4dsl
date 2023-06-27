
// TODO rethink these interfaces
import type { FreNode } from "@freon4dsl/core";
import { FreNamedNode } from "@freon4dsl/core";
// import { setUserMessage } from "../webapp-ts-utils/UserMessageUtils";

// export interface IModelUnitData {
//     // id: number;
//     unitName: string;
//     modelName: string;
//     language: string;
//     // url?: string;
// }

/**
 *  Takes care of the communication with the server at SERVER_URL from WebappConfiguration.
 */
export interface IServerCommunication {

    generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]>;

    /**
     * Takes 'piUnit' and stores it according to the data in 'modelInfo'
     * @param modelName
     * @param unitName
     * @param piUnit
     */
    putModelUnit(modelName: string, unitName: string, piUnit: FreNode);

    /**
     * Deletes the unit according to the data in 'modelInfo' from the server
     * @param modelName
     * @param unitName
     */
    deleteModelUnit(modelName: string, unitName: string);

    /**
     * Renames 'piUnit' in model with name 'modelName' to 'newName'.
     * @param modelName
     * @param oldName
     * @param newName
     * @param piUnit
     */
    renameModelUnit(modelName: string, oldName: string, newName: string, piUnit: FreNamedNode) ;

    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param modelName
     */
    deleteModel(modelName: string);

    /**
     * Reads the list of model units that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    loadModelList(modelListCallback: (names: string[]) => void);

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    loadUnitList(modelName: string, modelListCallback: (names: string[]) => void);

    /**
     * Reads the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: FreNode) => void);

    /**
     * Reads the public interface of the model unit according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnit: FreNode) => void);

    /**
     * Reads all interfaces for all available units of model 'modelName' and calls loadCallback for each.
     * @param languageName
     * @param modelName
     * @param loadCallback
     */
    // getInterfacesForModel(languageName: string, modelName: string, loadCallback: (piModel: FreNode) => void);
}
