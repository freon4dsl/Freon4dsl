import { GenericModelSerializer, PiLogger } from "@projectit/core";
import axios from "axios";
import { PiElement } from "@projectit/core";
import { SERVER_URL } from "./WebappConfiguration";
import { IServerCommunication } from "./IServerCommunication";

const LOGGER = new PiLogger("ServerCommunication"); // TODO show errors to user

export class ServerCommunication implements IServerCommunication {
    static serial: GenericModelSerializer = new GenericModelSerializer();
    static instance: ServerCommunication;

    static getInstance() : ServerCommunication {
        if (!(!!ServerCommunication.instance)) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
    }

    /**
     * Takes 'piModel' and stores it under 'modelName' on the server at SERVER_URL.
     * 'modelName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param piModel
     */
    async putModel(folderName: string, modelName: string, piModel: PiElement) {
        console.log("ServerCommunication.putModel " + modelName);
        if (modelName !== "" && modelName.match(/^[a-z,A-Z][a-z,A-Z,0-9]*$/)) {
            const model = ServerCommunication.serial.convertToJSON(piModel);
            try {
                const res = await axios.put(`${SERVER_URL}putModel?folder=${folderName}&name=${modelName}`, model);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        } else {
            LOGGER.error(this, "Model name '" + modelName + "' may contain only characters and numbers, and must start with a character.");
        }
    }

    /**
     * Reads the model with name 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param modelName
     * @param loadCallback
     */
    async loadModel(folderName: string, modelName: string, loadCallback: (piModel: PiElement) => void) {
        // TODO move callback to EditorCommunication
        console.log("ServerCommunication.loadModel " + modelName);
        if (modelName !== "") {
            try {
                const res = await axios.get(`${SERVER_URL}getModel?folder=${folderName}&name=${modelName}`);
                const model = ServerCommunication.serial.toTypeScriptInstance(res.data);
                loadCallback(model);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(folderName: string, modelListCallback: (names: string[]) => void) {
        console.log("ServerCommunication.loadModelList ");
        // TODO move callback to EditorCommunication
        try {
            const res = await axios.get(`${SERVER_URL}getModelList?folder=${folderName}`);
            if (!!res) {
                modelListCallback(res.data);
            }
        } catch (e) {
            console.log(e.message);
            LOGGER.error(this, e.toString());
        }
        return [];
    }

    async deleteModel(folderName: string, modelName: string) {
        console.log("ServerCommunication.deleteModel " + modelName);
        if (modelName !== "") {
            try {
                const res = await axios.get(`${SERVER_URL}deleteModel?folder=${folderName}&name=${modelName}`);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }
}
