import { mount } from 'svelte'
import { FreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/webapp-lib"
import { configureExternals } from "./externals.js"
import { configureLoggers } from "./loggers.js"
import { LanguageEnvironment } from "@freon4dsl/samples-external-tester"
import { ServerCommunication } from "@freon4dsl/core"

/**
 * Initialize everything
 */
WebappConfigurator.getInstance().setEditorEnvironment(LanguageEnvironment.getInstance())
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance())
setDevelopment(true)
configureExternals()
configureLoggers()

const app = mount(FreonLayout, {
    target: document.getElementById('freon')!,
})

export default app

