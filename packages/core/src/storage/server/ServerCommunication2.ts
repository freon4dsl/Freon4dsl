import { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js";
import { isIdentifier } from "../../util/index.js";
import { collectUsedLanguages, FreLionwebSerializer, FreModelSerializer } from "../index.js";
import { FreErrorSeverity } from "../../validator/index.js";
import { IServerCommunication, FreUnitIdentifier } from "./IServerCommunication.js";

const LOGGER = new FreLogger("ServerCommunication2"); // .mute();

type ParameterType = {
    model?: string,
    unit?: string,
    language?: string
}
export class ServerCommunication2 implements IServerCommunication {
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
    static serial: FreModelSerializer = new FreModelSerializer();
    static lionweb_serial: FreLionwebSerializer = new FreLionwebSerializer();
    static instance: ServerCommunication2;

    static getInstance(): ServerCommunication2 {
        if (!!!ServerCommunication2.instance) {
            ServerCommunication2.instance = new ServerCommunication2();
        }
        return ServerCommunication2.instance;
    }

    static findParams(params: ParameterType) {
        let result = ""
        let first = true
        if (params.model !== undefined) {
            result += `model=${encodeURIComponent(params.model)}`
            first = false
        }
        if (params.unit !== undefined) {
            result += `${(first?"":"&")}unit=${encodeURIComponent(params.unit)}`
            first = false
        }
        if (params.language !== undefined) {
            result += `${(first?"":"&")}language=${encodeURIComponent(params.language)}`
            first = false
        }
        if (result.length > 0) {
            return "?" + result;
        } else {
            return "";
        }
    }

    private _nodePort = 8001; // process.env.NODE_PORT || 8001;
    private _SERVER_IP = `http://127.0.0.1`;
    private _SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;

    onError(msg: string, severity: FreErrorSeverity): void {
        // default implementation
        console.error(`ServerCommunication2 ${severity}: ${msg}`);
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
    async putModelUnit(modelName: string, unitId: FreUnitIdentifier, unit: FreNamedNode): Promise<void> {
        LOGGER.log(`ServerCommunication2.2putModelUnit ${modelName}/${unitId.name}`);
        if (isIdentifier(unitId.name)) {
            const model = ServerCommunication2.lionweb_serial.convertToJSON(unit);
            let output = {
                serializationFormatVersion: "2023.1",
                languages: collectUsedLanguages(model),
                // "__version": "1234abcdef",
                nodes: model,
            };
            await this.putWithTimeout(`putModelUnit`, output, {model:modelName,unit: unitId.name});
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
     * @param unit
     */
    async deleteModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<void> {
        LOGGER.log(`ServerCommunication2.deleteModelUnit ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModelUnit`, {model:modelName, unit: unit.name});
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string): Promise<void> {
        LOGGER.log(`ServerCommunication2.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModel`, { model: modelName });
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    async loadModelList(): Promise<string[]> {
        LOGGER.log(`ServerCommunication2.loadModelList`);
        const language = FreLanguage.getInstance().name
        const res: string[] = await this.fetchWithTimeout<string[]>(`getModelList`, { language: language });
        if (!!res) {
            return res;
        } else {
            return [];
        }
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     */
    async loadUnitList(modelName: string): Promise<FreUnitIdentifier[]> {
        LOGGER.log(`ServerCommunication2.loadUnitList`);
        let modelUnits: string[] = await this.fetchWithTimeout<string[]>(`getUnitList`, {model: modelName });
        if (!!modelUnits) {
            return modelUnits.map((u) => {
                // The information the unit's type is not available. This is not a problem
                // at the moment, because this method is only used in InMemoryModel.
                // Note that whenever this changes, this code may give problems.
                return { name: u, id: u, type: '' };
            });
        } else {
            return [];
        }
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unit
     */
    async loadModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<FreNode> {
        LOGGER.log(`ServerCommunication2.loadModelUnit ${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            const res = await this.fetchWithTimeout<Object>(`getModelUnit`, {model: modelName, unit: unit.name});
            if (!!res) {
                try {
                    let unit: FreNode;
                    if (res["$typename"] === undefined) {
                        unit = ServerCommunication2.lionweb_serial.toTypeScriptInstance(res);
                    } else {
                        unit = ServerCommunication2.serial.toTypeScriptInstance(res);
                    }
                    return unit;
                } catch (e) {
                    LOGGER.error("loadModelUnit, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                    console.log(e.stack);
                }
            }
        }
        return null;
    }

    async fetchWithTimeout<T>(method: string, params: ParameterType): Promise<T> {
        const parameters = ServerCommunication2.findParams(params);
        LOGGER.log("fetchWithTimeout Params = " + parameters);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            LOGGER.log("Input: " + `${this._SERVER_URL}${method}${parameters}`);
            const promise = await fetch(`${this._SERVER_URL}${method}${parameters}`, {
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

    private async putWithTimeout(method: string, data: Object, params: ParameterType) {
        const parameters = ServerCommunication2.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            await fetch(`${this._SERVER_URL}${method}${parameters}`, {
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
        LOGGER.log(`ServerCommunication2.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit and its interface under the new name
        await this.putModelUnit(modelName, { name: newName, id: unit.freId(), type: unit.freLanguageConcept() }, unit);
        // remove the old unit and interface
        await this.deleteModelUnit(modelName, { name: oldName, id: unit.freId(), type: unit.freLanguageConcept() });
    }

    // @ts-ignore
    async createModel(modelName: string): any {
        LOGGER.log(`ServerCommunication2.createModel ${modelName}`)
        const language = FreLanguage.getInstance().name
        await this.putWithTimeout(`putModel`, {}, { model: modelName, language: language });
    }

    // @ts-ignore
    async createModelUnit(modelName: string, unit: FreModelUnit): Promise<void> {
        LOGGER.log(`ServerCommunication2.createModelUnit ${modelName}::${unit.name}`)
        await this.putModelUnit(modelName, { id: unit.freId(), name: unit.name, type: unit.freLanguageConcept() }, unit)
    }
}
