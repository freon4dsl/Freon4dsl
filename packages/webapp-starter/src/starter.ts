import { FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";
import { AST, FreLogger, ServerCommunication } from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import { setCustomComponents } from "@freon4dsl/core-svelte";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {ExampleEnvironment} from "@freon4dsl/samples-example";
import { EditorState } from "@freon4dsl/webapp-lib";
WebappConfigurator.getInstance().setEditorEnvironment(ExampleEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
// WebappConfigurator.getInstance().setServerCommunication(LionWebRepositoryCommunication.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());

/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});

FreLogger.unmute("FreEditor")
FreLogger.unmute("EditorState")

AST.afterChange( () => {
    console.log("MY CHANGE FUNCTION")
    EditorState.getInstance().getErrors()
    console.log("MY CHANGE FUNCTION END")
})

// FreLogger.unmute("TextDropdownComponent")
export default app;
