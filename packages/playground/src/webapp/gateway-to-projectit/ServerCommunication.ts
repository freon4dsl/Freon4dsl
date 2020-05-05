import { GenericModelSerializer, PiLogger } from "@projectit/core";
import axios from "axios";
import { PiElement } from "@projectit/core";
import { environment, SERVER_URL } from "./Environment";

const LOGGER = new PiLogger("ServerCommunication");

export class ServerCommunication {
    static serial: GenericModelSerializer = new GenericModelSerializer();

    // TODO give model as parameter instead of asking environment
    static async putModel(modelName: string) {
        if (modelName !== "" && modelName.match(/^[a-z,A-Z]+$/)) {
            const model = ServerCommunication.serial.convertToJSON(environment.editor.context.rootElement);
            try {
                const res = await axios.put(`${SERVER_URL}putModel?name=${modelName}`, model);
            } catch (e) {
                LOGGER.error(this, e.toString());
            }
        }
    }

    // Should get callback parameter and not use environment directly.
    static async loadModel(modelName: string) {
        modelName = "qaz";
        if (modelName !== "") {
            const modelJSON = await ServerCommunication.getModel(modelName);
            const model = ServerCommunication.serial.toTypeScriptInstance(modelJSON);
            environment.editor.context.rootElement = model as PiElement;
        }
    }

    private static async getModel(name: string): Promise<Object> {
        try {
            const res = await axios.get(`${SERVER_URL}getModel?name=${name}`);
            return res.data;
        } catch (e) {
            LOGGER.error(this, e.toString());
        }
        return {};
    }

    static async getModelList(): Promise<Object> {
        try {
            const res = await axios.get(`${SERVER_URL}getModelList`);
            return res;
        } catch (e) {
            LOGGER.error(this, e.toString());
        }
        return {};
    }
}
