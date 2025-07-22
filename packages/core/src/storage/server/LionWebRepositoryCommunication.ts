import { RepositoryClient } from "@lionweb/repository-client";
import type { ClientResponse, ListPartitionsResponse } from "@lionweb/repository-client";
import type { FreModelUnit, FreNamedNode, FreNode } from "../../ast/index.js";
import { FreLogger } from "../../logging/index.js";
import { createLionWebJsonNode, FreLionwebSerializer } from "../index.js";
import type { FreSerializer } from "../index.js";
import { FreErrorSeverity } from "../../validator/index.js";
import type { IServerCommunication, FreUnitIdentifier } from "./IServerCommunication.js";
import { collectUsedLanguages } from "./UsedLanguages.js";
import { FreLanguage } from '../../language/index.js';

const LOGGER = new FreLogger("LionWebRepositoryCommunication");

export class LionWebRepositoryCommunication implements IServerCommunication {
    client = new RepositoryClient("Freon", "default");
    lionweb_serial: FreSerializer = new FreLionwebSerializer();
    static instance: LionWebRepositoryCommunication;

    static getInstance(): LionWebRepositoryCommunication {
        if (!!!LionWebRepositoryCommunication.instance) {
            LionWebRepositoryCommunication.instance = new LionWebRepositoryCommunication();
        }
        return LionWebRepositoryCommunication.instance;
    }

    constructor() {
        this.client.loggingOn = true;
    }

    private _nodePort = 3005; // process.env.NODE_PORT || 3005;
    private _SERVER_IP = `http://127.0.0.1`;
    private _SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;

    onError(msg: string, severity: FreErrorSeverity): void {
        // default implementation
        console.error(`LionWebRepositoryCommunication ${severity}: ${msg}`);
    }

    // TODO fix callback
    // @ts-ignore
    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
        const ids = await this.client.bulk.ids(quantity);
        return ids.body.ids;
    }

    async createModelUnit(modelName: string, unit: FreModelUnit): Promise<void> {
        const jsonUnit = this.lionweb_serial.convertToJSON(unit); // as LionWebJsonNode[];
        // extract the root only to create a partition in the repository
        const rootNode = createLionWebJsonNode();
        rootNode.classifier = jsonUnit[0].classifier;
        rootNode.id = jsonUnit[0].id;
        let partition = {
            serializationFormatVersion: "2023.1",
            languages: collectUsedLanguages([rootNode]),
            nodes: [rootNode],
        };
        const partitionResult = await this.client.bulk.createPartitions(partition);
        LOGGER.log("createpartition result is " + JSON.stringify(partitionResult));
        let output = {
            serializationFormatVersion: "2023.1",
            languages: collectUsedLanguages(jsonUnit),
            nodes: jsonUnit,
        };
        this.client.repository = modelName;
        const requestResult = await this.client.bulk.store(output);
        LOGGER.log("CREATE MODEL UNIT " + JSON.stringify(requestResult));
    }

    /**
     * Takes 'unit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitIdentifier
     * @param unit
     */
    async saveModelUnit(modelName: string, unitIdentifier: FreUnitIdentifier, unit: FreNamedNode) {
        LOGGER.log(`LionWebRepositoryCommunication.saveModelUnit ${modelName}/${unitIdentifier.name}`);
        if (
            !!unitIdentifier.name &&
            unitIdentifier.name.length > 0 &&
            unitIdentifier.name.match(/^[a-z,A-Z][a-z,A-Z0-9_\-.]*$/)
        ) {
            const model = this.lionweb_serial.convertToJSON(unit);
            const usedLanguages = collectUsedLanguages(model);
            let output = {
                serializationFormatVersion: "2023.1",
                languages: usedLanguages,
                nodes: model,
            };
            this.client.repository = modelName;
            /* const requestResult = */ await this.client.bulk.store(output);
        } else {
            LOGGER.error(
                "Name of Unit '" +
                    unitIdentifier.name +
                    "' may contain only characters, numbers, '_', or '-', and must start with a character.",
            );
            this.onError(
                "Name of Unit '" +
                    unitIdentifier.name +
                    "' may contain only characters, numbers, '_', or '-', and must start with a character.",
                FreErrorSeverity.NONE,
            );
        }
    }

    async createModel(modelName: string): Promise<any> {
        await this.client.dbAdmin.createRepository(modelName, false);
        this.client.repository = modelName;
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unit
     */
    async deleteModelUnit(modelName: string, unit: FreUnitIdentifier) {
        LOGGER.log(`LionWebRepositoryCommunication.deleteModelUnit ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            this.client.repository = modelName;
            await this.client.bulk.deletePartitions([unit.id]);
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string) {
        LOGGER.log(`LionWebRepositoryCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.client.dbAdmin.deleteRepository(modelName);
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     */
    async loadModelList(): Promise<string[]> {
        LOGGER.log(`loadModelList`);
        const repos = await this.client.dbAdmin.listRepositories();
        const res = repos.body.repositoryNames;
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
        LOGGER.log(`loadUnitList`);
        this.client.repository = modelName;
        let modelUnits: ClientResponse<ListPartitionsResponse> = await this.client.bulk.listPartitions();
        return modelUnits.body.chunk.nodes.map((n) => {
            return { name: "name " + n.id, id: n.id, type: FreLanguage.getInstance().classifierByKey(n.classifier.key).typeName };
        });
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unit
     * @return the loaded in memory modelunit
     */
    async loadModelUnit(modelName: string, unit: FreUnitIdentifier): Promise<FreNode> {
        LOGGER.log(`loadModelUnit ${unit.name}`);
        this.client.repository = modelName;
        if (!!unit.name && unit.name.length > 0) {
            const res = await this.client.bulk.retrieve([unit.id]);
            if (!!res) {
                try {
                    LOGGER.log(JSON.stringify(res, null, 2));
                    let unit = this.lionweb_serial.toTypeScriptInstance(res.body.chunk);
                    return unit as FreNode;
                } catch (e) {
                    LOGGER.error("loadModelUnit, " + e.message + e.stack);
                    this.onError(e.message, FreErrorSeverity.NONE);
                }
            }
        }
        return null;
    }


    // @ts-ignore
    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${this._SERVER_URL}.`;
        }
        LOGGER.error(errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode) {
        LOGGER.log(`renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        this.client.repository = modelName;
        // put the unit and its interface under the new name
        await this.saveModelUnit(modelName, { name: newName, id: unit.freId(), type: unit.freLanguageConcept() }, unit);
        // remove the old unit and interface
        await this.deleteModelUnit(modelName, { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() });
    }
}
