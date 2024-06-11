import { Event, Day } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../../playground/src/StudyConfiguration/interpreter/MainStudyConfigurationModelInterpreter";

/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
export class ScheduledEvent {
  event: Event;
  
  constructor(event: Event) {
    this.event = event;
  }

  day():number {
    let day = this.event.schedule.eventStart as Day;
    const interpreter = new MainStudyConfigurationModelInterpreter()
		interpreter.setTracing(true);
		const value = interpreter.evaluate(day);
		if(isRtError(value)){
			console.log("interpreter returned value: " + value.toString());
		} else {
			const trace = interpreter.getTrace().root.toStringRecursive();
			console.log(trace);
		}

    return (value as RtNumber).value
  }

  name():string {
    return this.event.name;
  } 

  dependency(): string {
    return null;
  }
}

