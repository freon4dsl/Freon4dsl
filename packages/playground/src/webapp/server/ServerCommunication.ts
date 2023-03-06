import type { FreNamedNode } from "@freon4dsl/core";
import { FreErrorSeverity, FreLogger, FreModelSerializer } from "@freon4dsl/core";
import type { IServerCommunication } from "./IServerCommunication";

const LOGGER = new FreLogger("ServerCommunication"); // .mute();
const modelUnitInterfacePostfix: string = "Public";

const nodePort = process.env.NODE_PORT || 3001;
const SERVER_URL = `http://127.0.0.1:${nodePort}/`;
console.log("NODE_PORT:" + nodePort + "  env " + JSON.stringify(process.env));

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

    onError(errorFunction: (msg: string, severity: FreErrorSeverity) => void) {
        this.giveError = errorFunction;
    }

    giveError = (error: string, severity: FreErrorSeverity): void => {
        console.error(severity + ": " + error);
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
            this.giveError("Name of Unit '" + unitName
                + "' may contain only characters, numbers, '_', or '-', and must start with a character.", FreErrorSeverity.Error);
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
            LOGGER.log(">>>>>> Get model unit");
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}`);
            LOGGER.log("<<<<<< Get model unit");
            if (!!res) {
                try {
                    LOGGER.log("top TS")
                    const unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    loadCallback(unit);
                    LOGGER.log("to TS result: " + unit)
                } catch (e) {
                    LOGGER.error( "ERROR loadModelUnit, " + e.message);
                    this.giveError(e.message, FreErrorSeverity.Error);
                    console.log(e.stack);
                }
            } else {
                LOGGER.log("    result is " + res)
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
                    this.giveError(e.message, FreErrorSeverity.Error);
                }
            }
        }
    }

    async fetchWithTimeout<T>(method: string, params?: string): Promise<T> {
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
        this.giveError(errorMess, FreErrorSeverity.Warning);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, piUnit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit and its interface under the new name
        this.putModelUnit(modelName, newName, piUnit);
        // remove the old unit and interface
        this.deleteModelUnit(modelName, oldName);
    }

}
