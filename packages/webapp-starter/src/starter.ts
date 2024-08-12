import {FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";
import {ServerCommunication} from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import {setCustomComponents} from "@freon4dsl/core-svelte";
import ShowAnimatedGif from "./customComponents/ShowAnimatedGif.svelte";
import SMUI_Card_Component from "./customComponents/SMUI_Card_Component.svelte";
import SMUI_Accordion from "./customComponents/SMUI_Accordion.svelte";
import SMUI_Dialog from "./customComponents/SMUI_Dialog.svelte";
import {InsuranceModelEnvironment} from "@freon4dsl/samples-docuproject";
import DatePicker from "./customComponents/DatePicker.svelte";
// import {ExternalModelEnvironment} from "@freon4dsl/samples-external-tester";

/**
 * The one and only reference to the actual language for which this editor runs
 */
WebappConfigurator.getInstance().setEditorEnvironment(InsuranceModelEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
// WebappConfigurator.getInstance().setServerCommunication(LionWebRepositoryCommunication.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());

/**
 * Make the external components known to Freon before starting the app!
 */
setCustomComponents([
	{component: ShowAnimatedGif, knownAs: "AnimatedGif"},
	{component: SMUI_Card_Component, knownAs: "SMUI_Card"},
	{component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
	{component: SMUI_Dialog, knownAs: "SMUI_Dialog"},
	{component: DatePicker, knownAs: "DatePicker"}
]);

/**
 * Now start the app ...
 */
const app = new FreonLayout({
	target: document.body,
});
export default app;
