import {FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";


/**
 * The one and only reference to the actual language for which this editor runs
 */
import {ExternalModelEnvironment} from "@freon4dsl/samples-external-tester";
import {ServerCommunication} from "@freon4dsl/core";

WebappConfigurator.getInstance().setEditorEnvironment(ExternalModelEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
// WebappConfigurator.getInstance().setServerCommunication(LionWebRepositoryCommunication.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();

/**
 * Make the custom components known to Freon before starting the app!
 */
import {setCustomComponents} from "@freon4dsl/core-svelte";
import ShowAnimatedGif from "./customComponents/ShowAnimatedGif.svelte";
import SMUI_Card_Component from "./customComponents/SMUI_Card_Component.svelte";
import SMUI_Accordion from "./customComponents/SMUI_Accordion.svelte";
import SMUI_TextField from "./customComponents/SMUI_TextField.svelte";
setCustomComponents([
	{component: ShowAnimatedGif, knownAs: "AnimatedGif"},
	{component: SMUI_Card_Component, knownAs: "SMUI_Card"},
	{component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
	{component: SMUI_TextField, knownAs: "SMUI_TextField"}
]);

/**
 * Now start the app ...
 */
const app = new FreonLayout({
	target: document.body,
});

// FreLogger.unmute("EditorState");
// FreLogger.unmute("ServerCommunication");

export default app;
