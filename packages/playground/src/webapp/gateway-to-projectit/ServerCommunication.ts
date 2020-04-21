import { GenericModelSerializer, PiLogger } from "@projectit/core";
import axios from "axios";
import { PiElement } from "@projectit/core";
import { environment } from "./Environment";

const LOGGER = new PiLogger("ServerCommunication");
const url = "http://127.0.0.1:3001/";

export class ServerCommunication {
    static serial: GenericModelSerializer = new GenericModelSerializer();

    static async putModel(modelName: string) {
        if (modelName !== "" && modelName.match(/^[a-z,A-Z]+$/)) {
            const model = ServerCommunication.serial.convertToJSON(environment.editor.context.rootElement);
            try {
                const res = await axios.put(`${url}putModel?name=${modelName}`, model);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }

    static async loadModel(modelName: string) {
        modelName = "qaz";
        if (modelName !== "") {
            const modelJSON = await ServerCommunication.getModel(modelName);
            const model = ServerCommunication.serial.toTypeScriptInstance(modelJSON);
            environment.editor.context.rootElement = model as PiElement;
        }
    }

    static async getModel(name: string): Promise<Object> {
        try {
            const res = await axios.get(`${url}getModel?name=${name}`);
            return res.data;
        } catch (e) {
            LOGGER.error(this, e.toString());
        }
        return {};
    }

    static async getModelList(): Promise<Object> {
        try {
            const res = await axios.get(`${url}getModelList`);
            return res;
        } catch (e) {
            LOGGER.error(this, e.toString());
        }
        return {};
    }
}
