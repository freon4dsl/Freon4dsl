import type { IAstChanger } from "../change-manager/IAstChanger.js"
import { AstChanger, AstObserver, ReferenceUpdateManager } from "../change-manager/index.js"
import { DeltaModelManager } from "../storage/DeltaModelManager.js"
import { type IModelManager, type IServerCommunication, LionwebDeltaIdProvider, ModelManager } from "../storage/index.js"
import { type FreonDeltaClient } from "../storage/lionweb-delta/FreonDeltaClient.js"
import { type IdProvider, notNullOrUndefined, SimpleIdProvider } from "../util/index.js"
import type { FreEnvironment } from "./FreEnvironment.js"

export interface ICoreConfig {
    astObserver: AstObserver
    modelManager: IModelManager
    referenceUpdater: ReferenceUpdateManager
    astChanger: IAstChanger
    server: IServerCommunication
    environment: FreEnvironment
    deltaClient: FreonDeltaClient
    idProvider: IdProvider

    usesDelta(): boolean;
}

export class CoreConfig implements ICoreConfig {
    astObserver: AstObserver
    modelManager: IModelManager
    referenceUpdater: ReferenceUpdateManager
    astChanger: IAstChanger
    server: IServerCommunication
    environment: FreEnvironment
    deltaClient: FreonDeltaClient
    idProvider: IdProvider

    static initialize(env: FreEnvironment, server: IServerCommunication) {
        FREON = new CoreConfig(env, server, undefined)
    }

    static initializeWithDeltaServer(env: FreEnvironment, deltaClient: FreonDeltaClient) {
        FREON = new CoreConfig(env, undefined, deltaClient)
    }

    static async initializeWithServers(env: FreEnvironment, server: IServerCommunication, deltaClient: FreonDeltaClient) {
        await deltaClient.connect()
        FREON = new CoreConfig(env, undefined, deltaClient)
        FREON.server = server
    }

    private constructor(env: FreEnvironment, server: IServerCommunication, deltaClient: FreonDeltaClient) {
        FREON = this
        this.astObserver = AstObserver.getInstance()
        this.referenceUpdater = ReferenceUpdateManager.getInstance()
        this.astChanger = new AstChanger()
        this.environment = env
        // if (isNullOrUndefined(server)) {
        //     this.server = new DummyServerConfiguration()
        // } else {
        this.server = server
        // }
        this.deltaClient = deltaClient
        if (notNullOrUndefined(deltaClient)) {
            this.modelManager = new DeltaModelManager()
            this.idProvider = new LionwebDeltaIdProvider()
        } else {
            this.modelManager = new ModelManager()
            this.idProvider = new SimpleIdProvider("ID-")
        }
    }

    usesDelta(): boolean {
        return this.deltaClient !== undefined
    }
}

export class DummyCoreConfig implements ICoreConfig {
    get astObserver(): AstObserver {
        throw new Error("DummyCoreConfig.astObserver: FREON is still a dummy")
    }
    get modelManager(): ModelManager {
        throw new Error("DummyCoreConfig.modelManager: FREON is still a dummy")
    }
    get referenceUpdater(): ReferenceUpdateManager {
        throw new Error("DummyCoreConfig.referenceUpdater: FREON is still a dummy")
    }
    get astChanger(): IAstChanger {
        throw new Error("DummyCoreConfig.astChanger: FREON is still a dummy")
    }
    get server(): IServerCommunication {
        throw new Error("DummyCoreConfig.server: FREON is still a dummy")
    }
    get environment(): FreEnvironment {
        throw new Error("DummyCoreConfig.environment: FREON is still a dummy")
    }
    get deltaClient(): FreonDeltaClient {
        throw new Error("DummyCoreConfig.deltaClient: FREON is still a dummy")
    }
    get idProvider(): IdProvider {
        throw new Error("DummyCoreConfig.idProvider: FREON is still a dummy")
    }
    usesDelta(): boolean {
        throw new Error("DummyCoreConfig.usesDelta: FREON is still a dummy")
    }
}

export let FREON : ICoreConfig = new DummyCoreConfig()
