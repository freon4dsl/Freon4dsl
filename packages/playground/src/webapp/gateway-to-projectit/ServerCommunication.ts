import { GenericModelSerializer } from "@projectit/core";
import axios from "axios";

import { PiElement } from "@projectit/core";
import { DemoEnvironment } from "../../demo/environment/gen/DemoEnvironment";
import { environment } from "./Environment";

export class ServerCommunication {
    static serial: GenericModelSerializer = new GenericModelSerializer();

    static async putModel(modelName: string) {
        if (modelName !== "" && modelName.match(/^[a-z,A-Z]+$/)) {
            const model = ServerCommunication.serial.convertToJSON(environment.editor.context.rootElement);
            try {
                console.log("putModel");
                const res = await axios.put(`http://127.0.0.1:3001/putModel?name=${modelName}`, model);
            } catch (e) {
                console.log("Error " + e.toString());
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
        console.log("getModel");
        try {
            const res = await axios.get(`http://127.0.0.1:3001/getModel?name=${name}`);
            return res.data;
        } catch (e) {
            console.log("Error " + e.toString());
        }
        return {};
    }

    static async getModelList(): Promise<Object> {
        console.log("getModelList");
        try {
            const res = await axios.get(`http://127.0.0.1:3001/getModelList`);
            return res;
        } catch (e) {
            console.log("Error " + e.toString());
        }
        return {};
    }
}
