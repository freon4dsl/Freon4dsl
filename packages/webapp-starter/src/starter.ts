import { FreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/webapp-lib";
import { ServerCommunication} from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import { setCustomComponents } from "@freon4dsl/core-svelte";

// For DocuProject:
import ShowAnimatedGif from "./customComponents/forDocuProject/ShowAnimatedGif.svelte";
import SMUI_Card_Component from "./customComponents/forDocuProject/SMUI_Card_Component.svelte";
import SMUI_Accordion from "./customComponents/forDocuProject/SMUI_Accordion.svelte";
import SMUI_Dialog from "./customComponents/forDocuProject/SMUI_Dialog.svelte";
import DatePicker from "./customComponents/forDocuProject/DatePicker.svelte";
import {InsuranceModelEnvironment} from "@freon4dsl/samples-docuproject";

// For ExternalTester
// import BooleanWrapperComponent from "./customComponents/forExternalTester/BooleanWrapperComponent.svelte";
// import NumberWrapperComponent from "./customComponents/forExternalTester/NumberWrapperComponent.svelte";
// import StringWrapperComponent from "./customComponents/forExternalTester/StringWrapperComponent.svelte";
// import FragmentWrapperComponent from "./customComponents/forExternalTester/FragmentWrapperComponent.svelte";
// import ExternalStringComponent from "./customComponents/forExternalTester/ExternalStringComponent.svelte";
// import ExternalSimpleComponent from "./customComponents/forExternalTester/ExternalSimpleComponent.svelte";
// import ExternalRefListComponent from "./customComponents/forExternalTester/ExternalRefListComponent.svelte";
// import ExternalRefComponent from "./customComponents/forExternalTester/ExternalRefComponent.svelte";
// import ExternalPartListComponent from "./customComponents/forExternalTester/ExternalPartListComponent.svelte";
// import ExternalPartComponent from "./customComponents/forExternalTester/ExternalPartComponent.svelte";
// import ExternalNumberComponent from "./customComponents/forExternalTester/ExternalNumberComponent.svelte";
// import ExternalBooleanComponent from "./customComponents/forExternalTester/ExternalBooleanComponent.svelte";
// import PartWrapperComponent from "./customComponents/forExternalTester/PartWrapperComponent.svelte";
// import PartListWrapperComponent from "./customComponents/forExternalTester/PartListWrapperComponent.svelte";
// import RefWrapperComponent from "./customComponents/forExternalTester/RefWrapperComponent.svelte";
// import RefListWrapperComponent from "./customComponents/forExternalTester/RefListWrapperComponent.svelte";
// import { ExternalModelEnvironment } from "@freon4dsl/samples-external-tester";

/**
 * The one and only reference to the actual language for which this editor runs
 */
WebappConfigurator.getInstance().setEditorEnvironment(InsuranceModelEnvironment.getInstance());
setDevelopment(true)
/**
 * The one and only reference to the server on which the models are stored
 */
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());

/**
 * Make the external components known to Freon before starting the app!
 */
// For DocuProject:
setCustomComponents([
	{component: ShowAnimatedGif, knownAs: "AnimatedGif"},
	{component: SMUI_Card_Component, knownAs: "SMUI_Card"},
	{component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
	{component: SMUI_Dialog, knownAs: "SMUI_Dialog"},
	{component: DatePicker, knownAs: "DatePicker"}
]);
// For ExternalTester:
// setCustomComponents([
//     { component: BooleanWrapperComponent, knownAs: "booleanWrapper" },
//     { component: FragmentWrapperComponent, knownAs: "fragmentWrapper" },
//     { component: NumberWrapperComponent, knownAs: "numberWrapper" },
//     { component: PartWrapperComponent, knownAs: "partWrapper" },
//     { component: PartListWrapperComponent, knownAs: "partListWrapper" },
//     { component: RefWrapperComponent, knownAs: "refWrapper" },
//     { component: RefListWrapperComponent, knownAs: "refListWrapper" },
//     { component: StringWrapperComponent, knownAs: "stringWrapper" },
//
//     { component: ExternalBooleanComponent, knownAs: "booleanReplacer" },
//     { component: ExternalNumberComponent, knownAs: "numberReplacer" },
//     { component: ExternalPartComponent, knownAs: "partReplacer" },
//     { component: ExternalPartListComponent, knownAs: "partListReplacer" },
//     { component: ExternalRefComponent, knownAs: "refReplacer" },
//     { component: ExternalRefListComponent, knownAs: "refListReplacer" },
//     { component: ExternalSimpleComponent, knownAs: "simple" },
//     { component: ExternalStringComponent, knownAs: "stringReplacer" },
// ]);

/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});
// FreLogger.unmute("FreLionwebSerializer")
// FreLogger.unmute("MobxDecorators")
// FreLogger.unmute("TextComponent")
// FreLogger.unmute("TextDropdownComponent")
// FreLogger.unmute("DropdownComponent")
// FreLogger.unmute("EditorState")
// FreLogger.unmute("InMemoryModel")
// FreLogger.unmute("TextComponent")
// FreLogger.unmute("ServerCommunication")
// FreLogger.setFilter(["beforeUpdate", "setFocus", "afterUpdate", "onMount", "REFRESH", "refresh"])

export default app;
