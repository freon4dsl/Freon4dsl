import { FreNamedNode, FreNode } from "../../ast/index";
import { FreLogger } from "../../logging/index";
import { FreLionwebSerializer } from "../index";
import { FreErrorSeverity } from "../../validator/index";
import { IServerCommunication, ModelUnitIdentifier } from "./IServerCommunication";
import { ServerCommunication } from "./ServerCommunication";
import process from "process";

const LOGGER = new FreLogger("LionWebCommunication"); // .mute();

const lionWebPort = process?.env.LIONWEB_PORT || 63320;
const SERVER_URL = `http://127.0.0.1:${lionWebPort}`;
// console.log("NODE_PORT:" + lionWebPort+ "  env " + JSON.stringify(process.env));

const modelName = "r:5dda8fb0-8c78-4ed5-8c46-0eb8c112a60a(import_from_json.properties.instance)";
const projectName = "mps-meetup-2023";
const modelPath = `/lionweb/bulk?modelRef=${modelName}&project=${projectName}`;

export class LionWebCommunicationWithMPS extends ServerCommunication implements IServerCommunication {
    // static converterLionWeb = new Freon2LionWebConverter();
    static instanceLionWeb: LionWebCommunicationWithMPS;

    static getInstance(): LionWebCommunicationWithMPS {
        if (!!!LionWebCommunicationWithMPS.instanceLionWeb) {
            LionWebCommunicationWithMPS.instanceLionWeb = new LionWebCommunicationWithMPS();
        }
        return LionWebCommunicationWithMPS.instanceLionWeb;
    }

    onError(msg: string, severity: FreErrorSeverity): void {
        // default implementation
        console.error(`ServerCommunication ${severity}: ${msg}`);
    }

    async loadModelList(): Promise<string[]> {
        return [modelName];
    }

    // @ts-ignore
    async loadUnitList(modelName: string): Promise<ModelUnitIdentifier[]> {
        return [];
    }

    // @ts-ignore
    // todo reimplement with use of callback or change signature
    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
        LOGGER.log(`generateIds ${quantity}`);
        let result = ["10000", "10010", "10020", "10030", "10040"];
        // callback(result)
        return result;
        // const ids = await this.postWithTimeoutLionWeb(`lionweb-json/default/generate-ids`, null,`?quantity=${quantity}`);
        // if (!!ids) {
        //      try {
        //          return ids["freeIds"];
        //         // callback(ids["freeIds"]);
        //     } catch (e) {
        //         LOGGER.error( "generateIds, " + e.message);
        //         setUserMessage(e.message);
        //         console.log(e.stack);
        //     }
        // }
        // return [];
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    // @ts-ignore
    // parameter present to adhere to interface
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: FreNamedNode) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res = await this.fetchWithTimeout<Object>(modelPath, ``);
            if (!!res) {
                try {
                    const serializer = new FreLionwebSerializer();
                    const unit = serializer.toTypeScriptInstance(res);
                    //TODO: Hardcoded to avoid empty default property for units
                    unit["name"] = "PropertyRoot";
                    return unit;
                    // loadCallback(unit as FreNamedNode);
                } catch (e) {
                    LOGGER.error("loadModelUnit, " + e.message);
                    this.onError("loadModelUnit: " + e.message, FreErrorSeverity.Error);
                    console.log(e.stack);
                }
            }
        }
        return null;
    }

    // @ts-ignore
    // parameter present to adhere to interface
    async putModelUnit(modelName: string, unitIdentifier: ModelUnitIdentifier, unit: FreNode) {
        console.log("unit", unit);
        if (!!unitIdentifier.name && unitIdentifier.name.length > 0 && !!unit) {
            try {
                const serializer = new FreLionwebSerializer();
                const lionWebNodes = serializer.convertToJSON(unit);
                console.log("lionWebNodes", lionWebNodes);
                let output = {
                    serializationFormatVersion: "2023.1",
                    languages: [],
                    // "__version": "1234abcdef",
                    nodes: lionWebNodes,
                };
                await this.postWithTimeoutLionWeb(modelPath, output, "");
            } catch (e) {
                LOGGER.error("loadModelUnit, " + e.message);
                this.onError("loadModelUnit: " + e.message, FreErrorSeverity.Error);
                console.log(e.stack);
            }
        }
    }

    // renameModelUnit(modelName: string, oldName: string, newName: string, piUnit: FreNamedNode) {
    // }

    override async fetchWithTimeout<T>(path: string, params?: string): Promise<T> {
        // params = ServerCommunication.findParams(params);
        console.log(`LIONWEB FETCHG: ${SERVER_URL}${path}${params}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const promise = await fetch(`${SERVER_URL}${path}${params}`, {
                signal: controller.signal,
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            clearTimeout(timeoutId);
            return await promise.json();
        } catch (e) {
            this.handleErrorLionWeb(e);
        }
        return null;
    }

    private async postWithTimeoutLionWeb(path: string, data: Object, params?: string): Promise<any> {
        // params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const answer = await fetch(`${SERVER_URL}${path}${params}`, {
                signal: controller.signal,
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            clearTimeout(timeoutId);
            return await answer.json();
        } catch (e) {
            this.handleErrorLionWeb(e);
        }
    }

    private handleErrorLionWeb(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${SERVER_URL}.`;
        }
        LOGGER.error(errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }
}
