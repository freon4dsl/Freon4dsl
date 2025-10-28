import { mount } from 'svelte'
import { FlowbiteFreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/weblib-flowbite"
import { configureExternals } from "./externals.js"
import { configureLoggers } from "./loggers.js"
// import { LanguageEnvironment } from "@freon4dsl/samples-example"
import { LanguageEnvironment } from "@freon4dsl/samples-insurance"
// import { LanguageEnvironment } from "@freon4dsl/samples-course-schedule"
// import { LanguageEnvironment } from "@freon4dsl/samples-scoping-example"
import { ServerCommunication } from "@freon4dsl/core"

/**
 * Initialize everything
 */
WebappConfigurator.getInstance().setEnvironment(
  LanguageEnvironment.getInstance(),
  ServerCommunication.getInstance(),
);

ServerCommunication.getInstance().SERVER_URL = "http://localhost:8001/"

setDevelopment(true)
configureExternals()
configureLoggers()

const app = mount(FlowbiteFreonLayout, {
    target: document.getElementById('freon')!,
})

export default app

