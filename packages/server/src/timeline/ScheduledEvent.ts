import { Event, Day } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../../playground/src/StudyConfiguration/interpreter/MainStudyConfigurationModelInterpreter";

/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
export class ScheduledEvent {
  configuredEvent: Event;
  
  constructor(event: Event) {
    this.configuredEvent = event;
  }

  day():number {
    // let day = this.event.schedule.eventStart as Day;
    let eventStart = this.configuredEvent.schedule.eventStart;
    const interpreter = new MainStudyConfigurationModelInterpreter()
		interpreter.setTracing(true);
		const value = interpreter.evaluate(eventStart);
		if(isRtError(value)){
			console.log("interpreter isRtError, value: " + value.toString());
		} else {
			const trace = interpreter.getTrace().root.toStringRecursive();
			console.log(trace);
		}
    return (value as RtNumber).value
  }

  name():string {
    return this.configuredEvent.name;
  } 

  dependency(): string {
    return null;
  }
}

