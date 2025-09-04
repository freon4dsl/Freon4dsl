import type { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js";
import { FreLogger } from "../../logging/index.js";
import { isIdentifier } from "../../util/index.js"
import { collectUsedLanguages, FreLionwebSerializer, FreModelSerializer, type ServerResponse, type VoidServerResponse } from "../index.js"
import { FreErrorSeverity } from "../../validator/index.js";
import type { IServerCommunication, FreUnitIdentifier } from "./IServerCommunication.js";

const LOGGER = new FreLogger("ServerCommunication"); // .mute();

export type ParameterType = {
    model?: string,
    unit?: string,
    language?: string,
    version?: string
}

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
    static serial: FreModelSerializer = new FreModelSerializer();
    static lionweb_serial: FreLionwebSerializer = new FreLionwebSerializer();
    static instance: ServerCommunication;

    static getInstance(): ServerCommunication {
        if (!!!ServerCommunication.instance) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
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
        if (params.version !== undefined) {
            result += `${(first?"":"&")}version=${encodeURIComponent(params.version)}`
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
        console.error(`ServerCommunication ${severity}: ${msg}`);
    }

    // @ts-ignore
    // parameters present to adhere to interface
    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<ServerReturn<string[]>> {
        return null;
    }

    /**
     * Takes 'unit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitId
     * @param unit
     */
    async saveModelUnit(modelName: string, unitId: FreUnitIdentifier, unit: FreNamedNode): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.saveModelUnit ${modelName}/${unitId.name}`);
        if (isIdentifier(unitId.name)) {
            const model = ServerCommunication.lionweb_serial.convertToJSON(unit);
            let output = {
                serializationFormatVersion: "2023.1",
                languages: collectUsedLanguages(model),
                nodes: model,
            };
            const response = await this.saveWithTimeout(`saveModelUnit`, output, {model:modelName,unit: unitId.name})
            if (response.errors.length > 0) {
                response.errors[0] = `Server cannot save unit '${unitId.name}' (${response.errors[0]})`
            }
            return response
        } else {
            const msg = "Name of Unit '" +
                unitId.name +
                "' may contain only characters, numbers, '_', or '-', and must start with a character."
            LOGGER.error(msg);
            this.onError(msg, FreErrorSeverity.NONE)
            return {
                errors: [msg]
            }
        }
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unit
     */
    async deleteModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.deleteModelUnit ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            const response = await this.getWithTimeout<any>(`deleteModelUnit`, {model:modelName, unit: unit.name});
            if (response.errors.length > 0) {
                response.errors[0] = `Server cannot delete model unit '${unit.name}' (${response.errors[0]})`
            }
            return response
        }
        return { errors: [] }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            const response = await this.getWithTimeout<any>(`deleteModel`, { model: modelName });
            if (response.errors.length > 0) {
                response.errors[0] = `Server cannot delete model '${modelName}' (${response.errors[0]})`
            }
            return response
        }
        return { errors: [] }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    async loadModelList(): Promise<ServerResponse<string[]>> {
        LOGGER.log(`ServerCommunication.loadModelList`);
        const language = FreLanguage.getInstance().name
        const version = FreLanguage.getInstance().languageVersion
        const response: ServerResponse<string[]> = await this.getWithTimeout<string[]>(`getModelList`, { language: language, version: version });
        if (response.errors.length > 0) {
            response.errors[0] = `Server error: cannot retrieve list of models (${response.errors[0]})`
        }
        return response
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     */
    async loadUnitList(modelName: string): Promise<ServerResponse<FreUnitIdentifier[]>> {
        LOGGER.log(`ServerCommunication.loadUnitList`);
        let response = await this.getWithTimeout<string[]>(`getUnitList`, {model: modelName });
        if (response.errors.length > 0) {
            return {
                result: null,
                errors: [`Server error: cannot retrieve list of modelunits (${response.errors[0]})`]
            }
        } else {
            const units = response.result.map((u) => {
                // The information the unit's type is not available. This is not a problem
                // at the moment, because this method is only used in InMemoryModel.
                // Note that whenever this changes, this code may give problems.
                return { name: u, id: u, type: '' };
            });
            return {
                result: units,
                errors: []
            }
        }
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unit
     */
    async loadModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<ServerResponse<FreNode>> {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            const response = await this.getWithTimeout<Object>(`getModelUnit`, {model: modelName, unit: unit.name});
            if (response.errors.length > 0) {
                return {
                    result: null,
                    errors: [`Server error: cannot load modelunit '${unit.name}' (${response.errors[0]})`]
                }
            } else {
                try {
                    let unit: FreNode;
                    if (response["$typename"] === undefined) {
                        unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(response.result);
                    } else {
                        // Old internal Freon formast
                        unit = ServerCommunication.serial.toTypeScriptInstance(response.result);
                    }
                    return {
                        result: unit,
                        errors: []
                    }
                } catch (e) {
                    LOGGER.error("loadModelUnit, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                    console.log(e.stack);
                    return {
                        result: null,
                        errors: [e["message"]]
                    }
                }
            }
        } else {
            return {
                result: null,
                errors: [`Cannot load modelunit: name is empty`]
            }
        }
    }

    async getWithTimeout<T>(method: string, params: ParameterType): Promise<ServerResponse<T>> {
        const parameters = ServerCommunication.findParams(params);
        LOGGER.log("getWithTimeout Params = " + parameters);
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
            if (promise.status >= 200 && promise.status < 300) {
                LOGGER.log("getWithTimeout ok")
                return  {
                    result: await promise.json(),
                    errors: []
                }
            } else {
                // error
                LOGGER.log("getWithTimeout error")
                throw new Error(await promise.json())
            }
        } catch (e) {
            this.handleError(e);
            return {
                result: undefined,
                errors: [e["message"]]
            }
        }
        return void 0;
    }

    private async saveWithTimeout(method: string, data: Object, params: ParameterType): Promise<VoidServerResponse> {
        const parameters = ServerCommunication.findParams(params);
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
            return {
                errors: [e["message"]]
            }
        }
        return {  errors: [] }
    }

    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${this._SERVER_URL}.`;
        }
        LOGGER.error("handleError: " + errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        // put the unit under the new name
        await this.saveModelUnit(modelName, { name: newName, id: unit.freId(), type: unit.freLanguageConcept() }, unit);
        // remove the old unit
        await this.deleteModelUnit(modelName, { name: oldName, id: unit.freId(), type: unit.freLanguageConcept() });
        return { errors: [] }
    }

    // @ts-ignore
    async createModel(modelName: string): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.createModel ${modelName}`)
        const language = FreLanguage.getInstance().name
        const version = FreLanguage.getInstance().languageVersion
        const response = await this.saveWithTimeout(`saveModel`, {}, { model: modelName, language: language, version: version });
        if (response.errors.length > 0) {
            response.errors[0] = `Server cannot create model '${modelName}' (${response.errors[0]})`
        }
        return response
    }

    // @ts-ignore
    async createModelUnit(modelName: string, unit: FreModelUnit): Promise<VoidServerResponse> {
        LOGGER.log(`ServerCommunication.createModelUnit ${modelName}::${unit.name}`)
        const response = await this.saveModelUnit(modelName, { id: unit.freId(), name: unit.name, type: unit.freLanguageConcept() }, unit)
        if (response.errors.length > 0) {
            response.errors[0] = `Server cannot create model unit'${unit.name}' (${response.errors[0]})`
        }
        return response
    }
}
