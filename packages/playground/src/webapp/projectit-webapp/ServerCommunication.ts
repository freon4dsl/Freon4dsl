import { GenericModelSerializer, PiLogger, PiNamedElement } from "@projectit/core";
import axios from "axios";
import { SERVER_URL } from "../WebappConfiguration";
import { IModelUnitData, IServerCommunication } from "./IServerCommunication";

const LOGGER = new PiLogger("ServerCommunication"); // TODO show errors to user
const ModelUnitInterfacePostfix: string = "Public";

// TODO remove interface IModelUnitData

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
     * Takes 'piUnit' and stores it under 'modelName' on the server at SERVER_URL.
     * 'modelInfo.unitName' must start with a character and contain only characters and/or numbers.
     * @param modelInfo
     * @param piUnit
     */
    async putModelUnit(modelInfo: IModelUnitData, piUnit: PiNamedElement) {
        // console.log(`ServerCommunication.putModelUnit ${modelInfo.modelName}/${modelInfo.unitName}`);
        if (!!modelInfo.unitName && modelInfo.unitName !== "" && modelInfo.unitName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
            const model = ServerCommunication.serial.convertToJSON(piUnit);
            const publicModel = ServerCommunication.serial.convertToJSON(piUnit, true);
            try {
                const res1 = await axios.put(`${SERVER_URL}putModelUnit?folder=${modelInfo.modelName}&name=${modelInfo.unitName}`, model);
                const res2 = await axios.put(`${SERVER_URL}putModelUnit?folder=${modelInfo.modelName}&name=${modelInfo.unitName}${ModelUnitInterfacePostfix}`, publicModel);
            } catch (e) {
                LOGGER.error(this, "line 36, " + e.toString());
            }
        } else {
            LOGGER.error(this, "Name of Model '" + modelInfo.modelName + "' may contain only characters and numbers, and must start with a character.");
        }
    }

    async deleteModelUnit(modelInfo: IModelUnitData ) {
        // console.log(`ServerCommunication.deleteModelUnit ${modelInfo.modelName}/${modelInfo.unitName}`);
        if (!!modelInfo.unitName && modelInfo.unitName !== "") {
            try {
                const res1 = await axios.get(`${SERVER_URL}deleteModelUnit?folder=${modelInfo.modelName}&name=${modelInfo.unitName}`);
                const res2 = await axios.get(`${SERVER_URL}deleteModelUnit?folder=${modelInfo.modelName}&name=${modelInfo.unitName}${ModelUnitInterfacePostfix}`);
            } catch (e) {
                LOGGER.error(this, "line 50, " + e.toString());
            }
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        // console.log(`ServerCommunication.loadModelList`);
        try {
            const models = await axios.get(`${SERVER_URL}getModelList`);
            modelListCallback(models.data);
        } catch (e) {
            console.log(e.message);
            LOGGER.error(this, "line 66, " + e.toString());
        }
    }

    /**
     * Reads the list of units in a model available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadUnitList(modelName: string, modelListCallback: (names: string[]) => void) {
        // console.log(`ServerCommunication.loadUnitList`);
        try {
            let result: string[] = [];
            const modelUnits = await axios.get(`${SERVER_URL}getUnitList?folder=${modelName}`);
            // filter out the modelUnitInterfaces
            if (!!modelUnits) {
                result = modelUnits.data.filter( (name: string) => name.indexOf(ModelUnitInterfacePostfix) === -1)
            }
            modelListCallback(result);
        } catch (e) {
            console.log(e.message);
            LOGGER.error(this, "line 86, " + e.toString());
        }
    }

    /**
     * Reads the model with unitName 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param modelName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: PiNamedElement) => void) {
        // console.log(`ServerCommunication.loadModelUnit ${unitName}`);
        if (!!unitName && unitName !== "") {
            try {
                const res = await axios.get(`${SERVER_URL}getModelUnit?folder=${modelName}&name=${unitName}`);
                const model = ServerCommunication.serial.toTypeScriptInstance(res.data);
                loadCallback(model);
            } catch (e) {
                LOGGER.error(this, "line 104, " + e.toString());
            }
        }
    }

    async loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnitInterface: PiNamedElement) => void) {
        // console.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unitName}`);
        if (!!unitName && unitName !== "") {
            try {
                const res = await axios.get(`${SERVER_URL}getModelUnit?folder=${modelName}&name=${unitName}${ModelUnitInterfacePostfix}`);
                const model = ServerCommunication.serial.toTypeScriptInstance(res.data);
                loadCallback(model);
            } catch (e) {
                LOGGER.error(this, "line 117, " + e.toString());
            }
        }
    }
}
