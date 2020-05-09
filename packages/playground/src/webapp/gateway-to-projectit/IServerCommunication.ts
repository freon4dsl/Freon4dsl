import { PiElement } from "@projectit/core";

export interface IServerCommunication {

    /**
     * Takes 'piModel' and stores it under 'modelName' on the server at SERVER_URL.
     * 'modelName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param piModel
     */
    putModel(folderName: string, modelName: string, piModel: PiElement);

    /**
     * Reads the model with name 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param modelName
     * @param loadCallback
     */
    loadModel(folderName: string, modelName: string, loadCallback: (piModel: PiElement) => void);

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    loadModelList(folderName: string, modelListCallback: (names: string[]) => void);

    deleteModel(folderName: string, modelName: string);

}
