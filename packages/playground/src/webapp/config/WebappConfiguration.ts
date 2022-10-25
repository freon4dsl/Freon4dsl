import type { PiEnvironment } from "@projectit/core";
import { LanguageInitializer } from "../language/LanguageInitializer";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { OctopusEnvironment } from "../../octopus/config/gen/OctopusEnvironment";
export const editorEnvironment: PiEnvironment = OctopusEnvironment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
