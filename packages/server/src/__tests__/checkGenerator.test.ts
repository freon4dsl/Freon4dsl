import * as fs from "fs";
import request from "supertest";
import { FreModelUnit, FreModel, FreNode, FreLanguage, LwChunk, FreLogger, FreLionwebSerializer } from "@freon4dsl/core";
import * as classes from '../../../playground/src/StudyConfiguration/language/gen/index';
import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, WorkflowDescription } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { Schedule } from "./Schedule.js"
import log from "./SimpleLogger.js";
import { Simulator } from "./Simulator";


describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });

    test.only("is able to simulate visits", () => {
        let sim = new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
        let results = new Simulator().run();
        log("Simulator results:" + results);      
    });

});
