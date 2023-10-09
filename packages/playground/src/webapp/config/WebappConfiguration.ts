import { ServerCommunication } from "@freon4dsl/core";
import type { FreEnvironment, IServerCommunication } from "@freon4dsl/core";
import { LanguageInitializer } from "../language/LanguageInitializer";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { EducationEnvironment } from "../../Education/config/gen/EducationEnvironment";
export const editorEnvironment: FreEnvironment = EducationEnvironment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
