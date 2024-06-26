import { Event, Day } from "../../language/gen/index";
import { InterpreterContext, isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../interpreter/MainStudyConfigurationModelInterpreter";
import { EventInstance, Timeline } from "./Timeline";

export enum ScheduledEventState {
  Initial,
  Ready,
  Active,
  Scheduled,
  Completed
};

/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
export class ScheduledEvent {
  configuredEvent: Event;
  state = ScheduledEventState.Initial;

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
    // console.log("ScheduledEvent.day() for: " + this.name() + " is: " + (value as RtNumber).value);
    return (value as RtNumber).value
  }


  // If a specific day is specified for the event to start on then return that day
  // otherwise return the number of days to wait from the timeline's current day.
  daysToWait(timeline: Timeline) {
    if (this.configuredEvent.schedule.eventStart instanceof Day) {
      return this.day(timeline);
    } else {
      return this.day(timeline) - timeline.currentDay;
    }
  }

  getState(): ScheduledEventState {
    return this.state;
  }

  setState(state: ScheduledEventState) {
    this.state = state;
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


  notYetScheduled(timeline): boolean {
    try {
      console.log('notYetScheduled: ' + this.name() + ' timeline: ' + timeline.currentDay + ' day: ' + this.day(timeline) + ' result: ' + (this.anyRepeatsNotCompleted(timeline) || this.getState() === ScheduledEventState.Initial));
      // return this.anyRepeatsNotCompleted(timeline) || timeline.noCompletedInstanceOf(this);
      return this.anyRepeatsNotCompleted(timeline) || this.getState() === ScheduledEventState.Initial;
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
  getInstanceIfEventIsReadyToSchedule(timeline: Timeline): unknown {
    let scheduledDay = this.day(timeline);
    if (timeline.noCompletedInstanceOf(this) && scheduledDay != undefined && scheduledDay >= timeline.currentDay) {
      console.log("getInstanceIfEventIsReady: " + this.name() + " is to be scheduled on timeline day: " + timeline.currentDay + " with scheduledDay of: " + scheduledDay );
      return new EventInstance(this);
    } else {
      console.log("getInstanceIfEventIsReady: " + this.name() + " is NOT to be scheduled on timeline day: " + timeline.currentDay + " with scheduledDay of: " + scheduledDay );
      return null;
    }
  }

}

