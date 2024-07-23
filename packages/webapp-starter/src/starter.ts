import {FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {InsuranceModelEnvironment} from "@freon4dsl/samples-docuproject";
WebappConfigurator.getInstance().setEditorEnvironment(InsuranceModelEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
import { LionWebRepositoryCommunication, ServerCommunication } from "@freon4dsl/core"
// WebappConfigurator.getInstance().setServerCommunication(LionWebRepositoryCommunication.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();

/**
 * Now start the app ...
 */
const app = new FreonLayout({
	target: document.body,
});

// FreLogger.unmute("EditorState");
// FreLogger.unmute("ServerCommunication");

export default app;
