// import { DeltaCommandSchema, DeltaEventSchema, DeltaQuerySchema, DeltaSharedSchema } from "@lionweb/server-delta-definitions"
// import fs from "fs"
// import { ProcessorTemplate } from "./ProcessorTemplate.js"
// import { TypeTemplates } from "./TypeTemplates.js"
//
// /**
//  * All the target files and folders, following the package structure.
//  */
// const commandTargetFile = "../packages/delta-shared/src/types/CommandTypes.ts"
// const eventTargetFile = "../packages/delta-shared/src/types/EventTypes.ts"
// const sharedTargetFile = "../packages/delta-shared/src/types/SharedTypes.ts"
// const queryTargetFile = "../packages/delta-shared/src/types/QueryTypes.ts"
//
// const eventTemplate = new TypeTemplates(DeltaEventSchema, "https://github.com/LionWeb-io/specification/blob/main/delta/events.adoc#evnt", "Event")
// const commandTemplate = new TypeTemplates(DeltaCommandSchema, "https://github.com/LionWeb-io/specification/blob/main/delta/commands.adoc#cmd", "Command")
//
// const commands = commandTemplate.commandTemplate()
// const events = eventTemplate.commandTemplate()
// const shared = eventTemplate.sharedTemplate(DeltaSharedSchema, "https://github.com/LionWeb-io/specification/blob/main/delta/introduction.adoc#")
// const queries = eventTemplate.sharedTemplate(DeltaQuerySchema, "https://github.com/LionWeb-io/specification/blob/main/delta/introduction.adoc#")
//
// fs.writeFileSync(commandTargetFile, TypeTemplates.pretty(commands, "LionWeb Types Generator"));
// fs.writeFileSync(eventTargetFile, TypeTemplates.pretty(events, "LionWeb Types Generator"));
// fs.writeFileSync(sharedTargetFile, TypeTemplates.pretty(shared, "LionWeb Types Generator"));
// fs.writeFileSync(queryTargetFile, TypeTemplates.pretty(queries, "LionWeb Types Generator"));

// const processEventFile = "../packages/delta-client/src/delta/EventProcessor.ts"
// const processEventDir = "../packages/delta-client/src/delta/processors/EventProcessor.ts"
// const processCommandFile = "../packages/delta-server/src/delta/CommandProcessor.ts"
// const processQueryFile = "../packages/delta-server/src/delta/QueryProcessor.ts"
// const processCommandDir = "../packages/delta-server/src/delta/processors/"
//
// const eventProcessorTemplate = new ProcessorTemplate(DeltaEventSchema, "Event")
// const commandProcessorTemplate = new ProcessorTemplate(DeltaCommandSchema, "Command")
// const queryProcessorTemplate = new ProcessorTemplate(DeltaQuerySchema, "Query")
//
// const processEvents = eventProcessorTemplate.mapTemplate()
// const processCommands = commandProcessorTemplate.mapTemplate()
// const processQuery = queryProcessorTemplate.mapTemplate()
//
// fs.writeFileSync(processEventFile, TypeTemplates.pretty(processEvents, "LionWeb Types Generator"));
// fs.writeFileSync(processCommandFile, TypeTemplates.pretty(processCommands, "LionWeb Types Generator"));
// fs.writeFileSync(processQueryFile, TypeTemplates.pretty(processQuery, "LionWeb Types Generator"));
