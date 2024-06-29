import { Event, Day, RepeatCondition, RepeatUnit } from "../../language/gen/index";
import { InterpreterContext, isRtError, RtNumber } from "@freon4dsl/core";
import { MainStudyConfigurationModelInterpreter } from "../../interpreter/MainStudyConfigurationModelInterpreter";
import { EventInstance, Timeline } from "./Timeline";
import { repeat } from "lodash";

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
      if (!timeline) {
        console.log("ScheduledEvent.day() timeline is null: " + trace);
      } else {        
      if (timeline.currentDay > 8) {
        console.log("ScheduledEvent.day() trace: " + trace);
        }
      }
    }
    // console.log("ScheduledEvent.day() for: " + this.name() + " is: " + (value as RtNumber).value);
    return (value as RtNumber).value
  }


  // If a specific day is specified for the event to start on then return that day
  // otherwise return the number of days to wait from the timeline's current day.
  daysToWait(completedEvent: EventInstance,timeline: Timeline, timeNow: number) {
    if (completedEvent.scheduledEvent.name() === this.name() && this.isRepeatingEvent() && this.anyRepeatsNotCompleted(timeline)) {
      let waitInDays = this.daysTillNextRepeat(completedEvent);
      console.log("ScheduledEvent.daysToWait() for: " + this.name() + " is to be repeated on timeline day: " + timeline.currentDay + " with scheduledDay of: " + waitInDays );
      return waitInDays;
    }
    if (this.configuredEvent.schedule.eventStart instanceof Day) {
      console.log("ScheduledEvent.daysToWait() for: " + this.name() + " timeline.currentDay: " + timeline.currentDay + " day: " + this.day(timeline) + " result: " + this.day(timeline));
      return this.day(timeline);
    } else {
      console.log("ScheduledEvent.daysToWait() for: " + this.name() + " timeline.currentDay: " + timeline.currentDay + " day: " + this.day(timeline) + " result: " + (this.day(timeline) - timeline.currentDay));
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

  isRepeatingEvent(): boolean {
    return this.configuredEvent.schedule.eventRepeat instanceof RepeatCondition;
  }

  anyRepeatsNotCompleted(timeline: Timeline): boolean {
    if (this.isRepeatingEvent) {
      let repeatCondition = this.configuredEvent.schedule.eventRepeat as RepeatCondition;
      let numberCompletedInstances = timeline.numberCompletedInstancesOf(this);
      if (timeline.numberCompletedInstancesOf(this) < repeatCondition.maxRepeats) {
        console.log("anyRepeatsNotCompleted: " + this.name() + " timeline: " + timeline.currentDay + " maxRepeats: " + repeatCondition.maxRepeats + " numberCompletedInstances: " + numberCompletedInstances);
        return true;
      }
    }
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

  daysTillNextRepeat(completedEvent: EventInstance) {
    let repeatCondition = this.configuredEvent.schedule.eventRepeat as RepeatCondition;
    let repeatUnit = repeatCondition.repeatUnit.referred;
    let repeatDays = 0;
    switch (repeatUnit) {
      case RepeatUnit.daily:
        repeatDays = 1
        break;
      case RepeatUnit.weekly:
        repeatDays = 7
        break;
      case RepeatUnit.monthly:
        repeatDays = 30
        break;
      default:
        repeatDays = 0
    }
    return repeatDays;
  }

  /*
   * if this event has not been completed on a previous day and the timeline day is at or after the day this event is scheduled for then return a new EventInstance
   * otherwise return null.
   */
  getInstanceIfEventIsReadyToSchedule(completedEvent: EventInstance, timeline: Timeline): unknown {
    if (completedEvent.scheduledEvent.name() === this.name() && this.isRepeatingEvent() && this.anyRepeatsNotCompleted(timeline)) {
      return new EventInstance(this);
    } else {
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

}

