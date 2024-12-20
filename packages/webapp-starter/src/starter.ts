import { FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";
import {FreLogger, ServerCommunication} from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"
import { setDevelopment } from "@freon4dsl/webapp-lib";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {UndefinedEnvironment} from "@freon4dsl/samples-example";
WebappConfigurator.getInstance().setEditorEnvironment(UndefinedEnvironment.getInstance());

// import {LionCore_M3Environment} from "@freon4dsl/samples-lioncore";
// WebappConfigurator.getInstance().setEditorEnvironment(LionCore_M3Environment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
// WebappConfigurator.getInstance().setServerCommunication(LionWebRepositoryCommunication.getInstance());
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());

setDevelopment(true)

/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});
FreLogger.unmute("FreLionwebSerializer")
FreLogger.unmute("MobxDecorators")
// FreLogger.unmute("TextComponent")
// FreLogger.unmute("TextDropdownComponent")
// FreLogger.unmute("DropdownComponent")
// FreLogger.unmute("EditorState")
// FreLogger.unmute("InMemoryModel")
// FreLogger.unmute("TextComponent")
FreLogger.unmute("ServerCommunication")
FreLogger.setFilter(["beforeUpdate", "setFocus", "afterUpdate", "onMount", "REFRESH", "refresh"])

export default app;
