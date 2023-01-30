import type { PiEnvironment } from "@projectit/core";
import { LanguageInitializer } from "../language/LanguageInitializer";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { SLE2022Environment } from "../../SLE2022/config/gen/SLE2022Environment";
export const editorEnvironment: PiEnvironment = SLE2022Environment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
