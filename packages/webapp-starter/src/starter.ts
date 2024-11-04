import { FreonLayout, WebappConfigurator } from "@freon4dsl/webapp-lib";
import {FreLogger, ServerCommunication} from "@freon4dsl/core";
// import { LionWebRepositoryCommunication } from "@freon4dsl/core"

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {ExampleEnvironment} from "@freon4dsl/samples-example";
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

// FreLogger.unmute("FreProjectionHandler")
// FreLogger.unmute("TextComponent")
// FreLogger.unmute("TextDropdownComponent")
// FreLogger.unmute("DropdownComponent")
FreLogger.unmute("ActionBox")
FreLogger.unmute("BehaviorUtils")
FreLogger.setFilter(["beforeUpdate", "afterUpdate", "onMount", "REFRESH", "refresh", "setting text to"])
export default app;
