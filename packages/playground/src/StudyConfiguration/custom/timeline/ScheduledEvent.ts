import { Event, Day } from "../../language/gen/index";
import { InterpreterContext, isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../interpreter/MainStudyConfigurationModelInterpreter";
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
      // console.log(trace);
    }
    return (value as RtNumber).value
  }

  name(): string {
    return this.configuredEvent.name;
  }

  dependency(): string {
    return null;
  }

  anyRepeatsNotCompleted(timeline: Timeline): boolean {
    // Copilot suggested:
    // let repeatableEvents = this.getAllScheduledEvents().filter(scheduledEvent => scheduledEvent.configuredEvent.schedule.repeatable);
    // let repeatableEventsNotCompleted = repeatableEvents.filter(scheduledEvent => !timeline.hasCompletedInstanceOf(scheduledEvent));
    // return repeatableEventsNotCompleted.length > 0;
    return false;
  }


  notYetScheduled(timeline) {
    try {
      return this.anyRepeatsNotCompleted(timeline) && timeline.noCompletedInstanceOf(this);
    }
    catch (e) {
      console.log("notYetScheduled caught exception: " + e.toString());
      // This exception is expected to happen when Event has dependency on another event that has not been completed so evaluation of FirstScheduled fails.
      return false;
    }
  }

  /*
   * if this event has not been completed on a previous day and the timeline day is at or after the day this event is scheduled for then return a new EventInstance
   * otherwise return null.
   */
  getInstanceIfEventIsReady(timeline: Timeline): unknown {
    if (timeline.noCompletedInstanceOf(this) && this.day(timeline) <= timeline.currentDay) {
      return new EventInstance(this);
    } else {
      return null;
    }
  }

}

