import { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index";
import { FreLogger } from "../../logging/index";
import { FreLionwebSerializer, FreModelSerializer, FreSerializer } from "../index";
import { FreErrorSeverity } from "../../validator/index";
import { IServerCommunication, ModelUnitIdentifier } from "./IServerCommunication";
import process from "process";

const LOGGER = new FreLogger("ServerCommunication"); // .mute();
const modelUnitInterfacePostfix: string = "Public";

export class ServerCommunication implements IServerCommunication {
    get nodePort(): any {
        return this._nodePort;
    }

    set nodePort(value: any) {
        this._nodePort = value;
        this.SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;
    }

    get SERVER_URL(): string {
        return this._SERVER_URL;
    }

    set SERVER_URL(value: string) {
        this._SERVER_URL = value;
    }
    get SERVER_IP(): string {
        return this._SERVER_IP;
    }

    set SERVER_IP(value: string) {
        this._SERVER_IP = value;
        this.SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;
    }
    static serial: FreSerializer = new FreModelSerializer();
    static lionweb_serial: FreSerializer = new FreLionwebSerializer();
    static instance: ServerCommunication;

    static getInstance(): ServerCommunication {
        if (!!!ServerCommunication.instance) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
    }

    static findParams(params?: string) {
        if (!!params && params.length > 0) {
            return "?" + params;
        } else {
            return "";
        }
    }

    private _nodePort = process.env.NODE_PORT || 8001;
    private _SERVER_IP = `http://127.0.0.1`;
    private _SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;

    onError(msg: string, severity: FreErrorSeverity): void {
        // default implementation
        console.error(`ServerCommunication ${severity}: ${msg}`);
    }

    // @ts-ignore
    // parameters present to adhere to interface
    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
        return null;
    }

    /**
     * Takes 'unit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitId
     * @param unit
     */
    async putModelUnit(modelName: string, unitId: ModelUnitIdentifier, unit: FreNamedNode): Promise<void> {
        LOGGER.log(`ServerCommunication.putModelUnit ${modelName}/${unitId.name}`);
        if (!!unitId.name && unitId.name.length > 0 && unitId.name.match(/^[a-z,A-Z][a-z,A-Z0-9_\-\.]*$/)) {
            const model = ServerCommunication.lionweb_serial.convertToJSON(unit);
            const publicModel = ServerCommunication.lionweb_serial.convertToJSON(unit, true);
            let output = {
                serializationFormatVersion: "2023.1",
                languages: [],
                // "__version": "1234abcdef",
                nodes: model,
            };

            await this.putWithTimeout(`putModelUnit`, output, `folder=${modelName}&name=${unitId.name}`);
            let publicOutput = {
                serializationFormatVersion: "2023.1",
                languages: [],
                // "__version": "1234abcdef",
                nodes: publicModel,
            };
            await this.putWithTimeout(
                `putModelUnit`,
                publicOutput,
                `folder=${modelName}&name=${unitId.name}${modelUnitInterfacePostfix}`,
            );
        } else {
            LOGGER.error(
                "Name of Unit '" +
                    unitId.name +
                    "' may contain only characters, numbers, '_', or '-', and must start with a character.",
            );
            this.onError(
                "Name of Unit '" +
                    unitId.name +
                    "' may contain only characters, numbers, '_', or '-', and must start with a character.",
                FreErrorSeverity.NONE,
            );
        }
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unitName
     */
    async deleteModelUnit(modelName: string, unit: ModelUnitIdentifier): Promise<void> {
        LOGGER.log(`ServerCommunication.deleteModelUnit ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unit.name}`);
            await this.fetchWithTimeout<any>(
                `deleteModelUnit`,
                `folder=${modelName}&name=${unit.name}${modelUnitInterfacePostfix}`,
            );
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string): Promise<void> {
        LOGGER.log(`ServerCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModel`, `folder=${modelName}`);
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(): Promise<string[]> {
        LOGGER.log(`ServerCommunication.loadModelList`);
        const res: string[] = await this.fetchWithTimeout<string[]>(`getModelList`);
        if (!!res) {
            return res;
        } else {
            return [];
        }
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    async loadUnitList(modelName: string): Promise<ModelUnitIdentifier[]> {
        LOGGER.log(`ServerCommunication.loadUnitList`);
        let modelUnits: string[] = await this.fetchWithTimeout<string[]>(`getUnitList`, `folder=${modelName}`);
        // filter out the modelUnitInterfaces
        if (!!modelUnits) {
            modelUnits = modelUnits.filter((name: string) => name.indexOf(modelUnitInterfacePostfix) === -1);
            return modelUnits.map((u) => {
                return { name: u, id: u };
            });
        } else {
            return [];
        }
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unit: ModelUnitIdentifier): Promise<FreNode> {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unit.name}`);
            if (!!res) {
                try {
                    let unit: FreNode;
                    if (res["$typename"] === undefined) {
                        unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(res);
                    } else {
                        unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    }
                    return unit;
                    // loadCallback(unit as FreNamedNode);
                } catch (e) {
                    LOGGER.error("loadModelUnit, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                    console.log(e.stack);
                }
            }
        }
        return null;
    }

    /**
     * Loads the interface of the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnitInterface(
        modelName: string,
        unit: ModelUnitIdentifier,
        loadCallback: (piUnitInterface: FreModelUnit) => void,
    ) {
        LOGGER.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            const res = await this.fetchWithTimeout<Object>(
                `getModelUnit`,
                `folder=${modelName}&name=${unit.name}${modelUnitInterfacePostfix}`,
            );
            if (!!res) {
                try {
                    let unit: FreNode;
                    if (res["$typename"] === undefined) {
                        unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(res);
                    } else {
                        unit = ServerCommunication.serial.toTypeScriptInstance(res);
                    }
                    // const model = ServerCommunication.serial.toTypeScriptInstance(res);
                    loadCallback(unit as FreModelUnit);
                } catch (e) {
                    LOGGER.error("loadModelUnitInterface, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                }
            }
        }
    }

    async fetchWithTimeout<T>(method: string, params?: string): Promise<T> {
        params = ServerCommunication.findParams(params);
        LOGGER.log("fetchWithTimeout Params = " + params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            LOGGER.log("Input: " + `${this._SERVER_URL}${method}${params}`);
            const promise = await fetch(`${this._SERVER_URL}${method}${params}`, {
                signal: controller.signal,
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            clearTimeout(timeoutId);
            return await promise.json();
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
            await fetch(`${this._SERVER_URL}${method}${params}`, {
                signal: controller.signal,
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            clearTimeout(timeoutId);
        } catch (e) {
            this.handleError(e);
        }
    }

    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${this._SERVER_URL}.`;
        }
        LOGGER.error(errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode): Promise<void> {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit and its interface under the new name
        this.putModelUnit(modelName, { name: newName, id: unit.freId() }, unit);
        // remove the old unit and interface
        this.deleteModelUnit(modelName, { name: unit.name, id: unit.freId() });
    }

    // @ts-ignore
    createModel(modelName: string): any {}

    // @ts-ignore
    createModelUnit(modelName: string, unit: FreModelUnit): Promise<void> {
        return Promise.resolve(undefined);
    }
}
