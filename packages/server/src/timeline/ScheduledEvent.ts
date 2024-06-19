import { Event, Day } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { InterpreterContext, isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../../playground/src/StudyConfiguration/interpreter/MainStudyConfigurationModelInterpreter";
import { EventInstance, Timeline } from "./Timeline";

/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
export class ScheduledEvent {
  configuredEvent: Event;

  constructor(event: Event) {
    this.configuredEvent = event;
  }

  day(timeline: Timeline): number {
    // let day = this.event.schedule.eventStart as Day;
    let eventStart = this.configuredEvent.schedule.eventStart;
    const interpreter = new MainStudyConfigurationModelInterpreter()
    interpreter.setTracing(true);
    let ctx = InterpreterContext.EMPTY_CONTEXT;
    ctx.set("timeline", timeline);
    const value = interpreter.evaluateWithContext(eventStart, ctx);
    if (isRtError(value)) {
      console.log("interpreter isRtError, value: " + value.toString());
    } else {
      const trace = interpreter.getTrace().root.toStringRecursive();
      console.log(trace);
    }
    return (value as RtNumber).value
  }

  name(): string {
    return this.configuredEvent.name;
  }

  dependency(): string {
    return null;
  }

  /*
   * if this event has not been completed on a previous day and the timeline day is at or after the day this event is scheduled for then return a new EventInstance
   * otherwise return null.
   */
  getInstanceIfEventIsReady(timeline: Timeline): unknown {
    console.log("this.day(): " + this.day());
    console.log("timeline.currentDay: " + timeline.currentDay);
    console.log("timeline.hasCompletedInstanceOf(this): " + timeline.hasCompletedInstanceOf(this));
    if (!timeline.hasCompletedInstanceOf(this) && this.day(timeline) <= timeline.currentDay) {
      return new EventInstance(this);
    } else {
      console.log("getInstanceIfEventIsReady returning null for:"+ this.name());
      return null;
    }
  }
}

