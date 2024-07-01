import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../language/gen/index";
import { WebformTemplate } from "../templates/WebFormTemplate";

describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });
});


