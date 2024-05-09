import type { FreEnvironment } from "@freon4dsl/core";
import { LanguageInitializer } from "../language/LanguageInitializer";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { LayoutTestsEnvironment } from "../../LayoutTests/config/gen/LayoutTestsEnvironment";
export const editorEnvironment: FreEnvironment = LayoutTestsEnvironment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
