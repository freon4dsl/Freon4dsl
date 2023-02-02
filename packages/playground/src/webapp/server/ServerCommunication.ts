import { FreLogger } from "@freon4dsl/core";
import type { FreNamedNode } from "@freon4dsl/core";
import { FreModelSerializer } from "@freon4dsl/core";
import type { IServerCommunication } from "./IServerCommunication";
import { setUserMessage } from "../components/stores/UserMessageStore";

const LOGGER = new FreLogger("ServerCommunication"); // .mute();
const modelUnitInterfacePostfix: string = "Public";

const node_port = process.env.NODE_PORT || 3001;
const SERVER_URL = `http://127.0.0.1:${node_port}/`;
console.log("NODE_PORT:" + node_port+ "  env " + JSON.stringify(process.env));


export class ServerCommunication implements IServerCommunication {
    static serial: FreModelSerializer = new FreModelSerializer();
    static instance: ServerCommunication;

    static getInstance(): ServerCommunication {
        if (!(!!ServerCommunication.instance)) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
    }

    private static findParams(params?: string) {
        if (!!params && params.length > 0) {
            return "?" + params;
        } else {
            return "";
        }
    }

    /**
     * Takes 'piUnit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitName
     * @param piUnit
     */
    async putModelUnit(modelName: string, unitName: string, piUnit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.putModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0 && unitName.match(/^[a-z,A-Z][a-z,A-Z0-9_\-]*$/)) {
            const model = ServerCommunication.serial.convertToJSON(piUnit);
            const publicModel = ServerCommunication.serial.convertToJSON(piUnit, true);
            await this.putWithTimeout(`putModelUnit`, model, `folder=${modelName}&name=${unitName}` );
            await this.putWithTimeout(
                `putModelUnit`,
                publicModel,
                `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`
            );
        } else {
            LOGGER.error( "Name of Unit '" + unitName + "' may contain only characters, numbers, '_', or '-', and must start with a character.");
        }
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unitName
     */
    async deleteModelUnit(modelName: string, unitName: string) {
        LOGGER.log(`ServerCommunication.deleteModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}`);
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string ) {
        LOGGER.log(`ServerCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModel`, `folder=${modelName}`);
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadModelList`);
        const res: string[] = await this.fetchWithTimeout<string[]>(`getModelList`);
        if (!!res) {
            modelListCallback(res);
        } else {
            modelListCallback([]);
        }
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    async loadUnitList(modelName: string, modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadUnitList`);
        let modelUnits: string[] = await this.fetchWithTimeout<string[]>(`getUnitList`, `folder=${modelName}`);
        // filter out the modelUnitInterfaces
        if (!!modelUnits) {
            modelUnits = modelUnits.filter( (name: string) => name.indexOf(modelUnitInterfacePostfix) === -1 );
            modelListCallback(modelUnits);
        } else {
            modelListCallback([]);
        }
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: FreNamedNode) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}`);
            if (!!res) {
                try {
                    const unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    loadCallback(unit);
                } catch (e) {
                    LOGGER.error( "loadModelUnit, " + e.message);
                    setUserMessage(e.message);
                    console.log(e.stack);
                }
            }
        }
    }

    /**
     * Loads the interface of the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnitInterface: FreNamedNode) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
            if (!!res) {
                try {
                    const model = ServerCommunication.serial.toTypeScriptInstance(res);
                    loadCallback(model);
                } catch (e) {
                    LOGGER.error( "loadModelUnitInterface, " + e.message);
                    setUserMessage(e.message);
                }
            }
        }
    }

    private async fetchWithTimeout<T>(method: string, params?: string): Promise<T> {
        params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const promise = await fetch(
                `${SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                }
            });
            clearTimeout(timeoutId);
            return await promise.json() ;
        } catch (e) {
            this.handleError(e);
        }
        return null;
    }

    private async putWithTimeout(method: string, data: Object, params?: string) {
        params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            await fetch(
                `${SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "put",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
            clearTimeout(timeoutId);
        } catch (e) {
            this.handleError(e);
        }
    }

    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${SERVER_URL}.`;
        }
        LOGGER.error( errorMess);
        setUserMessage(errorMess);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, piUnit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit and its interface under the new name
        this.putModelUnit(modelName, newName, piUnit);
        // remove the old unit and interface
        this.deleteModelUnit(modelName, oldName);
    }

}
