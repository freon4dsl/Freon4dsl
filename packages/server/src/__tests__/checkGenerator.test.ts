import * as fs from "fs";
import request from "supertest";
import { FreModelUnit, FreModel, FreNode, FreLanguage, LwChunk, FreLogger, FreLionwebSerializer } from "@freon4dsl/core";
import * as classes from '../../../playground/src/StudyConfiguration/language/gen/index';
import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, WorkflowDescription } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";


describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });

});
