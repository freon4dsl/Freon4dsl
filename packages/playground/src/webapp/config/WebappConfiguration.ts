import type { FreEnvironment, IServerCommunication } from "@freon4dsl/core";
import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import { LanguageInitializer } from "../language/LanguageInitializer";
// import { ServerCommunication } from "@freon4dsl/core";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { ExampleEnvironment } from "../../Example/config/gen/ExampleEnvironment";
export const editorEnvironment: FreEnvironment = ExampleEnvironment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
// export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
export const serverCommunication: IServerCommunication = LionWebRepositoryCommunication.getInstance();
