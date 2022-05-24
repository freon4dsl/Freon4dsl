import type { PiEnvironment } from "@projectit/core";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { ExampleEnvironment } from "@projectit/playground/src/example/config/gen/ExampleEnvironment";
export const editorEnvironment: PiEnvironment = ExampleEnvironment.getInstance();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
