import { mount } from 'svelte'
import { FlowbiteFreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/weblib-flowbite"
import { configureExternals } from "./externals.js"
import { configureLoggers } from "./loggers.js"
// import { LanguageEnvironment } from "@freon4dsl/samples-insurance"
import { LanguageEnvironment } from "@freon4dsl/samples-course-schedule"
// import { LanguageEnvironment } from "@freon4dsl/samples-scoper-test"
// import { LanguageEnvironment } from "@freon4dsl/samples-optionalboxtest"
// import { LanguageEnvironment } from "@freon4dsl/samples-prim-projections"
import { CoreConfig, ServerCommunication } from "@freon4dsl/core"

/**
 * Initialize everything
 */
CoreConfig.initialize(
    LanguageEnvironment.getInstance(),
    ServerCommunication.getInstance(),
)
WebappConfigurator.getInstance()

ServerCommunication.getInstance().SERVER_URL = "http://localhost:8001/"

setDevelopment(true)
configureExternals()
configureLoggers()

const app = mount(FlowbiteFreonLayout, {
    target: document.getElementById('freon')!,
})

export default app

