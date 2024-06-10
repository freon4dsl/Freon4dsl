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

describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });

    test("is able to simulate visits", () => {
        let sim = new Sim.Sim();
        sim.addEntity(Schedule);
        sim.setLogger(function (str) {
           log(str);
        });
      
        let results = sim.simulate(50); 
        log("sim.simulate results:" + results);
      
    });

});
