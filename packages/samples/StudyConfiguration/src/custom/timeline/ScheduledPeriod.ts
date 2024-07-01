
import { Period } from "../../language/gen/index";
import { ScheduledEvent } from "./ScheduledEvent";

export class ScheduledPeriod {
  configuredPeriod: Period;
  scheduledEvents: ScheduledEvent[] = [];

  constructor (configuredPeriod: Period) {
    this.configuredPeriod = configuredPeriod;
    this.scheduledEvents = configuredPeriod.events.map(event => {return new ScheduledEvent(event)});
  }

  getAllScheduledEvents() {
    return this.scheduledEvents;
  }

  name() {
    return this.configuredPeriod.name;
  }

}