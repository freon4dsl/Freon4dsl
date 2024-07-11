import { FreLionwebSerializer, FreModelUnit, FreNode, FreNodeReference } from "@freon4dsl/core";
import { CommandLineAction, CommandLineStringListParameter, CommandLineStringParameter } from "@rushstack/ts-command-line";
import fs from "fs";
import { LwChunk } from "@freon4dsl/core";

import { LionWeb2FreonTemplate } from "./LionWeb2FreonTemplate";

export class ConvertLionCoreFolder2FreonAction extends CommandLineAction {
    protected metamodelfile: CommandLineStringParameter;
    protected metamodelFolder: CommandLineStringListParameter;

    constructor() {
        super({
            actionName: "file",
            summary: "Create .ast file from LionWeb Meta-model JSON file",
            documentation: "Lionweb to Freon."
        });
    }

    protected onDefineParameters(): void {
        this.metamodelFolder = this.defineStringListParameter({
            argumentName: "METAMODEL_FOLDER",
            parameterLongName: "--folder",
            parameterShortName: "-f",
            description: "Folder containing LionWeb metamodels in json format"
        });
    }

    protected onExecute(): Promise<void> {
        const self = this;
        return new Promise(function (resolve, rejest) {
            const freonString = self.convertLionCore2Freon();
        });
    }
    
    async convertLionCore2Freon(): Promise<string> {
        const serialzer = new FreLionwebSerializer();
        // const filename = this.metamodelfile.value;
        this.metamodelFolder.values.forEach(mmFile => {
            if (fs.existsSync(mmFile)) {
                const stats = fs.statSync(mmFile);
                if (stats.isDirectory()) {
                    fs.readdirSync(mmFile).forEach(file => {
                        let metamodel: LwChunk = JSON.parse(fs.readFileSync(mmFile + "/" + file).toString());
                        const ts = serialzer.toTypeScriptInstance(metamodel);
                        const result = (new LionWeb2FreonTemplate().generateFreonAst(ts as FreModelUnit));
                        console.log(`File ${mmFile}/${file}:`);
                        console.log(result);
                    })
                } else {
                    console.error(`Argument ${mmFile} is not a directory`);
                }
            }
        });
        return "void";
    }

}
