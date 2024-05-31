import * as fs from "fs";
import request from "supertest";
import { FreModelUnit, FreModel, FreNode, FreLanguage, LwChunk, FreLogger, FreLionwebSerializer } from "@freon4dsl/core";
// import * as classes from '../../../playground/src/StudyConfiguration/language/gen/index';
import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import { StudyConfiguration } from "../../../playground/src/StudyConfiguration/language/gen/StudyConfiguration";

describe("Generate Study Site", () => {

    test(" is able to generate a file from a model", async () => {

        FreLogger.muteAllLogs();
        const tmp = StudyConfigurationModelEnvironment.getInstance();
        const serializer = new FreLionwebSerializer();
        let metaModel: LwChunk = JSON.parse(fs.readFileSync("./modelstore/StudyConfiguration/Study2.json").toString());
        console.log("Instance:" + JSON.stringify(FreLanguage.getInstance()));
        const ts = serializer.toTypeScriptInstance(metaModel);
        let model: StudyConfiguration = ts as StudyConfiguration;
        console.log("model:" + JSON.stringify(model.freId()));
    });

});
