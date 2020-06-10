import { GenericModelSerializer, PiLogger } from "@projectit/core";
import axios from "axios";
import { PiElement } from "@projectit/core";
import { SERVER_URL } from "./WebappConfiguration";
import { IModelUnitData, IServerCommunication } from "./IServerCommunication";

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
     * 'modelInfo.unitName' must start with a character and contain only characters and/or numbers.
     * @param modelInfo
     * @param piModel
     */
    async putModelUnit(modelInfo: IModelUnitData, piModel: PiElement) {
        console.log(`ServerCommunication.putModelUnit ${modelInfo.language}/${modelInfo.model}/${modelInfo.unitName}`);
        if (!!modelInfo.unitName && modelInfo.unitName !== "" && modelInfo.unitName.match(/^[a-z,A-Z][a-z,A-Z,0-9]*$/)) {
            const model = ServerCommunication.serial.convertToJSON(piModel);
            const publicModel = ServerCommunication.serial.convertToJSON(piModel, true);
            try {
                const res1 = await axios.put(`${SERVER_URL}putModel?folder=${modelInfo.language}/${modelInfo.model}&name=${modelInfo.unitName}`, model);
                const res2 = await axios.put(`${SERVER_URL}putModel?folder=${modelInfo.language}/${modelInfo.model}&name=${modelInfo.unitName}Public`, publicModel);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        } else {
            LOGGER.error(this, "Name of Model Unit '" + modelInfo.unitName + "' may contain only characters and numbers, and must start with a character.");
        }
    }

    /**
     * Reads the model with unitName 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param modelName
     * @param loadCallback
     */
    async loadModelUnit(modelInfo: IModelUnitData, loadCallback: (piModel: PiElement) => void) {
        // TODO extra param: complete: boolean
        let complete: boolean = true;
        console.log(`ServerCommunication.loadModelUnit ${modelInfo.language}/${modelInfo.model}/${modelInfo.unitName}`);
        if (!!modelInfo.unitName && modelInfo.unitName !== "") {
            try {
                if (complete) {
                    const res = await axios.get(`${SERVER_URL}getModel?folder=${modelInfo.language}/${modelInfo.model}&name=${modelInfo.unitName}`);
                    const model = ServerCommunication.serial.toTypeScriptInstance(res.data);
                    loadCallback(model);
                } else {
                    const res = await axios.get(`${SERVER_URL}getModel?folder=${modelInfo.language}/${modelInfo.model}&name=${modelInfo.unitName}Public`);
                    const model = ServerCommunication.serial.toTypeScriptInstance(res.data);
                    loadCallback(model);
                }
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }

    async deleteModelUnit(modelInfo: IModelUnitData ) {
        console.log(`ServerCommunication.deleteModelUnit ${modelInfo.language}/${modelInfo.model}/${modelInfo.unitName}`);
        if (!!modelInfo.unitName && modelInfo.unitName !== "") {
            try {
                const res = await axios.get(`${SERVER_URL}deleteModel?folder=${modelInfo.language}/${modelInfo.model}&name=${modelInfo.unitName}`);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelUnitList(languageName: string, modelName: string, modelListCallback: (names: string[]) => void) {
        console.log("ServerCommunication.loadModelUnitList ");
        try {
            const res = await axios.get(`${SERVER_URL}getModelList?folder=${languageName}/${modelName}`);
            if (!!res) {
                modelListCallback(res.data);
            }
        } catch (e) {
            console.log(e.message);
            LOGGER.error(this, e.toString());
        }
        return [];
    }

}
