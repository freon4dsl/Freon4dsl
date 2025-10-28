import { FreLionwebSerializer, FreModelUnit } from "@freon4dsl/core";
import { LanguageRegistry, LionWebValidator } from "@lionweb/validation";
import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
import fs from "fs";
import path from "path"
import { PrimitiveType, MessageGroup, ObjectType, Type, Types, Protocol } from "../language/gen/index.js"

// import { AstTemplate } from "./templates/AstTemplate.js";
// import { IdTemplate } from "./templates/IdTemplate.js";
import { TypeTemplates } from "./templates/TypeTemplates.js"

const pathSeparator = path.sep

export class ConvertDelta2TypescriptAction extends CommandLineAction {
    protected model: CommandLineStringParameter;
    protected lionWebM3File: CommandLineStringParameter;
    protected allModelUnits: FreModelUnit[] = [];
    protected protocol: Protocol = new Protocol();

    constructor() {
        super({
            actionName: "folder",
            summary: "Create .ts file from Delta model in folder",
            documentation: "Lionweb Delta to TypeScript types generator"
        });
        this.defineParameters()
        this.protocol.name = "DeltaProtocol"
    }

    protected defineParameters(): void {
        this.lionWebM3File = this.defineStringParameter({
            argumentName: "DELTA_MODEL_FOLDER",
            parameterLongName: "--folder",
            parameterShortName: "-f",
            description: "Folder containing delta definitions in json format"
        });
    }

    protected async onExecute(): Promise<void> {
        const self = this;
        await self.convertDelta2ts()
        return null
    }
    
    async convertDelta2ts(): Promise<string> {
        let language: string = "unknownLanguage"
        const deltaFolderName = this.lionWebM3File.value
        if (fs.existsSync(deltaFolderName)) {
            const stats = fs.statSync(deltaFolderName);
            if (stats.isDirectory()) {
                this.createDirIfNotExisting(deltaFolderName + "/generated_ts")
                fs.readdirSync(deltaFolderName).forEach(file => {
                    if (file.endsWith(".json")) {
                        this.readModelUnitFromFile(deltaFolderName + '/' + file)
                    } else {
                        console.log(`Ignoring file ${file}, not a json extension`)
                    }
                });
            } else {
                console.error(`ERROR: Argument ${deltaFolderName} is not a directory`);
                return "error"
            }
        } else {
            console.error(`ERROR: File or folder ${deltaFolderName} does not exist`)
            return "error"
        }

        this.createDirIfNotExisting(deltaFolderName + "/generated_ts")

        const enumerations: string[] = [];
        const primitiveTypes: string[] = [];
        const messageGroups: MessageGroup[] = []
        const types: Types[] = []
        for (const ts of this.allModelUnits) {
            if (ts.freLanguageConcept() === "MessageGroup") {
                messageGroups.push(ts as MessageGroup)
                this.protocol.categories.push(ts as MessageGroup)
            }
            if (ts.freLanguageConcept() === "Types") {
                types.push(ts as Types)
                this.protocol.typeDefinitions.push(ts as Types)
            }
        }
        this.protocol.categories.forEach(cat => {
            console.log(`GENERATING message group ${cat.name}`)
            // const eventDefinitions = messageGroups.find(mg => mg.name === "Event")
            const eventTemplate = new TypeTemplates(cat, "https://github.com/LionWeb-io/specification/blob/main/delta/events.adoc#evnt")
            // const result = eventTemplate.commandTemplate();
            const result = TypeTemplates.pretty(eventTemplate.commandTemplate(), "Generated from LionWeb Delta Model");
            this.writeToFile(`${deltaFolderName}${pathSeparator}generated_ts${pathSeparator}${cat.name}.ts`, result);
        })
        this.protocol.typeDefinitions.forEach(typeDef => {
            console.log(`GENERATING types ${typeDef.name}`)
            // const eventDefinitions = messageGroups.find(mg => mg.name === "Event")
            const eventTemplate = new TypeTemplates(null, "https://github.com/LionWeb-io/specification/blob/main/delta/events.adoc#evnt")
            const result = TypeTemplates.pretty(eventTemplate.typeTemplate(typeDef), "Generated from LionWeb Delta Model");
            this.writeToFile(`${deltaFolderName}${pathSeparator}generated_ts${pathSeparator}${typeDef.name}.ts`, result);
        })

        
        // for (const ts of this.allModelUnits) {
        //     const lion2freon = new AstTemplate(enumerations, primitiveTypes, partitions);
        //     const result = lion2freon.generateFreonAst(ts);
        //     this.writeAstToFile(`${deltaFolderName}${pathSeparator}generated_ts${pathSeparator}${ts.name}`, result);
        // }
        // Find model name as language name
        // const separatorIndex = deltaFolderName.lastIndexOf(pathSeparator)
        // if (separatorIndex !== -1) {
        //     language = deltaFolderName.substring(separatorIndex + 1)
        // } else {
        //     language = deltaFolderName
        // }
        
        return "void";
    }

    /**
     * 
     */
    readModelUnitFromFile(filename: string): void {
        const serialzer = new FreLionwebSerializer();
        let metamodel= JSON.parse(fs.readFileSync(filename).toString());
        // Assume it us a language in the rest of the method
        // TODO call validator to check this.
        const validator = new LionWebValidator(metamodel, new LanguageRegistry())
        validator.validateSyntax()
        validator.validateReferences()
        if (validator.validationResult.hasErrors()) {
            for(const err of validator.validationResult.issues) {
                console.log("Issue: " + err.errorMsg())
            }
            // return null
        }
        const ts = serialzer.toTypeScriptInstance(metamodel);
        this.allModelUnits.push(ts as FreModelUnit);
    }

    writeToFile(filename: string, tsCode: string): void {
        console.log(`Writing to file ${filename }`)
        fs.writeFileSync(filename, tsCode);
    }

    createDirIfNotExisting(dir: string) {
        const parts = dir.split("/");
        let current = ".";
        for (const part of parts) {
            current = current + "/" + part;
            if (!fs.existsSync(current)) {
                console.log("creating folder: [" + current + "] as part of " + dir);
                fs.mkdirSync(current);
            }
        }
    }
}
