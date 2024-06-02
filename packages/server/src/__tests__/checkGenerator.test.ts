import * as fs from "fs";
import request from "supertest";
import { FreModelUnit, FreModel, FreNode, FreLanguage, LwChunk, FreLogger, FreLionwebSerializer } from "@freon4dsl/core";
import * as classes from '../../../playground/src/StudyConfiguration/language/gen/index';
import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, WorkflowDescription } from "../../../playground/src/StudyConfiguration/language/gen/index";  


function loadModel(modelName: string): StudyConfiguration {
    FreLogger.muteAllLogs();
    const tmp = StudyConfigurationModelEnvironment.getInstance();
    const serializer = new FreLionwebSerializer();
    let metaModel: LwChunk = JSON.parse(fs.readFileSync(`./modelstore/StudyConfiguration/${modelName}.json`).toString());
    const ts = serializer.toTypeScriptInstance(metaModel);
    let model: StudyConfiguration = ts as StudyConfiguration;
    console.log(`Study Configuration name: ${model.name}`);
    console.log("before periods:" + model.periods.length);
    model.periods.forEach(p => {console.log("period name:" + p.name)});
    model.periods.forEach(p => {p.events.forEach(e => {console.log("Event Description:" + e.description.text)})});
    model.periods.forEach(p => {p.events.forEach(e => {e.checkList.activities.forEach(a => {
        let decision = a.decision as WorkflowDescription;
        // console.log("decision:" + decision.text.text) })})}); //Needed when WorkflowDescription has Decision member
        console.log("decision:" + decision.text) })})});
    console.log("model:" + JSON.stringify(model.freId()));
    return model;
}

describe("Generate Study Site", () => {

    test(" is able to generate a file from a model", async () => {
        let model: StudyConfiguration = loadModel("Study2");
        // Get the event that the checklist is for
        var event = model.periods[0].events[0];
        // Get the list of activities that go on this form
        var activities = model.periods[0].events[0].checkList.activities;
        let template = 
`
# TASK WEBFORM - ${event.name} 
langcode: en
${activities.map (a => `someText followed by each value ${((a.decision as WorkflowDescription).text)}`).join("\n")}`;
        console.log("template:" + template);
    });

//     test ("is able to generate a string from a template", async () => {
//         let collection =  { name: 's1234', webform:[ { name: 'Alice', age: 25 },
//             { name: 'Bob', age: 30 },
//             { name: 'Charlie', age: 35 }]
//         };
//         let v1 = "name";
//     });

});
