import {FreonLayout, WebappConfigurator} from "@freon4dsl/webapp-lib";
import {ServerCommunication} from "@freon4dsl/core";
import {setCustomComponents} from "@freon4dsl/core-svelte";
import PersonIcon from "./customComponents/forCourseSchedule/PersonIcon.svelte";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import {CourseScheduleEnvironment} from "@freon4dsl/samples-course-schedule";
WebappConfigurator.getInstance().setEditorEnvironment(CourseScheduleEnvironment.getInstance());

/**
 * The one and only reference to the server on which the models are stored
 */
WebappConfigurator.getInstance().setServerCommunication(ServerCommunication.getInstance());

/**
 * Make the external components known to Freon before starting the app!
 */
setCustomComponents([
    { component: PersonIcon, knownAs: "PersonIcon" }
]);

/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});

export default app;
