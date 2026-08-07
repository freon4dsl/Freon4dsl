import { mount } from 'svelte'
import { FlowbiteFreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/weblib-flowbite"
import { configureExternals } from "./externals.js"
import { configureLoggers } from "./loggers.js"
// import { LanguageEnvironment } from "@freon4dsl/samples-example"
import { LanguageEnvironment } from "@freon4dsl/samples-course-schedule"
// import { LanguageEnvironment } from "@freon4dsl/samples-scoper-test"
// import { LanguageEnvironment } from "@freon4dsl/samples-prim-projections"
import { CoreConfig, FreLanguage, FREON, FreonDeltaClient, LionWebRepositoryCommunication, ServerCommunication } from "@freon4dsl/core"

/**
 * Initialize everything for use with LionWeb Delta Protocol
 */
// await CoreConfig.initializeWithServers(
//     LanguageEnvironment.getInstance(),
//     // ServerCommunication.getInstance(),
//     LionWebRepositoryCommunication.getInstance(),
//     new FreonDeltaClient("freon", {
//         // hostname: "192.168.100.1", port: 3005, timeout: 20000
//         hostname: "127.0.0.1",
//         port: 3005,
//         timeout: 20000,
//     }),
// )
CoreConfig.initialize(
    LanguageEnvironment.getInstance(),
    ServerCommunication.getInstance(),
)
WebappConfigurator.getInstance()

ServerCommunication.getInstance().SERVER_URL = "http://localhost:8001/"

// LionWebRepositoryCommunication.getInstance().SERVER_URL = "http://localhost:8001/"

setDevelopment(true)
configureExternals()
configureLoggers()

const app = mount(FlowbiteFreonLayout, {
    target: document.getElementById('freon')!,
})

export default app

