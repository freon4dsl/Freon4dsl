import {FreonLayout} from '@freon4dsl/webapp-lib';
import { WebappConfigurator } from "@freon4dsl/webapp-lib";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {StudyConfigurationModelEnvironment} from "@freon4dsl/samples-study-configuration";
WebappConfigurator.getInstance().setEditorEnvironment(StudyConfigurationModelEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
import { ServerCommunication } from "@freon4dsl/core";
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();

/**
 * Now start the app ...
 */
const app = new FreonLayout({
	target: document.body,
});

export default app;
