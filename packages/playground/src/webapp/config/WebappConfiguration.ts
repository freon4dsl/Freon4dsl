import type { PiEnvironment } from "@projectit/core";
import { LanguageInitializer } from "../language/LanguageInitializer";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";
import { DocuProjectEnvironment } from "../../docu-project/config/gen/DocuProjectEnvironment";
// import { ExampleEnvironment } from "../../example/config/gen/ExampleEnvironment";

/**
 * The one and only reference to the actual language for which this editor runs
 */
export const editorEnvironment: PiEnvironment = DocuProjectEnvironment.getInstance();
LanguageInitializer.initialize();


/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
