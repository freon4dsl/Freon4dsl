import type { IAstChanger } from "../change-manager/IAstChanger.js"
import { AstChanger, AstObserver, ReferenceUpdateManager } from "../change-manager/index.js"
import { type IModelManager, type IServerCommunication, ModelManager } from "../storage/index.js"
import { DummyServerConfiguration } from "../storage/server/DummyServerConfiguration.js"
import { isNullOrUndefined } from "../util/index.js"
import type { FreEnvironment } from "./FreEnvironment.js"

export interface ICoreConfig {
    astObserver: AstObserver
    modelManager: IModelManager
    referenceUpdater: ReferenceUpdateManager
    astChanger: IAstChanger
    server: IServerCommunication
    environment: FreEnvironment
}

export class CoreConfig implements ICoreConfig {
    astObserver: AstObserver
    modelManager: IModelManager
    referenceUpdater: ReferenceUpdateManager
    astChanger: IAstChanger
    server: IServerCommunication
    environment: FreEnvironment
    
    static initialize(env: FreEnvironment, server: IServerCommunication) {
        FREON = new CoreConfig(env, server)
    }
    
    private constructor(env: FreEnvironment, server: IServerCommunication) {
        FREON = this
        this.astObserver = AstObserver.getInstance()
        this.referenceUpdater = ReferenceUpdateManager.getInstance()
        this.astChanger = new AstChanger()
        this.environment = env
        if (isNullOrUndefined(server)) {
            this.server = new DummyServerConfiguration()
        } else {
            this.server = server
        }
        this.modelManager = new ModelManager()
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
}

export let FREON : ICoreConfig = new DummyCoreConfig()
