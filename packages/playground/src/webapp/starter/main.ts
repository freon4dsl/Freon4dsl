import Freonlayout from '../lib/FreonLayout.svelte';
import { WebappConfigurator } from "../lib/WebappConfigurator";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {ExampleEnvironment} from "@freon4dsl/samples-example";
WebappConfigurator.getInstance().setEditorEnvironment(ExampleEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
import { ServerCommunication } from "@freon4dsl/core";
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();

/**
 * Now start the app ...
 */
const app = new Freonlayout({
	target: document.body,
});

export default app;
