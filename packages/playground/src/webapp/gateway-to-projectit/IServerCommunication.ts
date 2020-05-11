import { PiElement } from "@projectit/core";

/**
 *  Takes care of the communication with the server at SERVER_URL from WebappConfiguration.
 */
export interface IServerCommunication {

    /**
     * Takes 'piModel' and stores it under 'modelName'.
     * 'modelName' must start with a character and contain only characters and/or numbers.
     * @param folderName
     * @param modelName
     * @param piModel
     */
    putModel(folderName: string, modelName: string, piModel: PiElement);

    /**
     * Reads the model with name 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param folderName
     * @param modelName
     * @param loadCallback
     */
    loadModel(folderName: string, modelName: string, loadCallback: (piModel: PiElement) => void);

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param folderName
     * @param modelListCallback
     */
    loadModelList(folderName: string, modelListCallback: (names: string[]) => void);

    /**
     * Deletes the model with name 'modelName' from the folder with name 'folderName'.
     * @param folderName
     * @param modelName
     */
    deleteModel(folderName: string, modelName: string);

}
