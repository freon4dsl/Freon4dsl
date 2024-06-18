import { StudyConfiguration } from "../../../playground/src/StudyConfiguration/language/gen";
import { ScheduledStudyConfiguration } from "../timeline/ScheduledStudyConfiguration";
import { Simulator } from "../timeline/Simulator";
import * as utils from "./Utils";

describe ("Access to simulation data", () => {
  
    // var simulator;
    var studyConfiguration: StudyConfiguration;
    var scheduledStudyConfiguration: ScheduledStudyConfiguration;
  
    beforeAll(() => {
      studyConfiguration = utils.setupEnvironment();
      // simulator = new Simulator(studyConfiguration);
      utils.setupEnvironment();
      studyConfiguration = utils.addAPeriodAndTwoEvents(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);
      scheduledStudyConfiguration = new ScheduledStudyConfiguration(studyConfiguration);

    });
  
    it ("can access to the first period of the trial" , () => {
      // GIVEN a scheduled study configuration with one period and two events
      // See beforeAll()

      // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
      let scheduledPeriod = scheduledStudyConfiguration.getFirstScheduledPeriod();

      // Then the first scheduled Period is Screening
      expect(scheduledPeriod.configuredPeriod.name).toEqual("Screening");
    });

    it ("can access to the first event of the first period of the trial" , () => {
      // GIVEN a scheduled study configuration with one period and two events
      // See beforeAll()

      // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
      let scheduledEvent = scheduledStudyConfiguration.getFirstEvent();

      // Then the first scheduled Period is Screening
      if (scheduledEvent) {
        expect(scheduledEvent.configuredEvent.name).toEqual("Visit 1");
      } else {
        throw new Error("No scheduled event found");
      }
    });

    it ("can access all the events in a period of the trial" , () => {
      // GIVEN a scheduled study configuration with one period and two events
      // See beforeAll()

      // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
      let scheduledPeriod = scheduledStudyConfiguration.getFirstScheduledPeriod();
      let scheduledEvents = scheduledStudyConfiguration.getAllEventsInAScheduledPeriod(scheduledPeriod);

      // Then the first scheduled Period is Screening
      if (scheduledEvents) {
        expect(scheduledEvents.length).toEqual(2);
        expect(scheduledEvents[0].configuredEvent.name).toEqual("Visit 1");
        expect(scheduledEvents[1].configuredEvent.name).toEqual("Visit 2");
      } else {
        throw new Error("No scheduled events found");
      }
    });

    

  });