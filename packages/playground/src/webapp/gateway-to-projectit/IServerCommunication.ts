import { PiElement } from "@projectit/core";

// TODO rethink these interfaces
export interface IModelUnitData {
    // id: number;
    unitName: string;
    model: string;
    language: string;
    // url?: string;
}

/**
 *  Takes care of the communication with the server at SERVER_URL from WebappConfiguration.
 */
export interface IServerCommunication {

    /**
     * Takes 'piUnit' and stores it according to the data in 'modelInfo'
     * @param modelInfo
     * @param piUnit
     */
    putModelUnit(modelInfo: IModelUnitData, piUnit: PiElement);

    /**
     * Reads the model according to the data in 'modelInfo' from the server and
     * calls 'loadCallBack', which takes the model as parameter.
     * @param modelInfo
     * @param loadCallback
     */
    loadModelUnit(modelInfo: IModelUnitData, loadCallback: (piModel: PiElement) => void);

    /**
     * Deletes the model according to the data in 'modelInfo' from the server
     * @param modelInfo
     */
    deleteModelUnit(modelInfo: IModelUnitData);

    /**
     * Reads the list of models that are available for language 'languageName' on the server
     * and calls 'modelListCallback'.
     * @param languageName
     * @param modelListCallback
     */
    // loadModelList(languageName: string, modelListCallback: (names: string[]) => void);

    /**
     * Deletes the complete model with name 'modelName', including all its modelunits
     * @param languageName
     * @param modelName
     */
    // deleteModel(languageName: string, modelName: string);

    /**
     * Reads the list of model units of model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param languageName
     * @param modelListCallback
     */
    loadModelUnitList(languageName: string, modelName: string, modelListCallback: (names: string[]) => void);
}
